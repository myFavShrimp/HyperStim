import { fetch, FetchAction } from "../actions/fetch.ts";
import { CleanupFn } from "../types.ts";

type ExtendedForm = HTMLFormElement & {
    __hyperstim_action?: FetchAction;
};

export function handleFormElement(
    element: Element,
): void | CleanupFn {
    if (element.nodeName !== "FORM" || !element.hasAttribute("data-hijack")) {
        return;
    }

    const form = element as ExtendedForm;

    const action = form.action || globalThis.location.href;
    const method = (form.method || "GET").toUpperCase();
    
    form.__hyperstim_action = fetch(action, { method });

    const submitHandler = (event: SubmitEvent) => {
        event.preventDefault();

        const formData = new FormData(form);
        const enctype = form.enctype || "application/x-www-form-urlencoded";

        let body: BodyInit | undefined;
        const headers: Record<string, string> = {};

        if (method === "GET") {
            const searchParams = new URLSearchParams();

            for (const [key, value] of formData.entries()) {
                searchParams.append(key, value.toString());
            }

            const url = new URL(action);
            url.search = searchParams.toString();

            form.__hyperstim_action = fetch(url.toString(), { method });
        } else {
            if (enctype === "multipart/form-data") {
                body = formData;
            } else if (enctype === "application/json") {
                const jsonData: Record<string, unknown> = {};

                for (const [key, value] of formData.entries()) {
                    jsonData[key] = value;
                }

                body = JSON.stringify(jsonData);
                headers["Content-Type"] = "application/json";
            } else {
                const searchParams = new URLSearchParams();

                for (const [key, value] of formData.entries()) {
                    searchParams.append(key, value.toString());
                }

                body = searchParams.toString();
                headers["Content-Type"] = "application/x-www-form-urlencoded";
            }

            form.__hyperstim_action = fetch(action, {
                method,
                body,
                headers,
            });
        }

        form.__hyperstim_action.trigger();
    };

    form.addEventListener("submit", submitHandler);
    form.setAttribute("data-hyperstim-hijacked", "true");

    return () => {
        form.removeEventListener("submit", submitHandler);
        form.removeAttribute("data-hyperstim-hijacked");
    };
}
