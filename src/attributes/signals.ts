import { signal } from "../signals.ts";
import { toCamelCase } from "../case-conversion.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

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
