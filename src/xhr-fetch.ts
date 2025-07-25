/**
 * A `fetch`-compatible wrapper built on top of `XMLHttpRequest` that adds
 * native upload & download progress callbacks. The API purposefully mirrors
 * the built-in `fetch` as closely as possible so that it can be used as a
 * drop-in replacement.
 */

export type ProgressCallback = (
    loaded: number,
    total?: number,
    percent?: number,
) => void;

export interface XHRFetchOptions extends RequestInit {
    timeout?: number;
    onDownloadProgress?: ProgressCallback;
    onUploadProgress?: ProgressCallback;
}

function normaliseHeaders(headersInit?: HeadersInit): Record<string, string> {
    if (!headersInit) return {};

    if (headersInit instanceof Headers) {
        const headersObject: Record<string, string> = {};
        headersInit.forEach((value, key) => {
            headersObject[key] = value;
        });
        return headersObject;
    }

    if (Array.isArray(headersInit)) {
        return headersInit.reduce<Record<string, string>>(
            (acc, [key, value]) => {
                acc[key] = value;
                return acc;
            },
            {},
        );
    }

    return { ...headersInit };
}

export function xhrFetch(
    resource: RequestInfo | URL,
    options: XHRFetchOptions = {},
): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        let inputRequest: Request | undefined;
        let url: string;

        if (resource instanceof Request) {
            inputRequest = resource;
            url = resource.url;
        } else if (resource instanceof URL) {
            url = resource.toString();
        } else {
            url = String(resource);
        }

        const method = options.method ?? inputRequest?.method ?? "GET";

        const headers: Record<string, string> = {
            ...normaliseHeaders(inputRequest?.headers),
            ...normaliseHeaders(options.headers),
        };

        const body: BodyInit | null | undefined = options.body ??
            inputRequest?.body ?? null;

        const withCredentials = (() => {
            // this is not correct but okay for now
            // https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#credentials
            if (typeof (options as any).withCredentials === "boolean") {
                return (options as any).withCredentials;
            }
            if (typeof options.credentials === "string") {
                return options.credentials === "include";
            }
            if (inputRequest?.credentials) {
                return inputRequest.credentials === "include";
            }
            return false;
        })();

        const timeout = options.timeout ?? 0;
        const signal = options.signal ?? inputRequest?.signal;

        const xhr = new XMLHttpRequest();

        xhr.open(method!, url, true);
        xhr.withCredentials = withCredentials;
        if (timeout) xhr.timeout = timeout;
        xhr.responseType = "blob";

        Object.entries(headers).forEach(([k, v]) => {
            xhr.setRequestHeader(k, v);
        });

        if (typeof options.onDownloadProgress === "function") {
            xhr.addEventListener("progress", (e) => {
                const loaded = e.loaded;
                const total = e.lengthComputable ? e.total : undefined;
                const percent = total ? (loaded / total) * 100 : undefined;
                options.onDownloadProgress!(loaded, total, percent);
            });
        }

        if (typeof options.onUploadProgress === "function" && xhr.upload) {
            xhr.upload.addEventListener("progress", (e) => {
                const loaded = e.loaded;
                const total = e.lengthComputable ? e.total : undefined;
                const percent = total ? (loaded / total) * 100 : undefined;
                options.onUploadProgress!(loaded, total, percent);
            });
        }

        if (signal) {
            if (signal.aborted) {
                xhr.abort();
            }
            signal.addEventListener(
                "abort",
                () => {
                    xhr.abort();
                    reject(new DOMException("Aborted", "AbortError"));
                },
                { once: true },
            );
        }

        xhr.addEventListener("load", () => {
            resolve(createResponse(xhr));
        });
        xhr.addEventListener("error", () => {
            reject(new TypeError("Network request failed"));
        });
        xhr.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
        });
        xhr.addEventListener("timeout", () => {
            reject(new TypeError(`Request Timeout: ${timeout}ms exceeded`));
        });

        if (body != null && !(method === "GET" || method === "HEAD")) {
            xhr.send(body as XMLHttpRequestBodyInit);
        } else {
            xhr.send();
        }

        // a fetch-like response object
        function createResponse(xhr: XMLHttpRequest): Response {
            const responseHeaders = new Headers();
            const raw = xhr.getAllResponseHeaders();
            if (raw) {
                raw
                    .trim()
                    .split(/\r?\n/)
                    .forEach((line) => {
                        if (!line) return;
                        const parts = line.split(": ");
                        const key = parts.shift()!;
                        const value = parts.join(": ");
                        responseHeaders.append(key, value);
                    });
            }

            const response = new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: responseHeaders,
            });

            Object.defineProperty(response, "url", {
                value: xhr.responseURL || url,
                writable: false,
                enumerable: false,
            });

            return response;
        }
    });
}
