import { signal } from "../signals.ts";
import { toCamelCase } from "../case-conversion.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

// HyperStim Signals plugin – declares global signals via markup.
// Usage examples:
//   <div data-signals="{ counter: 0, name: 'World' }"></div>
//   <div data-signals-count="0"></div>
// Supports optional modifier tag `ifmissing` to avoid overwriting existing
// signals when they already exist.
export function handleSignalsAttribute(
    element: Element,
    attributeArguments: string[],
    _attributeModifiers: string[],
    attributeValue: string,
) {
    const createSignalOrSkipIfExists = <T>(name: string, value: T) => {
        if (name in globalThis.HyperStim!.signals) return;

        const createdSignal = signal(value);
        globalThis.HyperStim!.signals[name] = createdSignal;
    };

    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue.trim(),
        { this: element },
        [],
    );

    if (attributeArguments.length > 0) {
        const signalName = toCamelCase(attributeArguments);
        const initialValue = attributeEvaluationFn();

        createSignalOrSkipIfExists(signalName, initialValue);
    } else {
        const signalsObject =
            attributeEvaluationFn<Record<string, unknown>>() ?? {};

        for (const [k, v] of Object.entries(signalsObject)) {
            createSignalOrSkipIfExists(k, v);
        }
    }
}
