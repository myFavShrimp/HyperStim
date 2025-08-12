import { fetch } from "./actions/fetch.ts";
import { sse } from "./actions/sse.ts";
import { computed, effect, signal } from "./signals.ts";

export type ReadSignal<T> = {
    (): T;
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
        builtin: {
            signal: typeof signal;
            effect: typeof effect;
            computed: typeof computed;
        };
    } | undefined;
}

export type CleanupFn = () => void;
export type AttributeEvaluationFn = <T = unknown>(...params: unknown[]) => T;

export type AttributeHandler = (
    element: Element,
    attributeArguments: string[],
    attributeModifier: string[],
    attributeValue: string,
) => void | CleanupFn;

export type ElementHandler = (element: Element) => void | CleanupFn;

// deno-lint-ignore no-explicit-any
export type AnyFunction = (...args: any[]) => unknown;
