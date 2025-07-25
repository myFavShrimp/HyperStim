import { effect, signal as createSignal } from "../signals.ts";
import { ReadSignal } from "../types.ts";

type ObservableProperties = "checked" | "value" | "textContent";

function defaultProperty(element: Element): ObservableProperties {
    if (element instanceof HTMLInputElement) {
        return (element.type === "checkbox" || element.type === "radio")
            ? "checked"
            : "value";
    }
    if (
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
    ) {
        return "value";
    }

    return "textContent";
}

function read(
    element: Element,
    property: ObservableProperties,
): unknown | undefined {
    if (property === "checked" && element instanceof HTMLInputElement) {
        return element.checked;
    }

    // This is okay - the user should be allowed to access any property they want.
    //  @ts-ignore – dynamic property access
    return element[property];
}

function write(
    element: Element,
    property: ObservableProperties,
    value: unknown,
): void {
    if (property === "checked" && element instanceof HTMLInputElement) {
        element.checked = !!value;
        return;
    }

    // This is okay - the user should be allowed to access any property they want.
    // @ts-ignore – dynamic property access
    element[property] = value;
}

export function handleBindAtribute(
    element: Element,
    _attributeArguments: string[],
    _attributeModifiers: string[],
    attributeValue: string,
) {
    const propertyKey = defaultProperty(element);

    const signalName = attributeValue.replace(/[()]/g, "");

    if (!signalName.trim()) {
        console.error(
            "HyperStim ERROR: bind attribute found no signal to bind to",
            attributeValue,
        );
    }

    let signalFn = globalThis.HyperStim!.signals[signalName];

    if (typeof signalFn !== "function") {
        signalFn = createSignal(read(element, propertyKey));
        globalThis.HyperStim!.signals[signalName] = signalFn;
    }

    const updateSignal = () => signalFn(read(element, propertyKey));

    if (propertyKey === "value" || propertyKey === "checked") {
        element.addEventListener("input", updateSignal);
        element.addEventListener("change", updateSignal);
    }

    const dispose = effect(() => {
        // If this is untrue it's an user error.
        write(element, propertyKey, (signalFn as ReadSignal<unknown>)());
    });

    return () => {
        dispose();
        if (propertyKey === "value" || propertyKey === "checked") {
            element.removeEventListener("input", updateSignal);
            element.removeEventListener("change", updateSignal);
        }
    };
}
