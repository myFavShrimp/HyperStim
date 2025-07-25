import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export function handleOnAttribute(
    element: Element,
    attributeArguments: string[],
    _attributeModifiers: string[],
    attributeValue: string,
) {
    if (attributeArguments.length === 0) {
        console.error(
            "HyperStim ERROR: 'on' plugin requires event name, e.g. data-on-click",
        );
        return;
    }

    const eventName = attributeArguments.join("-");

    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue.trim(),
        { this: element },
        [
            "event",
        ],
    );

    const eventHandler = (evt: Event) => attributeEvaluationFn(evt);
    element.addEventListener(eventName, eventHandler);

    return () => element.removeEventListener(eventName, eventHandler);
}
