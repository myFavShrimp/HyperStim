import { xhrFetch, XHRFetchOptions } from "../xhr-fetch.ts";
import { patchSignals, signal, SignalsPatchData } from "../signals.ts";
import { ReadSignal, ReadWriteSignal } from "../types.ts";
import { parseMode, patchElements, resolveTarget } from "../dom.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

type State = "initial" | "pending" | "success" | "error";
type Progress = {
    loaded: number;
    total: number | undefined;
    percent: number | undefined;
};
export type FetchAction = {
    state: ReadSignal<State>;
    error: ReadSignal<unknown> | undefined;
    uploadProgress: ReadSignal<Progress>;
    downloadProgress: ReadSignal<Progress>;
    options: ReadWriteSignal<XHRFetchOptions>;
    resource: ReadWriteSignal<RequestInfo | URL>;
    trigger: () => FetchAction;
};

export function fetch(
    resource: RequestInfo | URL,
    options: XHRFetchOptions = {},
): FetchAction {
    const stateSignal = signal<State>("initial");
    const errorSignal = signal<unknown>(undefined);
    const optionsSignal = signal<XHRFetchOptions>(options);
    const resourceSignal = signal<RequestInfo | URL>(resource);

    const uploadProgressSignal = signal<Progress>({
        loaded: 0,
        total: undefined,
        percent: undefined,
    });
    const downloadProgressSignal = signal<Progress>({
        loaded: 0,
        total: undefined,
        percent: undefined,
    });

    const triggerFetch = async () => {
        try {
            stateSignal("pending");
            const currentPayload = optionsSignal();
            const currentResource = resourceSignal();
            const response = await xhrFetch(currentResource, {
                ...currentPayload,
                onDownloadProgress: (loaded, total, percent) => {
                    downloadProgressSignal({ loaded, total, percent });
                },
                onUploadProgress: (loaded, total, percent) => {
                    uploadProgressSignal({ loaded, total, percent });
                },
            });

            await processResponse(response);

            stateSignal("success");
        } catch (error) {
            errorSignal(error);
            stateSignal("error");
        }
    };

    const action = {
        state: () => stateSignal(),
        error: () => errorSignal(),
        uploadProgress: () => uploadProgressSignal(),
        downloadProgress: () => downloadProgressSignal(),
        options: optionsSignal,
        resource: resourceSignal,
        trigger: () => {
            triggerFetch();
            return action;
        },
    };

    return action;
}

async function processResponse(response: Response) {
    const contentType = response.headers.get("content-type");

    switch (contentType) {
        case "text/html": {
            const patchTarget = response.headers.get("hs-target");

            if (!patchTarget) {
                console.error(
                    "HyperStim ERROR: received content-type `text/html` but no hs-target header was specified",
                );

                break;
            }

            const targetElement = resolveTarget(patchTarget);

            const patchMode = parseMode(response.headers.get("hs-mode"));
            const responseText = await response.text();

            patchElements(responseText, targetElement, patchMode);

            break;
        }
        case "application/json": {
            const signalsData: SignalsPatchData = await response.json();

            patchSignals(signalsData);

            break;
        }
        case "text/javascript": {
            const clonedResponse = response.clone();
            const expression = await response.text();

            buildHyperStimEvaluationFn(
                expression,
                { this: clonedResponse },
                [],
            )();

            break;
        }
        default:
            console.error(
                "HyperStim ERROR: received unknown response content-type",
                contentType,
            );
    }
}
