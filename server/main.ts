import { serveDir } from "jsr:@std/http@1.0.10/file-server";

const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/sse") {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("event: signals\n"));
        controller.enqueue(
          new TextEncoder().encode('data: {"counter": 1}\n\n'),
        );

        const htmlFragment =
          "<p data-effect=\"console.log('SSE HTML appended')\">Hello from SSE</p>";
        const eventPayload = {
          html: htmlFragment,
          patchTarget: "body",
          patchMode: "append",
        };

        controller.enqueue(new TextEncoder().encode("event: html\n"));
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(eventPayload)}\n\n`),
        );
        // controller.close();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  if (url.pathname === "/data") {
    const htmlContent =
      '<h1 data-signal-test="0" data-effect="console.log(test())" data-effect="test(test() + 1)">IT WORKS!</h1><h1 data-signal-counter="0" data-effect="this.textContent = counter()"></h1> <button data-on-click="counter(counter() - 1)">-1</button> <button data-on-click="counter(counter() + 1)">+1</button>';

    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html",
        "hs-target": "#test-id",
        "hs-mode": "after",
      },
    });
  }

  if (url.pathname === "/form") {
    const htmlContent =
      '<h1 data-signal-test="0" data-effect="console.log(test())" data-effect="test(test() + 1)">IT WORKS!</h1><h1 data-signal-counter="0" data-effect="this.textContent = counter()"></h1> <button data-on-click="counter(counter() - 1)">-1</button> <button data-on-click="counter(counter() + 1)">+1</button>';

    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html",
        "hs-target": "#test-id",
        "hs-mode": "after",
      },
    });
  }

  try {
    const response = await serveDir(req, {
      fsRoot: "..",
      quiet: true,
    });

    if (url.pathname.endsWith(".js")) {
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "application/javascript");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

console.log(`Serving on port ${PORT}...`);
Deno.serve({ port: PORT }, handler);
