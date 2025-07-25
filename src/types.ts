import { fetch } from "./actions/fetch.ts";
import { sse } from "./actions/sse.ts";

export type ReadSignal<T> = {
    (): T | null;
};

export type WriteSignal<T> = {
    (newValue: T): void;
};

export type ReadWriteSignal<T> = WriteSignal<T> & ReadSignal<T>;

declare global {
    var HyperStim: {
        signals: Record<
            string,
            | ReadWriteSignal<unknown>
            | ReadSignal<unknown>
            | WriteSignal<unknown>
        >;
        actions: {
            fetch: typeof fetch;
            sse: typeof sse;
        };
    } | undefined;
}

export type CleanupFn = () => void;
export type AttributeEvaluationFn = <T = unknown>(...params: unknown[]) => T;

export type AttributeHandler = (
    element: Element,
    rawKey: string,
    keyParts: string[],
    attributeValue: string,
) => void | CleanupFn;
