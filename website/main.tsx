import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Home } from "./frontend/home.tsx";

const app = new Hono();

app.get("/", (c) => {
    return c.html(<Home />);
});

const hyperstimJs = await Deno.readTextFile(
    new URL("../dist/hyperstim.js", import.meta.url),
);

app.get("/hyperstim.js", (c) => {
    return c.text(hyperstimJs, 200, {
        "Content-Type": "application/javascript",
    });
});

app.get("/api/users", (_c) => {
    const usersHtml = `
      <div class="space-y-2">
        <div class="p-3 bg-cyan-400 text-black font-black border-2 border-white transform -skew-x-3">
          <span class="text-lg uppercase">ALICE JOHNSON</span>
          <div class="text-sm font-bold">EMAIL: ALICE@EXAMPLE.COM</div>
        </div>
        <div class="p-3 bg-pink-400 text-black font-black border-2 border-white transform skew-x-3">
          <span class="text-lg uppercase">BOB SMITH</span>
          <div class="text-sm font-bold">EMAIL: BOB@EXAMPLE.COM</div>
        </div>
        <div class="p-3 bg-yellow-400 text-black font-black border-2 border-white transform -skew-x-3">
          <span class="text-lg uppercase">CAROL WILSON</span>
          <div class="text-sm font-bold">EMAIL: CAROL@EXAMPLE.COM</div>
        </div>
      </div>`;

    return chunkedJsonResponse(
        {
            type: "hs-patch-html",
            html: usersHtml,
            patchTarget: "#users-list",
            patchMode: "replace",
        },
        { chunks: 10, delayMs: 300 },
    );
});

app.get("/api/counter", (c) => {
    return c.json({
        type: "hs-patch-signals",
        randomCounter: Math.floor(Math.random() * 100),
    });
});

app.post("/api/form", async (c) => {
    const formData = await c.req.parseBody();
    const name = String(formData["name"]).toUpperCase();
    const email = String(formData["email"]).toUpperCase();

    return c.json({
        type: "hs-patch-html",
        patchTarget: "#form-result",
        patchMode: "replace",
        html:
            `<div class="p-6 bg-black border-4 border-green-400 transform rotate-1 pop-shadow relative">
      <div class="absolute -top-3 -right-3 bg-green-400 text-black px-3 py-1 comic-border transform rotate-12">
        <span class="font-black text-sm">SUCCESS!</span>
      </div>
      <h3 class="text-2xl font-black text-green-400 mb-4 uppercase tracking-wider neon-glow">FORM SUBMITTED!</h3>
      <div class="space-y-2 text-lg font-bold">
        <p class="text-cyan-400">NAME: <span class="text-white font-black">${name}</span></p>
        <p class="text-cyan-400">EMAIL: <span class="text-white font-black">${email}</span></p>
      </div>
      <div class="mt-4 text-center">
        <span class="inline-block bg-yellow-400 text-black px-4 py-2 font-black uppercase comic-border transform -skew-x-6">KAPOW! DATA RECEIVED!</span>
      </div>
    </div>`,
    });
});

app.get("/sse", (_c) => {
    let counter = 0;

    const body = new ReadableStream({
        start(controller) {
            let isConnected = true;
            const send = createSSEWriter(controller);

            send("hs-patch-html", sseLogPayload("", "replace"));

            const interval = setInterval(() => {
                if (!isConnected) {
                    clearInterval(interval);
                    return;
                }

                counter++;

                try {
                    send("hs-patch-signals", { liveCounter: counter });

                    const { message, classes } = getSSELogEntry(counter);
                    send(
                        "hs-patch-html",
                        sseLogPayload(
                            `<div class="p-2 font-mono text-sm ${classes}">${message}</div>`,
                        ),
                    );

                    if (counter >= 20) {
                        send(
                            "hs-patch-html",
                            sseLogPayload(
                                `<div class="p-2 font-mono text-sm text-red-400 bg-red-900 border border-red-400">Connection closed after ${counter} events at ${
                                    new Date().toLocaleTimeString()
                                }</div>`,
                            ),
                        );
                        clearInterval(interval);
                        controller.close();
                        isConnected = false;
                    }
                } catch {
                    clearInterval(interval);
                    isConnected = false;
                }
            }, 1000);

            return () => {
                isConnected = false;
                clearInterval(interval);
            };
        },
        cancel() {
            // Client disconnected
        },
    });

    return new Response(body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
});

Deno.serve(app.fetch);

function chunkedJsonResponse(
    data: Record<string, unknown>,
    opts: { chunks: number; delayMs: number },
): Response {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const chunkSize = Math.ceil(encoded.length / opts.chunks);

    const stream = new ReadableStream({
        async start(controller) {
            for (let i = 0; i < opts.chunks; i++) {
                const start = i * chunkSize;
                controller.enqueue(
                    encoded.slice(
                        start,
                        Math.min(start + chunkSize, encoded.length),
                    ),
                );
                if (i < opts.chunks - 1) {
                    await new Promise((r) => setTimeout(r, opts.delayMs));
                }
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/json",
            "Content-Length": encoded.length.toString(),
            "Cache-Control": "public, no-transform",
        },
    });
}

function createSSEWriter(
    controller: ReadableStreamDefaultController<Uint8Array>,
) {
    const encoder = new TextEncoder();
    return (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };
}

function sseLogPayload(html: string, mode: string = "prepend") {
    return { html, patchTarget: "#sse-log", patchMode: mode };
}

function getSSELogEntry(counter: number): { message: string; classes: string } {
    const time = new Date().toLocaleTimeString();

    if (counter === 1) {
        return {
            message: `Connection established at ${time}`,
            classes: "text-cyan-400 bg-green-900 border border-green-400",
        };
    }
    if (counter % 3 === 0) {
        return {
            message: `Data update #${counter} received at ${time}`,
            classes: "text-cyan-400 bg-blue-900 border border-blue-400",
        };
    }
    if (counter % 7 === 0) {
        return {
            message: `Performance checkpoint #${
                Math.floor(counter / 7)
            } at ${time}`,
            classes: "text-cyan-400 bg-yellow-900 border border-yellow-400",
        };
    }
    if (counter === 15) {
        return {
            message: `Approaching connection limit at ${time}`,
            classes: "text-cyan-400 bg-orange-900 border border-orange-400",
        };
    }
    return {
        message: `Heartbeat ${counter} at ${time}`,
        classes: "text-cyan-400 bg-gray-900 border border-gray-400",
    };
}
