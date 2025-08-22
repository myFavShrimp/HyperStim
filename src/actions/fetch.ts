import { xhrFetch, XHRFetchOptions } from "../xhr-fetch.ts";
import { signal } from "../signals.ts";
import { ReadSignal, ReadWriteSignal } from "../types.ts";
import {
    AnyServerCommand,
    processCommand,
    UnknownCommandHandler,
} from "../commands.ts";

export interface FetchOptions extends XHRFetchOptions {
    onOther?: UnknownCommandHandler;
}

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
    options: ReadWriteSignal<FetchOptions>;
    resource: ReadWriteSignal<RequestInfo | URL>;
    trigger: () => FetchAction;
    abort: () => void;
};

export function fetch(
    resource: RequestInfo | URL,
    options: FetchOptions = {},
): FetchAction {
    const stateSignal = signal<State>("initial");
    const errorSignal = signal<unknown>(undefined);
    const optionsSignal = signal<FetchOptions>(options);
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

    const triggerFetch = async () => {
        try {
            abortController?.abort();
            abortController = new AbortController();

            stateSignal("pending");
            const currentOptions = optionsSignal();
            const currentResource = resourceSignal();

            const response = await xhrFetch(currentResource, {
                ...currentOptions,
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

            await processResponse(response, currentOptions.onOther);

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
        abort: () => {
            abortController?.abort();
        },
    };

    return action;
}

type FetchResponse = AnyServerCommand | AnyServerCommand[];

async function processResponse(
    response: Response,
    onOUnknownCommand?: UnknownCommandHandler,
) {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        const responseData: FetchResponse = await response.json();

        if (Array.isArray(responseData)) {
            for (const data of responseData) {
                processCommand(data, onOUnknownCommand);
            }
        } else {
            processCommand(responseData, onOUnknownCommand);
        }
    } else if (contentType?.includes("text/event-stream")) {
        console.error(
            "HyperStim ERROR: SSE responses should use the SSE action, not fetch action.",
        );
    } else {
        console.error(
            "HyperStim ERROR: received unknown response content-type",
            contentType,
        );
    }
}
