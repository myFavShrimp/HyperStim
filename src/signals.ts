import { computed, effect, signal } from "alien-signals";

export { computed, effect, signal };

export type SignalsPatchData = Record<string, unknown>;

export function patchSignals(signalsData: SignalsPatchData) {
    for (const [key, value] of Object.entries(signalsData)) {
        const signalToPatch = globalThis.HyperStim!
            .signals[key as string];

        try {
            signalToPatch!(value);
        } catch (e) {
            console.error(
                "HyperStim ERROR: failed to update signal",
                key,
                e,
            );
        }
    }
}
