import { effect } from "../signals.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

/*
 * data-effect – run an expression once and again whenever any
 * signal it references changes.
 * Example:
 *   <div data-effect="console.log(counter())"></div>
 */
export function handleEffectAttribute(
    element: Element,
    _rawKey: string,
    _keyParts: string[],
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
