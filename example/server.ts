import { serveDir } from "@std/http/file-server";

const PORT = 3000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Serve example.html as index page
  if (url.pathname === "/") {
    return serveFile("example.html");
  }

  // Serve HyperStim from dist directory
  if (url.pathname === "/hyperstim.js") {
    return serveFile("../dist/hyperstim.js");
  }

  // API endpoints for examples
  if (url.pathname === "/api/users") {
    const usersHtml = `
      <div class="space-y-2">
        <div class="p-3 bg-cyan-400 text-black font-black border-2 border-white transform -skew-x-3">
          <span class="text-lg uppercase">👤 ALICE JOHNSON</span>
          <div class="text-sm font-bold">EMAIL: ALICE@EXAMPLE.COM</div>
        </div>
        <div class="p-3 bg-pink-400 text-black font-black border-2 border-white transform skew-x-3">
          <span class="text-lg uppercase">👤 BOB SMITH</span>
          <div class="text-sm font-bold">EMAIL: BOB@EXAMPLE.COM</div>
        </div>
        <div class="p-3 bg-yellow-400 text-black font-black border-2 border-white transform -skew-x-3">
          <span class="text-lg uppercase">👤 CAROL WILSON</span>
          <div class="text-sm font-bold">EMAIL: CAROL@EXAMPLE.COM</div>
        </div>
      </div>
    `;

    const command = {
      type: "hs-patch-html",
      html: usersHtml,
      patchTarget: "#users-list",
      patchMode: "replace",
    };

    const commandJson = JSON.stringify(command);
    const commandEncoder = new TextEncoder();
    const commandData = commandEncoder.encode(commandJson);

    // Split into 10 chunks for visible progress
    const commandChunks = 10;
    const commandChunkSize = Math.ceil(commandData.length / commandChunks);

    const commandStream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < commandChunks; i++) {
          const start = i * commandChunkSize;
          const end = Math.min(start + commandChunkSize, commandData.length);
          const chunk = commandData.slice(start, end);

          controller.enqueue(chunk);

          // Sleep between chunks (except after the last one)
          if (i < commandChunks - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
        controller.close();
      },
    });

    return new Response(commandStream, {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": commandData.length.toString(),
        // tell deno to not use compression
        "Cache-Control": "public, no-transform",
      },
    });
  }

  if (url.pathname === "/api/counter") {
    const randomNumber = Math.floor(Math.random() * 100);

    const command = {
      type: "hs-patch-signals",
      randomCounter: randomNumber,
    };

    return new Response(
      JSON.stringify(command),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (url.pathname === "/api/form" && req.method === "POST") {
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");

    const html =
      `<div class="p-6 bg-black border-4 border-green-400 transform rotate-1 pop-shadow relative">
      <div class="absolute -top-3 -right-3 bg-green-400 text-black px-3 py-1 comic-border transform rotate-12">
        <span class="font-black text-sm">SUCCESS!</span>
      </div>
      <h3 class="text-2xl font-black text-green-400 mb-4 uppercase tracking-wider neon-glow">FORM SUBMITTED!</h3>
      <div class="space-y-2 text-lg font-bold">
        <p class="text-cyan-400">NAME: <span class="text-white font-black">${name?.toString().toUpperCase()}</span></p>
        <p class="text-cyan-400">EMAIL: <span class="text-white font-black">${email?.toString().toUpperCase()}</span></p>
      </div>
      <div class="mt-4 text-center">
        <span class="inline-block bg-yellow-400 text-black px-4 py-2 font-black uppercase comic-border transform -skew-x-6">KAPOW! DATA RECEIVED!</span>
      </div>
    </div>`;

    const command = {
      type: "hs-patch-html",
      html: html,
      patchTarget: "#form-result",
      patchMode: "replace",
    };

    return new Response(
      JSON.stringify(command),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (url.pathname === "/sse") {
    let counter = 0;
    const body = new ReadableStream({
      start(controller) {
        let isConnected = true;

        // Clear the log when connection starts
        const clearPayload = {
          html: "",
          patchTarget: "#sse-log",
          patchMode: "replace",
        };
        controller.enqueue(new TextEncoder().encode("event: hs-patch-html\n"));
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(clearPayload)}\n\n`),
        );

        const interval = setInterval(() => {
          if (!isConnected) {
            clearInterval(interval);
            return;
          }

          counter++;

          try {
            // Send counter update
            controller.enqueue(
              new TextEncoder().encode("event: hs-patch-signals\n"),
            );
            controller.enqueue(
              new TextEncoder().encode(`data: {"liveCounter": ${counter}}\n\n`),
            );

            // Send log entries with different event types
            let logMessage;
            let logClass = "p-2 text-cyan-400 font-mono text-sm";

            if (counter === 1) {
              logMessage = `🚀 Connection established at ${
                new Date().toLocaleTimeString()
              }`;
              logClass += " bg-green-900 border border-green-400";
            } else if (counter % 3 === 0) {
              logMessage = `📊 Data update #${counter} received at ${
                new Date().toLocaleTimeString()
              }`;
              logClass += " bg-blue-900 border border-blue-400";
            } else if (counter % 7 === 0) {
              logMessage = `⚡ Performance checkpoint #${
                Math.floor(counter / 7)
              } at ${new Date().toLocaleTimeString()}`;
              logClass += " bg-yellow-900 border border-yellow-400";
            } else if (counter === 15) {
              logMessage = `⚠️  Approaching connection limit at ${
                new Date().toLocaleTimeString()
              }`;
              logClass += " bg-orange-900 border border-orange-400";
            } else {
              logMessage = `📦 Heartbeat ${counter} at ${
                new Date().toLocaleTimeString()
              }`;
              logClass += " bg-gray-900 border border-gray-400";
            }

            const htmlFragment = `<div class="${logClass}">${logMessage}</div>`;
            const eventPayload = {
              html: htmlFragment,
              patchTarget: "#sse-log",
              patchMode: "prepend",
            };

            controller.enqueue(
              new TextEncoder().encode("event: hs-patch-html\n"),
            );
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify(eventPayload)}\n\n`,
              ),
            );

            // Stop after 20 updates
            if (counter >= 20) {
              // Send final log entry
              const finalMessage =
                `🔴 Connection closed after ${counter} events at ${
                  new Date().toLocaleTimeString()
                }`;
              const finalHtml =
                `<div class="p-2 text-red-400 font-mono text-sm bg-red-900 border border-red-400">${finalMessage}</div>`;
              const finalPayload = {
                html: finalHtml,
                patchTarget: "#sse-log",
                patchMode: "prepend",
              };

              controller.enqueue(
                new TextEncoder().encode("event: hs-patch-html\n"),
              );
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify(finalPayload)}\n\n`,
                ),
              );

              clearInterval(interval);
              controller.close();
              isConnected = false;
            }
          } catch (_error) {
            // Connection was closed, stop the interval
            clearInterval(interval);
            isConnected = false;
          }
        }, 1000);

        // Handle connection close
        const cleanup = () => {
          isConnected = false;
          clearInterval(interval);
        };

        // Set up cleanup on stream cancel
        return cleanup;
      },
      cancel() {
        // This is called when the client disconnects
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

  // Serve static files
  try {
    return await serveDir(req, {
      fsRoot: ".",
      quiet: true,
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

async function serveFile(path: string): Promise<Response> {
  try {
    const file = await Deno.readFile(path);
    const ext = path.split(".").pop();
    const contentType = ext === "html"
      ? "text/html"
      : ext === "js"
      ? "application/javascript"
      : "text/plain";

    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}

console.log(`HyperStim Example Server running on http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);
