import { signal } from "../signals.ts";
import { ReadSignal, ReadWriteSignal } from "../types.ts";
import { getBytes, getLines, getMessages } from "../sse.ts";
import { processCommand, UnknownCommandHandler } from "../commands.ts";

export interface SseOptions extends RequestInit {
    openWhenHidden?: boolean;
    onOther?: UnknownCommandHandler;
}

type State = "initial" | "connecting" | "connected" | "error" | "closed";

export type SSEAction = {
    state: ReadSignal<State>;
    error: ReadSignal<unknown> | undefined;
    options: ReadWriteSignal<SseOptions>;
    resource: ReadWriteSignal<RequestInfo | URL>;
    connect: () => SSEAction;
    close: () => void;
};

const DefaultRetryInterval = 1000;

type InternalRetryIntervalSignal = ReadWriteSignal<number>;
type InternalAdditionalHeadersSignal = ReadWriteSignal<{
    "last-event-id"?: string;
}>;

export function sse(
    resource: RequestInfo | URL,
    options: SseOptions = {},
): SSEAction {
    const stateSignal = signal<State>("initial");
    const errorSignal = signal<unknown>(undefined);
    const optionsSignal = signal<SseOptions>(options);
    const resourceSignal = signal<RequestInfo | URL>(resource);

    let closeLastConnection: () => void | undefined;

    const internalRetryIntervalSignal: InternalRetryIntervalSignal = signal(
        DefaultRetryInterval,
    );
    const internalAdditionalHeadersSignal: InternalAdditionalHeadersSignal =
        signal({
            "last-event-id": undefined,
        });

    function onVisibilityChange() {
        closeLastConnection?.();

        if (!document.hidden) {
            connectToSseStream();
        }
    }

    const removeVisibilityChangeListener = () => {
        document.removeEventListener(
            "visibilitychange",
            onVisibilityChange,
        );
    };

    globalThis.addEventListener("beforeunload", function (_event) {
        // to prevent error logs because stream ends abruptly
        closeLastConnection?.();
    });

    const connectToSseStream = async (
        lastAbortController?: AbortController,
    ) => {
        try {
            if (lastAbortController?.signal.aborted) {
                return;
            }

            stateSignal("connecting");

            const currentAbortController = lastAbortController ??
                new AbortController();

            closeLastConnection = () => {
                currentAbortController.abort();
                stateSignal("closed");
            };

            const currentOptions = optionsSignal();
            const currentResource = resourceSignal();
            const additionalHeaders = internalAdditionalHeadersSignal();

            if (!currentOptions.openWhenHidden) {
                document.addEventListener(
                    "visibilitychange",
                    onVisibilityChange,
                );
            }

            const handleConnectionFailure = (error: unknown) => {
                if (!currentAbortController?.signal.aborted) {
                    console.error("HyperStim ERROR: SSE stream failed:", error);
                    setTimeout(
                        // Reuse abort controller to cancel the request
                        // if it has been aborted in the meantime.
                        () => connectToSseStream(currentAbortController),
                        internalRetryIntervalSignal(),
                    );

                    errorSignal(error);
                    stateSignal("error");
                }

                // Abortions are handled manually in the abort handler to avoid race conditions
            };

            const headers = {
                ...currentOptions.headers,
                ...additionalHeaders,
                accept: "text/event-stream",
            };

            let response;
            try {
                response = await fetch(currentResource, {
                    ...currentOptions,
                    headers,
                    signal: currentAbortController.signal,
                    openWhenHidden: undefined,
                } as RequestInit);
            } catch (error) {
                handleConnectionFailure(error);
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("text/event-stream")) {
                throw new Error(
                    `Expected content-type of sse action to be text/event-stream, Actual: ${contentType}`,
                );
            }

            try {
                stateSignal("connected");

                await handleSseResponse(
                    response,
                    internalRetryIntervalSignal,
                    internalAdditionalHeadersSignal,
                    currentOptions.onOther,
                );
            } catch (error) {
                handleConnectionFailure(error);
            }
        } catch (error) {
            errorSignal(error);
            stateSignal("error");
        }
    };

    const action = {
        state: () => stateSignal(),
        error: () => errorSignal(),
        options: optionsSignal,
        resource: resourceSignal,
        connect: () => {
            closeLastConnection?.();
            connectToSseStream();
            return action;
        },
        close: () => {
            removeVisibilityChangeListener();
            closeLastConnection?.();
        },
    };

    return action;
}

async function handleSseResponse(
    response: Response,
    retryIntervalSignal: InternalRetryIntervalSignal,
    internalAdditionalHeadersSignal: InternalAdditionalHeadersSignal,
    onUnknownEvent?: UnknownCommandHandler,
) {
    const body = response.body;
    if (!body) {
        throw new Error("Event stream response has no body.");
    }

    await getBytes(
        body,
        getLines(getMessages(
            (id) => {
                if (id) {
                    internalAdditionalHeadersSignal({
                        "last-event-id": id,
                    });
                } else {
                    internalAdditionalHeadersSignal({
                        "last-event-id": undefined,
                    });
                }
            },
            (retry) => {
                retryIntervalSignal(retry);
            },
            (message) => {
                try {
                    let eventData;
                    switch (message.event) {
                        case "hs-patch-html":
                        case "hs-patch-signals": {
                            eventData = JSON.parse(message.data);
                            break;
                        }
                        case "hs-execute": {
                            eventData = { code: message.data };
                            break;
                        }
                        default:
                            if (message.event) {
                                if (onUnknownEvent) {
                                    eventData = { event: message };
                                } else {
                                    console.warn(
                                        `Cannot handle unknown SSE event '${message.event}'. No SSE 'onOther' handler was specified.`,
                                    );

                                    return;
                                }
                            }
                    }

                    processCommand(
                        { type: message.event, ...eventData },
                        onUnknownEvent,
                    );
                } catch (err) {
                    console.error(
                        "HyperStim WARN: SSE message processing error:",
                        err,
                    );
                }
            },
        )),
    );
}
