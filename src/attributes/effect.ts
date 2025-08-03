import { effect } from "../signals.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export function handleEffectAttribute(
    element: Element,
    _attributeArguments: string[],
    _attributeModifiers: string[],
    attributeValue: string,
) {
    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue.trim(),
        { this: element },
        [],
    );

    const dispose = effect(() => {
        try {
            attributeEvaluationFn();
        } catch (err) {
            console.error("HyperStim data-effect error", err);
        }
    });

    return () => {
        dispose();
    };
}
