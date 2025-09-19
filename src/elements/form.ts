import { fetch, FetchAction } from "../actions/fetch.ts";
import { CleanupFn } from "../types.ts";

type ExtendedForm = HTMLFormElement & {
    hsFetch?: FetchAction;
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

    form.hsFetch = fetch(action, { method });

    const submitHandler = (event: SubmitEvent) => {
        event.preventDefault();

        const formData = new FormData(form);
        const enctype = form.attributes.getNamedItem("enctype")?.nodeValue ||
            form.enctype || "application/x-www-form-urlencoded";

        let body: BodyInit | undefined;
        const headers: Record<string, string> = {};

        if (method === "GET") {
            // deno-lint-ignore no-explicit-any
            const searchParams = new URLSearchParams(formData as any);

            const url = new URL(action);
            url.search = searchParams.toString();

            form.hsFetch?.resource(url.toString());
            form.hsFetch?.options({ method });
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
                // deno-lint-ignore no-explicit-any
                const searchParams = new URLSearchParams(formData as any);

                body = searchParams.toString();
                headers["Content-Type"] = "application/x-www-form-urlencoded";
            }

            form.hsFetch?.options({
                method,
                body,
                headers,
            });
        }

        form.hsFetch?.trigger();
    };

    form.addEventListener("submit", submitHandler);

    return () => {
        form.removeEventListener("submit", submitHandler);
        form.removeAttribute("data-hyperstim-hijacked");
    };
}
