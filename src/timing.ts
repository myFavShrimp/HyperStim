import { AnyFunction } from "./types.ts";

export function parseDuration(raw?: string): number {
    if (!raw) return 0;

    if (raw.endsWith("ms")) return parseInt(raw.slice(0, -2), 10);
    if (raw.endsWith("s")) return parseInt(raw.slice(0, -1), 10) * 1000;

    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export type DebounceOptions = {
    leading?: boolean;
    trailing?: boolean;
};

export function debounce<T extends AnyFunction>(
    fn: T,
    wait: number,
    { leading = false, trailing = true }: DebounceOptions = {},
): T {
    let timer: number | undefined;
    let lastArgs: Parameters<T>;

    const invoke = (context: unknown, args: Parameters<T>) =>
        fn.apply(context, args);

    return function (this: unknown, ...args: Parameters<T>) {
        lastArgs = args;
        const callNow = leading && timer === undefined;
        if (timer !== undefined) globalThis.clearTimeout(timer);

        timer = globalThis.setTimeout(() => {
            if (trailing) invoke(this, lastArgs);
            timer = undefined;
        }, wait);

        if (callNow) invoke(this, args);
    } as T;
}

export type ThrottleOptions = {
    leading?: boolean;
    trailing?: boolean;
};

export function throttle<T extends AnyFunction>(
    fn: T,
    wait: number,
    { leading = true, trailing = false }: ThrottleOptions = {},
): T {
    let lastExec = 0;
    let timer: number | undefined;
    let savedArgs: Parameters<T>;

    const invoke = (context: unknown, args: Parameters<T>) =>
        fn.apply(context, args);

    return function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now();
        if (!lastExec && !leading) lastExec = now;
        const remaining = wait - (now - lastExec);
        savedArgs = args;

        if (remaining <= 0) {
            if (timer) {
                globalThis.clearTimeout(timer);
                timer = undefined;
            }
            lastExec = now;
            invoke(this, args);
        } else if (trailing && timer === undefined) {
            timer = globalThis.setTimeout(() => {
                lastExec = leading ? Date.now() : 0;
                timer = undefined;
                invoke(this, savedArgs);
            }, remaining);
        }
    } as T;
}
