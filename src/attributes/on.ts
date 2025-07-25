import { buildHyperStimEvaluationFn } from "../hyperstim.ts";

export function handleOnAttribute(
    element: Element,
    _rawKey: string,
    keyParts: string[],
    attributeValue: string,
) {
    if (keyParts.length === 0) {
        console.error(
            "HyperStim ERROR: 'on' plugin requires event name, e.g. data-on-click",
        );
        return;
    }

    const eventName = keyParts.join("-");

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
