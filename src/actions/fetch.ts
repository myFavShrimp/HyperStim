import { xhrFetch, XHRFetchOptions } from "../xhr-fetch.ts";
import { patchSignals, signal, SignalsPatchData } from "../signals.ts";
import { ReadSignal, ReadWriteSignal } from "../types.ts";
import { parseMode, patchElements, resolveTarget } from "../dom.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

type State = "initial" | "pending" | "success" | "error" | "aborted";
type Progress = {
    loaded: number;
    total: number;
    percent: number;
    lengthComputable: boolean;
};
export type FetchAction = {
    state: ReadSignal<State>;
    error: ReadSignal<unknown> | undefined;
    uploadProgress: ReadSignal<Progress>;
    downloadProgress: ReadSignal<Progress>;
    options: ReadWriteSignal<XHRFetchOptions>;
    resource: ReadWriteSignal<RequestInfo | URL>;
    trigger: () => FetchAction;
    abort: () => void;
};

export function fetch(
    resource: RequestInfo | URL,
    options: XHRFetchOptions = {},
): FetchAction {
    const stateSignal = signal<State>("initial");
    const errorSignal = signal<unknown>(undefined);
    const optionsSignal = signal<XHRFetchOptions>(options);
    const resourceSignal = signal<RequestInfo | URL>(resource);
    let abortController: AbortController | undefined;

    const uploadProgressSignal = signal<Progress>({
        loaded: 0,
        total: 0,
        percent: 0,
        lengthComputable: false,
    });
    const downloadProgressSignal = signal<Progress>({
        loaded: 0,
        total: 0,
        percent: 0,
        lengthComputable: false,
    });

    const triggerFetchImplementation = async () => {
        try {
            abortController?.abort();
            abortController = new AbortController();

            stateSignal("pending");
            const currentPayload = optionsSignal();
            const currentResource = resourceSignal();

            const response = await xhrFetch(currentResource, {
                ...currentPayload,
                signal: abortController.signal,
                onDownloadProgress: (
                    loaded,
                    total,
                    percent,
                    lengthComputable,
                ) => {
                    downloadProgressSignal({
                        loaded,
                        total,
                        percent,
                        lengthComputable,
                    });
                },
                onUploadProgress: (
                    loaded,
                    total,
                    percent,
                    lengthComputable,
                ) => {
                    uploadProgressSignal({
                        loaded,
                        total,
                        percent,
                        lengthComputable,
                    });
                },
            });

            await processResponse(response);

            stateSignal("success");
        } catch (error) {
            if (abortController?.signal.aborted) {
                stateSignal("aborted");
                return;
            }
            errorSignal(error);
            stateSignal("error");
        }
    };

    const detachedTriggerFetch = () => {
        // Use setTimeout to prevent browser loading indicator
        // for requests triggered immediately after load.
        setTimeout(triggerFetchImplementation, 0);
    };

    const action = {
        state: () => stateSignal(),
        error: () => errorSignal(),
        uploadProgress: () => uploadProgressSignal(),
        downloadProgress: () => downloadProgressSignal(),
        options: optionsSignal,
        resource: resourceSignal,
        trigger: () => {
            detachedTriggerFetch();
            return action;
        },
        abort: () => {
            abortController?.abort();
        },
    };

    return action;
}

async function processResponse(response: Response) {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("text/html")) {
        const patchTarget = response.headers.get("hs-target");

        if (!patchTarget) {
            console.error(
                "HyperStim ERROR: received content-type `text/html` but no hs-target header was specified",
            );

            return;
        }

        const targetElement = resolveTarget(patchTarget);

        const patchMode = parseMode(response.headers.get("hs-mode"));
        const responseText = await response.text();

        patchElements(responseText, targetElement, patchMode);
    } else if (contentType?.includes("application/json")) {
        const signalsData: SignalsPatchData = await response.json();

        patchSignals(signalsData);
    } else if (contentType?.includes("text/javascript")) {
        const clonedResponse = response.clone();
        const expression = await response.text();

        buildHyperStimEvaluationFn(
            expression,
            { this: clonedResponse },
            [],
        )();
    } else if (contentType?.includes("text/event-stream")) {
        console.error(
            "HyperStim ERROR: SSE responses should use the SSE action, not fetch action",
        );
    } else {
        console.error(
            "HyperStim ERROR: received unknown response content-type",
            contentType,
        );
    }
}
