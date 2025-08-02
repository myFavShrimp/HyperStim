import { patchSignals, signal, SignalsPatchData } from "../signals.ts";
import { ReadSignal } from "../types.ts";
import { parseMode, patchElements, resolveTarget } from "../dom.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export type SSEState = "initial" | "connecting" | "open" | "error" | "closed";

export interface SSEStream {
    state: ReadSignal<SSEState>;
    error: ReadSignal<unknown> | undefined;
    close: () => void;
    connect: () => SSEStream;
}

type SseHtmlEventData = {
    patchTarget: string;
    patchMode?: string;
    html: string;
};

type SseSignalsEventData = SignalsPatchData;

export function sse(url: string, withCredentials = false): SSEStream {
    const stateSignal = signal<SSEState>("initial");
    const errorSignal = signal<unknown>(undefined);

    let eventSourceInstance: EventSource | null = null;

    const connectEventSource = () => {
        const eventSourceState = eventSourceInstance?.readyState;
        if (
            eventSourceState !== undefined &&
            eventSourceState !== EventSource.CLOSED
        ) {
            console.log("no conn", eventSourceState);
            return;
        }

        eventSourceInstance?.close();

        const eventSource = new EventSource(url, { withCredentials });
        eventSourceInstance = eventSource;

        eventSource.addEventListener("open", () => stateSignal("open"));

        eventSource.addEventListener("error", (e) => {
            errorSignal(e);
            stateSignal("error");
            eventSource.close();
            stateSignal("closed");
        });

        eventSource.addEventListener("html", (event: MessageEvent) => {
            try {
                const eventData: SseHtmlEventData = JSON.parse(event.data);
                const patchTarget = eventData.patchTarget;

                if (!patchTarget) {
                    console.error(
                        "HyperStim ERROR: received content-type `text/html` but no hs-target header was specified",
                    );

                    return;
                }

                const targetElement = resolveTarget(patchTarget);

                const patchMode = parseMode(eventData.patchMode ?? null);
                const html = eventData.html;

                patchElements(html, targetElement, patchMode);
            } catch (err) {
                console.error("HyperStim SSE patch error", err);
            }
        });

        eventSource.addEventListener("signals", (event: MessageEvent) => {
            try {
                const eventData: SseSignalsEventData = JSON.parse(event.data);

                patchSignals(eventData);
            } catch (err) {
                console.error("HyperStim SSE patch error", err);
            }
        });

        eventSource.addEventListener("javascript", (event: MessageEvent) => {
            try {
                buildHyperStimEvaluationFn(
                    event.data,
                    { this: event },
                    [],
                )();
            } catch (err) {
                console.error("HyperStim SSE patch error", err);
            }
        });
    };

    console.log("setup done");

    const sseStream = {
        state: () => stateSignal(),
        error: () => errorSignal(),
        close: () => {
            eventSourceInstance?.close();
            stateSignal("closed");
        },
        connect: () => {
            connectEventSource();
            return sseStream;
        },
    };

    return sseStream;
}
