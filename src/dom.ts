// dom.ts – utilities to apply server-controlled DOM swaps based on custom headers
// Inspired by DataStar/HTMX. The server can control where and how HTML fragments
// returned from an action are injected into the current document.
//
// Supported headers (case-insensitive):
//   HS-Target  – CSS selector of the element to be swapped. If missing, <body>.
//   HS-Swap    – one of: inner | outer | before | after | append (default: inner)
//
// Example (Go, PHP, etc.):
//   w.Header().Set("HS-Target", "#list")
//   w.Header().Set("HS-Swap", "append")
//
// Call handleServerSwap(html, headers) with the raw HTML text and Response.headers.

export type PatchMode = "inner" | "outer" | "before" | "after" | "append";

export function parseMode(raw: string | null): PatchMode {
    switch (raw) {
        case "outer":
        case "before":
        case "after":
        case "append":
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

export function patchElements(
    htmlText: string,
    target: Element,
    mode: string,
): void {
    const template = document.createElement("template");
    template.innerHTML = htmlText.trim();
    const fragment = template.content;

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
}
