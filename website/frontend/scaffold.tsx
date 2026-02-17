import { raw } from "hono/html";

const styles = `
    pre code {
        font-size: 0.875rem;
        line-height: 1.25rem;
    }
    .code-block {
        background: #000;
        color: #4ade80;
        padding: 1rem;
        border-radius: 0;
        overflow-x: auto;
        font-size: 0.875rem;
        font-family: ui-monospace, monospace;
        border: 2px solid #00ff00;
        max-width: 100%;
        white-space: pre;
    }
    .retro-card {
        background: linear-gradient(45deg, #ff00ff 0%, #00ffff 25%, #ffff00 50%, #ff00ff 75%, #00ffff 100%);
        background-size: 400% 400%;
        animation: gradient-shift 4s ease infinite;
    }
    @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    .neon-glow {
        box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
    }
    .halftone-dots {
        background-image: radial-gradient(circle, #000 1px, transparent 1px);
        background-size: 8px 8px;
    }
    .comic-border {
        border: 6px solid #000;
        box-shadow: 0 0 0 2px #fff, 0 0 0 8px #000;
    }
    .speech-bubble::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 30px;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid currentColor;
    }
    .pop-shadow {
        box-shadow: 8px 8px 0px #000;
    }
    @media (max-width: 640px) {
        .pop-shadow {
            box-shadow: 4px 4px 0px #000;
        }
        .comic-border {
            border-width: 4px;
            box-shadow: 0 0 0 1px #fff, 0 0 0 5px #000;
        }
    }
`;

export const Scaffold = ({ children }: { children: unknown }) => (
    <>
        {raw("<!DOCTYPE html>")}
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>HyperStim - Reactive Hypermedia Framework</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script type="module" src="/hyperstim.js"></script>
                <style dangerouslySetInnerHTML={{ __html: styles }} />
            </head>
            <body class="bg-black min-h-screen text-white font-bold">
                <header class="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 border-b-4 border-yellow-400 halftone-dots">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">
                        <h1 class="text-4xl sm:text-6xl font-black text-white transform sm:-skew-x-6 neon-glow text-yellow-300 comic-border bg-red-500 px-4 sm:px-6 py-3 sm:py-4 inline-block pop-shadow">
                            HYPERSTIM
                        </h1>
                        <div class="bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-3 mt-4 sm:mt-6 transform sm:skew-x-6 inline-block comic-border pop-shadow relative speech-bubble">
                            <p class="text-base sm:text-xl font-black uppercase">
                                BAM! THE FUTURE OF REACTIVE WEB!
                            </p>
                        </div>
                        <div class="hidden sm:block absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 comic-border transform rotate-12">
                            <span class="text-lg font-black">NEW!</span>
                        </div>
                    </div>
                </header>

                {children}

                <footer class="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 border-t-8 border-yellow-400 mt-16 halftone-dots relative">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div class="text-center">
                            <div class="bg-black comic-border p-6 sm:-skew-x-3 inline-block pop-shadow relative">
                                <p class="text-2xl sm:text-3xl font-black text-cyan-400 uppercase tracking-wider neon-glow">
                                    HYPERSTIM
                                </p>
                                <p class="text-base sm:text-lg font-bold text-yellow-300 uppercase mt-2">
                                    BOOM! REACTIVE SIGNALS &amp; HTML!
                                </p>
                                <p class="mt-4">
                                    <a
                                        href="https://github.com/myFavShrimp/hyperstim"
                                        class="px-4 sm:px-6 py-3 bg-pink-500 text-white font-black text-base sm:text-lg comic-border hover:bg-pink-600 transform hover:scale-110 transition-all uppercase neon-glow inline-block pop-shadow"
                                    >
                                        GITHUB! CLICK!
                                    </a>
                                </p>
                                <div class="hidden sm:block absolute -top-4 -left-4 bg-yellow-400 text-black px-3 py-2 comic-border transform -rotate-12">
                                    <span class="font-black text-xs">
                                        OPEN SOURCE!
                                    </span>
                                </div>
                                <div class="hidden sm:block absolute -bottom-4 -right-4 bg-red-500 text-white px-3 py-2 comic-border transform rotate-12">
                                    <span class="font-black text-xs">
                                        FREE!
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    </>
);
