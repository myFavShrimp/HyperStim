import { computed } from "../signals.ts";
import { toCamelCase } from "../case-conversion.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

/*
 * data-computed-<name>="expression" – creates computed signal `<name>()`.
 * Example: <div data-computed-total="price()*qty()"></div>
 */
export function handleComputedAttribute(
    element: Element,
    _rawKey: string,
    keyParts: string[],
    attributeValue: string,
) {
    if (keyParts.length === 0) {
        console.error(
            "HyperStim ERROR: 'computed' plugin requires signal name, e.g. data-computed-something",
        );
    }

    const name = toCamelCase(keyParts);

    if (typeof globalThis.HyperStim!.signals[name] === "function") return;

    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue,
        { this: element },
        [],
    );

    const computedSignal = computed(() => attributeEvaluationFn());

    globalThis.HyperStim!.signals[name] = computedSignal;
}
