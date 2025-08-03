import { computed } from "../signals.ts";
import { toCamelCase } from "../case-conversion.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export function handleComputedAttribute(
    element: Element,
    attributeArguments: string[],
    _attributeModifiers: string[],
    attributeValue: string,
) {
    if (attributeArguments.length === 0) {
        console.error(
            "HyperStim ERROR: 'computed' plugin requires signal name, e.g. data-computed-something",
        );
    }

    const name = toCamelCase(attributeArguments);

    if (typeof globalThis.HyperStim!.signals[name] === "function") return;

    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue,
        { this: element },
        [],
    );

    const computedSignal = computed(() => attributeEvaluationFn());

    globalThis.HyperStim!.signals[name] = computedSignal;
}
