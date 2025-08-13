import {
    AttributeEvaluationFn,
    AttributeHandler,
    CleanupFn,
    ElementHandler,
} from "./types.ts";
import { handleSignalsAttribute } from "./attributes/signals.ts";
import { handleBindAtribute } from "./attributes/bind.ts";
import { handleOnAttribute } from "./attributes/on.ts";
import { handleEffectAttribute } from "./attributes/effect.ts";
import { handleComputedAttribute } from "./attributes/computed.ts";
import { fetch } from "./actions/fetch.ts";
import { sse } from "./actions/sse.ts";
import { handleFormElement } from "./elements/form.ts";
import { computed, effect, signal } from "./signals.ts";

globalThis.HyperStim ??= {
    signals: {},
    actions: {
        fetch,
        sse,
    },
    builtin: {
        signal,
        effect,
        computed,
    },
};

const dataAttributePrefix = "data-";
const attributeHandlers: Record<string, AttributeHandler> = {
    "bind": handleBindAtribute,
    "computed": handleComputedAttribute,
    "effect": handleEffectAttribute,
    "on": handleOnAttribute,
    "signals": handleSignalsAttribute,
};
const elementHandlers: Record<string, ElementHandler> = {
    "FORM": handleFormElement,
};

type ExtendedElement = {
    __hyperstim_cleanup?: CleanupFn[];
};

function processDataAttributes(element: Element) {
    for (const elementAttribute of element.attributes) {
        if (!elementAttribute.name.startsWith("data-")) continue;

        const attributeWithoutDataPrefix = elementAttribute.name.substring(
            dataAttributePrefix.length,
        );

        const [attributeArgumentsString, ...attributeModifiers] =
            attributeWithoutDataPrefix.split("__");

        const [pluginNameOrAlias, ...attributeArguments] =
            (attributeArgumentsString as string)
                .split(
                    "-",
                );

        if (!pluginNameOrAlias) continue;

        const handleAttribute = attributeHandlers[pluginNameOrAlias];

        if (!handleAttribute) continue;

        const cleanup = handleAttribute(
            element,
            attributeArguments,
            attributeModifiers,
            elementAttribute.value,
        );

        if (cleanup) {
            const extendedElement = element as ExtendedElement;

            const elementCleanupList = extendedElement.__hyperstim_cleanup ??
                [];
            elementCleanupList.push(cleanup);
            extendedElement.__hyperstim_cleanup = elementCleanupList;
        }
    }
}

function processNodesByName(element: Element) {
    const elementHandler = elementHandlers[element.nodeName];

    if (!elementHandler) return;

    const cleanup = elementHandler(element);

    if (cleanup) {
        const extendedElement = element as ExtendedElement;

        const elementCleanupList = extendedElement.__hyperstim_cleanup ?? [];
        elementCleanupList.push(cleanup);
        extendedElement.__hyperstim_cleanup = elementCleanupList;
    }
}

export function processElement(
    rootElement: Element = document.documentElement,
) {
    const elements: Element[] = [
        rootElement,
        ...rootElement.querySelectorAll("*"),
    ];

    for (const element of elements) {
        // The processing is detached to prevent loading spinners on
        // the tab e.g. when immediately triggering a fetch action.
        // Processing order is important to ensure signals defined
        // earlier in html are available on later nodes.
        queueMicrotask(() => processDataAttributes(element));
        queueMicrotask(() => processNodesByName(element));
    }
}

function initializeDomObserver() {
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const addedNode of record.addedNodes) {
                if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

                processElement(addedNode as Element);
            }

            for (const removedNode of record.removedNodes) {
                if (removedNode.nodeType !== Node.ELEMENT_NODE) continue;

                if (removedNode.nodeName === "BODY") continue;

                runCleanupOnElement(removedNode as Element);
            }
        }
    });

    if (document.body === null) {
        console.error("HyperStim ERROR: no 'body' node found to watch");
    }

    observer.observe(document.body, { childList: true, subtree: true });
}

function runCleanupOnElement(rootElement: Element) {
    const cleanupTargets: Element[] = [
        rootElement,
        ...rootElement.querySelectorAll("*"),
    ];

    for (const target of cleanupTargets) {
        const extendedElement = target as ExtendedElement;

        const cleanupFns = extendedElement.__hyperstim_cleanup;

        if (!cleanupFns) continue;

        for (const cleanupFn of cleanupFns) {
            try {
                cleanupFn();
            } catch (e) {
                console.error("HyperStim cleanup error", e);
            }
        }

        extendedElement.__hyperstim_cleanup = [];
    }
}

export function buildHyperStimEvaluationFn(
    expressionSource: string,
    staticParameters: Record<string, unknown>,
    dynamicParameterNames: string[],
): AttributeEvaluationFn {
    const { this: thisParameter, ...regularParameters } = staticParameters;

    const staticParameterNames = Object.keys(regularParameters);
    const staticParameterValues = Object.values(regularParameters);

    const signalsContextSpread = buildContextSpread(
        HyperStim!.signals,
        "HyperStim.signals",
    );
    const actionsContextSpread = buildContextSpread(
        HyperStim!.actions,
        "HyperStim.actions",
    );
    const builtinContextSpread = "const builtin = HyperStim.builtin";

    return <T = unknown>(...dynamicParameterValues: unknown[]) => {
        try {
            return new Function(
                ...staticParameterNames,
                ...dynamicParameterNames,
                `${signalsContextSpread}; ${actionsContextSpread}; ${builtinContextSpread}; return (${expressionSource});`,
            ).call(
                thisParameter,
                ...staticParameterValues,
                ...dynamicParameterValues,
            );
        } catch (e) {
            console.error(
                `HyperStim ERROR: failed to evaluate expression '${expressionSource}'`,
                e,
            );
            return undefined as unknown as T;
        }
    };
}

function buildContextSpread(
    object: Record<string, unknown>,
    parameterName: string,
): string {
    const objectKeys = Object.keys(object);

    if (objectKeys.length === 0) return "";

    return `const { ${Object.keys(object).join(",")} } = ${parameterName}`;
}

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            () => {
                processElement();
                initializeDomObserver();
            },
        );
    } else {
        processElement();
        initializeDomObserver();
    }
}
