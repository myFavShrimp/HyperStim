export type PatchMode =
    | "inner"
    | "outer"
    | "before"
    | "after"
    | "append"
    | "prepend";

export function parseMode(raw: string | null): PatchMode {
    switch (raw) {
        case "outer":
        case "before":
        case "after":
        case "append":
        case "prepend":
            return raw as PatchMode;
        default:
            return "inner";
    }
}

export function resolveTarget(selector: string): Element {
    const target = document.querySelector(selector);

    if (!target) {
        throw new Error("failed to select swap target");
    }

    return target;
}

const NewScriptDataAttribute = "data-hs-new-script";

function markScriptsForExecution(fragment: DocumentFragment): void {
    const scripts = fragment.querySelectorAll("script");

    scripts.forEach((script) => {
        script.setAttribute(NewScriptDataAttribute, "");
    });
}

function executeMarkedScripts(): void {
    const markedScripts: NodeListOf<HTMLScriptElement> = document
        .querySelectorAll(`script[${NewScriptDataAttribute}]`);

    markedScripts.forEach((oldScript) => {
        const newScript = document.createElement("script");

        Array.from(oldScript.attributes).forEach((attr) => {
            if (attr.name !== NewScriptDataAttribute) {
                newScript.setAttribute(attr.name, attr.value);
            }
        });

        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }

        if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
        }
    });
}

export function patchElements(
    htmlText: string,
    target: Element,
    mode: string,
): void {
    const template = document.createElement("template");
    template.innerHTML = htmlText.trim();
    const fragment = template.content;

    markScriptsForExecution(fragment);

    switch (mode) {
        case "inner": {
            target.innerHTML = "";
            target.appendChild(fragment);
            break;
        }
        case "outer": {
            target.replaceWith(fragment);
            break;
        }
        case "before": {
            target.before(fragment);
            break;
        }
        case "after": {
            target.after(fragment);
            break;
        }
        case "append": {
            target.append(fragment);
            break;
        }
        case "prepend": {
            target.prepend(fragment);
            break;
        }
    }

    executeMarkedScripts();
}
