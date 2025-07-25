import { AttributeEvaluationFn, AttributeHandler, CleanupFn } from "./types.ts";
import { handleSignalsAttribute } from "./attributes/signals.ts";
import { handleBindAtribute } from "./attributes/bind.ts";
import { handleOnAttribute } from "./attributes/on.ts";
import { handleEffectAttribute } from "./attributes/effect.ts";
import { handleComputedAttribute } from "./attributes/computed.ts";
import { fetch } from "./actions/fetch.ts";
import { sse } from "./actions/sse.ts";

globalThis.HyperStim ??= {
    signals: {},
    actions: {
        fetch,
        sse,
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

type ExtendedElement = {
    __hyperstim_cleanup?: CleanupFn[];
};

export function runPluginsOnElement(rootElement: Element = document.body) {
    const elements: Element[] = [
        rootElement,
        ...rootElement.querySelectorAll("*"),
    ];

    for (const element of elements) {
        for (const elementAttribute of element.attributes) {
            if (!elementAttribute.name.startsWith("data-")) continue;

            const attributeWithoutDataPrefix = elementAttribute.name.substring(
                dataAttributePrefix.length,
            );

            const attributePartsWithoutDataPrefix = attributeWithoutDataPrefix
                .split(
                    "-",
                );
            const pluginNameOrAlias = attributePartsWithoutDataPrefix[0];

            if (!pluginNameOrAlias) continue;

            const handleAttribute = attributeHandlers[pluginNameOrAlias];

            if (!handleAttribute) continue;

            const cleanup = handleAttribute(
                element,
                attributeWithoutDataPrefix,
                attributePartsWithoutDataPrefix.splice(1),
                elementAttribute.value,
            );

            if (cleanup) {
                const extendedElement = element as ExtendedElement;

                const elementCleanupList: (() => void)[] =
                    extendedElement.__hyperstim_cleanup ?? [];
                elementCleanupList.push(cleanup);
                extendedElement.__hyperstim_cleanup = elementCleanupList;
            }
        }
    }
}

function initializeDomObserver() {
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const addedNode of record.addedNodes) {
                if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

                runPluginsOnElement(addedNode as Element);
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
        const extended = target as ExtendedElement;

        const cleanupFns = extended.__hyperstim_cleanup;

        if (!cleanupFns) continue;

        for (const cleanupFn of cleanupFns) {
            try {
                cleanupFn();
            } catch (e) {
                console.error("HyperStim cleanup error", e);
            }
        }

        extended.__hyperstim_cleanup = [];
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

    return <T = unknown>(...dynamicParameterValues: unknown[]) => {
        try {
            return new Function(
                ...staticParameterNames,
                ...dynamicParameterNames,
                `${signalsContextSpread}; ${actionsContextSpread}; return (${expressionSource});`,
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
                runPluginsOnElement();
                initializeDomObserver();
            },
        );
    } else {
        runPluginsOnElement();
        initializeDomObserver();
    }
}
