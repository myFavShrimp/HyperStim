import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export function handleInitAttribute(
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

    try {
        attributeEvaluationFn();
    } catch (err) {
        console.error("HyperStim data-init error", err);
    }
}