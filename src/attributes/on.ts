import { toCase } from "../case-conversion.ts";
import { buildHyperStimEvaluationFn } from "../hyperstim.ts";
import { extractModifier } from "../modifiers.ts";
import { debounce, parseDuration, throttle } from "../timing.ts";

export function handleOnAttribute(
    element: Element,
    attributeArguments: string[],
    attributeModifiers: string[],
    attributeValue: string,
) {
    if (attributeArguments.length === 0) {
        console.error(
            "HyperStim ERROR: 'on' plugin requires event name, e.g. data-on-click",
        );
        return;
    }

    const caseModifier = extractModifier(attributeModifiers, "case");
    const casing = caseModifier
        ? caseModifier[caseModifier.length - 1]
        : undefined;

    const eventName = toCase(attributeArguments, casing);

    const attributeEvaluationFn = buildHyperStimEvaluationFn(
        attributeValue.trim(),
        { this: element },
        ["event"],
    );

    let eventHandler = (event: Event) => attributeEvaluationFn(event);

    const isTrustedSpecified =
        extractModifier(attributeModifiers, "trusted") !== null;

    if (!isTrustedSpecified) {
        const originalEventHandler = eventHandler;
        eventHandler = (event) => {
            if (!event.isTrusted) return;
            return originalEventHandler(event);
        };
    }

    const isPreventSpecified =
        extractModifier(attributeModifiers, "prevent") !== null;

    if (isPreventSpecified) {
        const originalEventHandler = eventHandler;

        eventHandler = (event) => {
            event.preventDefault();

            return originalEventHandler(event);
        };
    }

    const isStopSpecified =
        extractModifier(attributeModifiers, "stop") !== null;

    if (isStopSpecified) {
        const originalEventHandler = eventHandler;

        eventHandler = (event) => {
            event.stopPropagation();

            return originalEventHandler(event);
        };
    }

    const isOutsideSpecified = extractModifier(
        attributeModifiers,
        "outside",
    ) !== null;

    if (isOutsideSpecified) {
        const originalEventHandler = eventHandler;

        eventHandler = (event) => {
            if (element.contains(event.target as Node)) return;

            return originalEventHandler(event);
        };
    }

    const delayModifier = extractModifier(attributeModifiers, "delay");

    if_delay: if (delayModifier) {
        const ms = delayModifier[1];

        if (ms === undefined) break if_delay;

        const originalEventHandler = eventHandler;

        eventHandler = (event) =>
            setTimeout(() => originalEventHandler(event), Number(ms));
    }

    const debounceModifier = extractModifier(attributeModifiers, "debounce");

    if (debounceModifier !== null) {
        const options = debounceModifier.slice(1);
        const waitStr = options.find((option) => /ms|s$/.test(option));
        const leading = options.includes("leading");
        const trailing = !options.includes("notrail");
        const wait = waitStr ? parseDuration(waitStr) : 0;

        eventHandler = debounce(eventHandler, wait, { leading, trailing });
    }

    const throttleModifier = extractModifier(attributeModifiers, "throttle");

    if (throttleModifier !== null) {
        const options = throttleModifier.slice(1);
        const waitStr = options.find((o) => /ms|s$/.test(o));
        const leading = !options.includes("noleading");
        const trailing = options.includes("trail");
        const wait = waitStr ? parseDuration(waitStr) : 0;

        eventHandler = throttle(eventHandler, wait, { leading, trailing });
    }

    const listenerTarget: EventTarget =
        extractModifier(attributeModifiers, "window") !== null
            ? window
            : element;

    const listenerOptions: AddEventListenerOptions = {
        once: extractModifier(attributeModifiers, "once") !== null,
        passive: extractModifier(attributeModifiers, "passive") !== null,
        capture: extractModifier(attributeModifiers, "capture") !== null,
    };

    listenerTarget.addEventListener(eventName, eventHandler, listenerOptions);

    return () =>
        listenerTarget.removeEventListener(
            eventName,
            eventHandler,
            listenerOptions,
        );
}
