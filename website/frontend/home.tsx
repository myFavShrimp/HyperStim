import { Scaffold } from "./scaffold.tsx";

const FeatureCard = ({
    icon,
    title,
    description,
    borderColor,
    titleColor,
}: {
    icon: string;
    title: string;
    description: string;
    borderColor: string;
    titleColor: string;
}) => (
    <div class={`bg-black border-4 ${borderColor} p-4 pop-shadow`}>
        <div class="text-3xl mb-2">{icon}</div>
        <h3 class={`text-lg font-black ${titleColor} uppercase`}>{title}</h3>
        <p class="text-sm text-gray-300 font-normal">{description}</p>
    </div>
);

const CodePanel = ({ children }: { children: string }) => (
    <div class="bg-black p-4 sm:p-6 border-4 border-green-400 md:rotate-1">
        <h3 class="text-xl sm:text-2xl font-black mb-4 bg-green-400 text-black px-3 py-1 uppercase">
            THE CODE
        </h3>
        <pre class="code-block">
            <code>{children}</code>
        </pre>
    </div>
);

const SectionHeader = ({
    title,
    titleColor,
    subtitle,
    subtitleColor,
    bg,
    children,
}: {
    title: string;
    titleColor: string;
    subtitle: string;
    subtitleColor: string;
    bg?: string;
    children?: unknown;
}) => (
    <div
        class={`${bg ?? "bg-black border-2 border-white"} p-3 sm:p-4 mb-4 ${
            children ? "relative" : ""
        }`}
    >
        <h2
            class={`text-2xl sm:text-3xl font-black ${titleColor} mb-2 uppercase tracking-wider`}
        >
            {title}
        </h2>
        <p class={`${subtitleColor} text-base sm:text-lg font-semibold`}>
            {subtitle}
        </p>
        {children}
    </div>
);

const DemoSection = ({
    outerClass,
    demoClass,
    demoBadgeClass,
    code,
    header,
    children,
}: {
    outerClass: string;
    demoClass: string;
    demoBadgeClass: string;
    code: string;
    header: unknown;
    children: unknown;
}) => (
    <section class="mb-8 sm:mb-12">
        <div class={outerClass}>
            {header}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div
                    class={`bg-white text-black p-4 sm:p-6 ${demoClass} md:-rotate-1`}
                >
                    <h3
                        class={`text-xl sm:text-2xl font-black mb-4 ${demoBadgeClass} px-3 py-1 uppercase`}
                    >
                        LIVE DEMO!
                    </h3>
                    {children}
                </div>
                <CodePanel>{code}</CodePanel>
            </div>
        </div>
    </section>
);

const COUNTER_CODE = `<div data-signals-counter="0">
  <div data-effect="this.textContent = counter()"></div>
  <button data-on-click="counter(counter() - 1)">-1</button>
  <button data-on-click="counter(counter() + 1)">+1</button>
</div>`;

const BINDING_CODE =
    `<div data-signals="{ name: 'Alice', email: 'alice@example.com' }">
  <input data-bind="name()" type="text">
  <input data-bind="email()" type="email">

  <div data-effect="this.textContent = \`Hello \${name()}!\`"></div>
</div>`;

const COMPUTED_CODE = `<div data-signals="{ price: 29.99, quantity: 1 }"
     data-computed-subtotal="price() * quantity()"
     data-computed-tax="subtotal() * 0.1"
     data-computed-total="subtotal() + tax()">

  <input data-bind="price()" type="number">
  <input data-bind="quantity()" type="number">

  <div data-effect="this.textContent = '$' + total().toFixed(2)"></div>
</div>`;

const FETCH_CODE = `<div data-signals-random-counter="0"
     data-signals-api="fetch('/api/users')"
     data-signals-random-api="fetch('/api/counter')">
  <button data-on-click="api().trigger()">Load Users</button>
  <button data-on-click="randomApi().trigger()">Get Random</button>

  <div data-effect="this.textContent = api().state()"></div>
  <div data-effect="this.textContent = 'Random: ' + randomCounter()"></div>
</div>`;

const FORM_CODE = `<form action="/api/form" method="post" data-hijack>
  <input name="name" type="text" required>
  <input name="email" type="email" required>
  <button type="submit">Submit</button>

  <div data-effect="
    this.textContent = this.closest('form')?.hsFetch?.state()
  "></div>
</form>`;

const SSE_CODE = `<div data-signals-stream="sse('/sse')">
  <button data-on-click="stream().connect()">Connect</button>
  <button data-on-click="stream().close()">Disconnect</button>

  <div data-effect="this.textContent = stream().state()"></div>
</div>`;

const MODIFIERS_CODE = `<div data-signals="{ searchQuery: '', clicks: 0,
  searchMessage: '', onceMessage: '' }">
  <!-- Debounced search -->
  <input data-bind="searchQuery()"
         data-on-input__debounce.300ms="searchMessage(
           'SEARCHING FOR: ' + this.value)">

  <!-- Throttled button -->
  <button data-on-click__throttle.1s="clicks(clicks() + 1)">
    Click Me
  </button>

  <!-- One-time button -->
  <button data-on-click__once="onceMessage('Done!')">
    One-Time
  </button>
</div>`;

const Hero = () => (
    <section class="retro-card py-12 sm:py-20 px-4 border-b-8 border-black">
        <div class="max-w-4xl mx-auto text-center">
            <div class="bg-black comic-border p-6 sm:p-10 pop-shadow inline-block">
                <h2 class="text-3xl sm:text-5xl font-black text-cyan-400 uppercase tracking-wider neon-glow mb-4">
                    REACTIVE SIGNALS IN HTML
                </h2>
                <p class="text-lg sm:text-2xl font-bold text-yellow-300 uppercase mb-6">
                    NO BUILD STEP. NO VIRTUAL DOM. JUST HTML.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#demos"
                        class="px-6 py-3 bg-green-500 text-black font-black text-lg comic-border hover:bg-green-400 transform active:scale-95 transition-all uppercase pop-shadow inline-block"
                    >
                        SEE DEMOS!
                    </a>
                    <a
                        href="https://github.com/myFavShrimp/hyperstim"
                        class="px-6 py-3 bg-pink-500 text-white font-black text-lg comic-border hover:bg-pink-400 transform active:scale-95 transition-all uppercase pop-shadow inline-block"
                    >
                        GET THE CODE!
                    </a>
                </div>
            </div>
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <FeatureCard
                    icon="&#x26A1;"
                    title="TINY"
                    description="Minimal footprint, maximum power"
                    borderColor="border-cyan-400"
                    titleColor="text-cyan-400"
                />
                <FeatureCard
                    icon="&#x1F3AF;"
                    title="DECLARATIVE"
                    description="All behavior in HTML data attributes"
                    borderColor="border-pink-400"
                    titleColor="text-pink-400"
                />
                <FeatureCard
                    icon="&#x1F504;"
                    title="REACTIVE"
                    description="Automatic updates with signals"
                    borderColor="border-yellow-400"
                    titleColor="text-yellow-400"
                />
            </div>
        </div>
    </section>
);

const Install = () => (
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div class="bg-black border-4 border-green-400 p-6 sm:p-8 pop-shadow">
            <h2 class="text-2xl sm:text-3xl font-black text-green-400 uppercase tracking-wider mb-6">
                GET STARTED
            </h2>
            <div class="space-y-4">
                <div>
                    <p class="text-yellow-300 font-black uppercase mb-2">
                        1. GRAB THE LATEST BUILD FROM{" "}
                        <a
                            href="https://github.com/myFavShrimp/HyperStim/releases/latest"
                            class="underline text-cyan-400 hover:text-cyan-300"
                        >
                            GITHUB
                        </a>
                    </p>
                </div>
                <div>
                    <p class="text-yellow-300 font-black uppercase mb-2">
                        2. INCLUDE IN YOUR HTML:
                    </p>
                    <pre class="code-block">
                        <code>
                            {'<script type="module" src="dist/hyperstim.min.js"></script>'}
                        </code>
                    </pre>
                </div>
                <div>
                    <p class="text-yellow-300 font-black uppercase mb-2">
                        3. START USING DATA ATTRIBUTES:
                    </p>
                    <pre class="code-block">
                        <code>
                            {`<div data-signals-counter="0">
  <span data-effect="this.textContent = counter()"></span>
  <button data-on-click="counter(counter() + 1)">+1</button>
</div>`}
                        </code>
                    </pre>
                </div>
            </div>
            <p class="text-green-300 font-bold text-xs uppercase mt-4">
                Build instructions can be found in the{" "}
                <a
                    href="https://github.com/myFavShrimp/HyperStim"
                    class="underline text-cyan-400 hover:text-cyan-300"
                >
                    repository
                </a>
            </p>
        </div>
    </section>
);

const CounterDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 comic-border p-4 sm:p-6 md:hover:rotate-1 transition-transform pop-shadow halftone-dots"
        header={
            <SectionHeader
                title="1. BASIC SIGNALS &amp; EFFECTS"
                titleColor="text-white"
                subtitle="REACTIVE VALUES THAT UPDATE!"
                subtitleColor="text-yellow-300"
                bg="bg-red-500 comic-border"
            >
                <div class="hidden sm:block absolute -top-2 -right-4 bg-yellow-400 text-black px-4 py-2 transform rotate-12 rounded-full border-4 border-black">
                    <span class="font-black text-xs">WOW!</span>
                </div>
            </SectionHeader>
        }
        demoClass="comic-border pop-shadow relative"
        demoBadgeClass="bg-pink-500 text-white comic-border"
        code={COUNTER_CODE}
    >
        <div class="space-y-4" data-signals-counter="0">
            <div class="text-center">
                <div
                    class="text-6xl sm:text-8xl font-black text-red-600 mb-4 neon-glow comic-border bg-yellow-200 px-4 py-2 inline-block"
                    data-effect="this.textContent = counter()"
                >
                </div>
                <div class="flex flex-wrap justify-center gap-2">
                    <button
                        data-on-click="counter(counter() - 1)"
                        class="px-4 sm:px-6 py-3 bg-red-600 text-white font-black text-lg sm:text-xl comic-border hover:bg-red-700 transform active:scale-95 transition-all uppercase pop-shadow"
                    >
                        BANG! -1
                    </button>
                    <button
                        data-on-click="counter(0)"
                        class="px-4 sm:px-6 py-3 bg-gray-800 text-yellow-400 font-black text-lg sm:text-xl comic-border hover:bg-gray-900 transform active:scale-95 transition-all uppercase pop-shadow"
                    >
                        ZAP! RESET
                    </button>
                    <button
                        data-on-click="counter(counter() + 1)"
                        class="px-4 sm:px-6 py-3 bg-green-600 text-white font-black text-lg sm:text-xl comic-border hover:bg-green-700 transform active:scale-95 transition-all uppercase pop-shadow"
                    >
                        POW! +1
                    </button>
                </div>
            </div>
            <div
                class="text-center text-lg sm:text-xl font-black bg-yellow-400 text-black px-4 py-2 comic-border pop-shadow sm:skew-x-3"
                data-effect="this.textContent = counter() === 0 ? 'KAPOW! AT ZERO!' : counter() > 0 ? 'WHAM! POSITIVE!' : 'BANG! NEGATIVE!'"
            >
            </div>
        </div>
    </DemoSection>
);

const BindingDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 border-4 border-cyan-400 p-4 sm:p-6 md:hover:-rotate-1 transition-transform"
        header={
            <SectionHeader
                title="2. TWO-WAY DATA BINDING"
                titleColor="text-cyan-400"
                subtitle="FORMS THAT SYNC AUTOMATICALLY!"
                subtitleColor="text-pink-300"
            />
        }
        demoClass="border-4 border-cyan-500"
        demoBadgeClass="bg-cyan-500 text-white"
        code={BINDING_CODE}
    >
        <div
            class="space-y-4"
            data-signals="{ name: 'Alice', email: 'alice@example.com', agreed: false }"
        >
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    NAME
                </label>
                <input
                    data-bind="name()"
                    type="text"
                    class="w-full px-4 py-3 border-4 border-pink-500 text-xl font-bold bg-yellow-100 text-black focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-600"
                />
            </div>
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    EMAIL
                </label>
                <input
                    data-bind="email()"
                    type="email"
                    class="w-full px-4 py-3 border-4 border-pink-500 text-xl font-bold bg-yellow-100 text-black focus:outline-none focus:ring-4 focus:ring-pink-300 focus:border-pink-600"
                />
            </div>
            <div class="flex items-center">
                <input
                    data-bind="agreed()"
                    type="checkbox"
                    id="agree"
                    class="mr-3 h-6 w-6 text-cyan-600 focus:ring-cyan-500 border-4 border-black"
                />
                <label
                    for="agree"
                    class="text-lg font-black text-black uppercase"
                >
                    I AGREE TO THE TERMS
                </label>
            </div>
            <div class="p-4 bg-black border-4 border-yellow-400 sm:rotate-1">
                <div class="text-lg font-black text-yellow-400 mb-2 uppercase">
                    LIVE PREVIEW:
                </div>
                <div
                    data-effect="this.textContent = `HELLO ${name().toUpperCase()}! EMAIL: ${email().toUpperCase()}`"
                    class="font-black text-cyan-400 text-lg sm:text-xl neon-glow break-all"
                >
                </div>
                <div
                    data-effect="this.textContent = agreed() ? 'TERMS ACCEPTED!' : 'PLEASE ACCEPT TERMS!'"
                    class="text-lg font-black mt-2 text-pink-400"
                >
                </div>
            </div>
        </div>
    </DemoSection>
);

const ComputedDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-green-500 via-yellow-500 to-red-600 border-4 border-pink-400 p-4 sm:p-6 md:hover:rotate-1 transition-transform"
        header={
            <SectionHeader
                title="3. COMPUTED SIGNALS"
                titleColor="text-pink-400"
                subtitle="DERIVED VALUES THAT UPDATE AUTOMATICALLY!"
                subtitleColor="text-green-300"
            />
        }
        demoClass="border-4 border-yellow-500"
        demoBadgeClass="bg-yellow-500 text-black"
        code={COMPUTED_CODE}
    >
        <div
            class="space-y-4"
            data-signals="{ price: 29.99, quantity: 1, taxRate: 0.1 }"
            data-computed-subtotal="price() * quantity()"
            data-computed-tax="subtotal() * taxRate()"
            data-computed-total="subtotal() + tax()"
        >
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    PRICE ($)
                </label>
                <input
                    data-bind="price()"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-3 border-4 border-green-500 text-xl font-bold bg-cyan-100 text-black focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-600"
                />
            </div>
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    QUANTITY
                </label>
                <input
                    data-bind="quantity()"
                    type="number"
                    min="1"
                    class="w-full px-4 py-3 border-4 border-green-500 text-xl font-bold bg-cyan-100 text-black focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-600"
                />
            </div>
            <div class="border-t-4 border-red-500 pt-4">
                <div class="space-y-3 text-lg font-black">
                    <div class="flex justify-between bg-pink-200 px-3 py-2 border-2 border-black">
                        <span class="uppercase">SUBTOTAL:</span>
                        <span
                            data-effect="this.textContent = '$' + subtotal().toFixed(2)"
                            class="text-red-600"
                        >
                        </span>
                    </div>
                    <div class="flex justify-between bg-yellow-200 px-3 py-2 border-2 border-black">
                        <span class="uppercase">TAX (10%):</span>
                        <span
                            data-effect="this.textContent = '$' + tax().toFixed(2)"
                            class="text-red-600"
                        >
                        </span>
                    </div>
                    <div class="flex justify-between bg-green-200 px-3 py-2 border-4 border-black text-xl sm:text-2xl neon-glow">
                        <span class="uppercase">TOTAL:</span>
                        <span
                            data-effect="this.textContent = '$' + total().toFixed(2)"
                            class="text-red-800"
                        >
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </DemoSection>
);

const FetchDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-purple-600 via-red-500 to-orange-600 comic-border p-4 sm:p-6 md:hover:-rotate-1 transition-transform pop-shadow halftone-dots"
        header={
            <SectionHeader
                title="4. FETCH ACTIONS"
                titleColor="text-white"
                subtitle="HTTP REQUESTS WITH STATE!"
                subtitleColor="text-black"
                bg="bg-green-500 comic-border"
            >
                <div class="hidden sm:block absolute -top-3 -right-3 bg-orange-400 text-black px-3 py-1 comic-border transform rotate-12">
                    <span class="font-black text-sm">AJAX!</span>
                </div>
            </SectionHeader>
        }
        demoClass="border-4 border-purple-500"
        demoBadgeClass="bg-purple-500 text-white"
        code={FETCH_CODE}
    >
        <div
            class="space-y-4"
            data-signals-random-counter="0"
            data-signals-api="fetch('/api/users')"
            data-signals-random-api="fetch('/api/counter')"
        >
            <div class="flex flex-wrap gap-2">
                <button
                    data-on-click="api().trigger()"
                    class="px-4 sm:px-6 py-3 bg-blue-600 text-white font-black text-base sm:text-lg border-4 border-black hover:bg-blue-700 transform active:scale-95 transition-all uppercase"
                >
                    LOAD USERS
                </button>
                <button
                    data-on-click="randomApi().trigger()"
                    class="px-4 sm:px-6 py-3 bg-purple-600 text-white font-black text-base sm:text-lg border-4 border-black hover:bg-purple-700 transform active:scale-95 transition-all uppercase"
                >
                    GET RANDOM
                </button>
                <button
                    data-on-click="api().abort()"
                    class="px-4 sm:px-6 py-3 bg-red-600 text-white font-black text-base sm:text-lg border-4 border-black hover:bg-red-700 transform active:scale-95 transition-all uppercase"
                >
                    ABORT
                </button>
            </div>

            <div class="space-y-3">
                <div
                    data-effect="this.textContent = 'STATUS: ' + api().state().toUpperCase()"
                    class="text-lg sm:text-xl font-black bg-yellow-400 text-black px-4 py-2 border-2 border-black uppercase"
                >
                </div>
                <div
                    data-effect="this.style.display = api().state() === 'pending' ? 'block' : 'none'"
                    class="bg-black p-4 border-2 border-cyan-400"
                >
                    <div class="text-cyan-400 text-base sm:text-lg font-black mb-2 uppercase">
                        LOADING DATA...
                    </div>
                    <div class="w-full bg-gray-800 border-2 border-cyan-400 h-4 relative overflow-hidden">
                        <div
                            class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
                            data-effect="this.style.width = (api().downloadProgress().percent || 0) + '%'"
                        >
                        </div>
                    </div>
                    <div
                        class="text-xs text-cyan-300 mt-1 font-mono"
                        data-effect="this.textContent = 'Progress: ' + Math.round(api().downloadProgress().percent || 0) + '% (' + (api().downloadProgress().loaded || 0) + '/' + (api().downloadProgress().total || '?') + ' bytes)'"
                    >
                    </div>
                </div>
            </div>

            <div
                id="users-list"
                class="space-y-2 bg-black p-4 border-4 border-cyan-400 min-h-16"
            >
            </div>
            <div class="bg-black p-4 border-4 border-pink-400 min-h-16">
                <div
                    data-effect="this.textContent = randomCounter() === 0 ? 'CLICK GET RANDOM FOR A NUMBER!' : 'RANDOM NUMBER: ' + randomCounter()"
                    class="text-base sm:text-lg font-black text-pink-400 uppercase"
                >
                </div>
            </div>
        </div>
    </DemoSection>
);

const FormDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-red-600 via-pink-500 to-purple-700 border-4 border-yellow-400 p-4 sm:p-6 md:hover:rotate-1 transition-transform"
        header={
            <SectionHeader
                title="5. FORM HIJACKING"
                titleColor="text-yellow-400"
                subtitle="AUTOMATIC AJAX FORMS WITH RESPONSE HANDLING!"
                subtitleColor="text-red-300"
            />
        }
        demoClass="border-4 border-red-500"
        demoBadgeClass="bg-red-500 text-white"
        code={FORM_CODE}
    >
        <form
            action="/api/form"
            method="post"
            data-hijack=""
            class="space-y-4"
        >
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    NAME
                </label>
                <input
                    name="name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border-4 border-cyan-500 text-xl font-bold bg-yellow-100 text-black focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-600"
                />
            </div>
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    EMAIL
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border-4 border-cyan-500 text-xl font-bold bg-yellow-100 text-black focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-600"
                />
            </div>
            <button
                type="submit"
                class="w-full px-6 py-4 bg-green-600 text-white font-black text-xl border-4 border-black hover:bg-green-700 transform active:scale-95 transition-all uppercase neon-glow"
            >
                SUBMIT FORM!
            </button>
            <div
                data-effect="this.textContent = 'STATUS: ' + (this.closest('form')?.hsFetch?.state() || 'READY').toUpperCase()"
                class="text-lg font-black bg-black text-cyan-400 px-4 py-2 border-2 border-cyan-400 neon-glow uppercase"
            >
            </div>
        </form>
        <div
            id="form-result"
            class="mt-4 bg-black p-4 border-4 border-pink-400 min-h-16"
        >
        </div>
    </DemoSection>
);

const SseDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-cyan-500 via-green-500 to-blue-600 border-4 border-pink-400 p-4 sm:p-6 md:hover:-rotate-1 transition-transform"
        header={
            <SectionHeader
                title="6. SERVER-SENT EVENTS"
                titleColor="text-pink-400"
                subtitle="REAL-TIME UPDATES WITH AUTO DOM PATCHING!"
                subtitleColor="text-cyan-300"
            />
        }
        demoClass="border-4 border-green-500"
        demoBadgeClass="bg-green-500 text-white"
        code={SSE_CODE}
    >
        <div
            class="space-y-4"
            data-signals="{ liveCounter: 0 }"
            data-signals-stream="sse('/sse')"
        >
            <div class="flex flex-wrap gap-2">
                <button
                    data-on-click="stream().connect()"
                    class="px-4 sm:px-6 py-3 bg-green-600 text-white font-black text-base sm:text-lg border-4 border-black hover:bg-green-700 transform active:scale-95 transition-all uppercase"
                >
                    CONNECT
                </button>
                <button
                    data-on-click="stream().close()"
                    class="px-4 sm:px-6 py-3 bg-red-600 text-white font-black text-base sm:text-lg border-4 border-black hover:bg-red-700 transform active:scale-95 transition-all uppercase"
                >
                    DISCONNECT
                </button>
            </div>

            <div class="space-y-3">
                <div
                    data-effect="this.textContent = 'CONNECTION: ' + stream().state().toUpperCase()"
                    class="text-lg sm:text-xl font-black bg-cyan-400 text-black px-4 py-2 border-2 border-black uppercase"
                >
                </div>
                <div
                    data-effect="this.textContent = 'LIVE COUNTER: ' + liveCounter()"
                    class="text-xl sm:text-2xl font-black text-blue-600 bg-yellow-200 px-4 py-2 border-4 border-blue-600 neon-glow uppercase"
                >
                </div>
            </div>

            <div>
                <div class="text-base sm:text-lg font-black mb-2 bg-pink-400 text-black px-3 py-1 uppercase">
                    EVENT LOG:
                </div>
                <div
                    id="sse-log"
                    class="max-h-40 overflow-y-auto space-y-1 p-4 bg-black border-4 border-cyan-400 text-green-400 font-mono text-sm"
                >
                </div>
            </div>
        </div>
    </DemoSection>
);

const ModifiersDemo = () => (
    <DemoSection
        outerClass="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-700 border-4 border-cyan-400 p-4 sm:p-6 md:hover:rotate-1 transition-transform"
        header={
            <SectionHeader
                title="7. EVENT MODIFIERS"
                titleColor="text-cyan-400"
                subtitle="POWERFUL EVENT HANDLING WITH TIMING CONTROL!"
                subtitleColor="text-yellow-300"
            />
        }
        demoClass="border-4 border-orange-500"
        demoBadgeClass="bg-orange-500 text-white"
        code={MODIFIERS_CODE}
    >
        <div
            class="space-y-4"
            data-signals="{ searchQuery: '', clicks: 0, searchMessage: 'TYPE SOMETHING TO SEARCH...', onceMessage: 'CLICK THE BUTTON BELOW!' }"
        >
            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    DEBOUNCED SEARCH (300MS)
                </label>
                <input
                    data-bind="searchQuery()"
                    {...{
                        "data-on-input__debounce.300ms":
                            "searchMessage('SEARCHING FOR: ' + this.value.toUpperCase())",
                    }}
                    type="text"
                    placeholder="TYPE TO SEARCH..."
                    class="w-full px-4 py-3 border-4 border-purple-500 text-xl font-bold bg-cyan-100 text-black focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-600"
                />
                <div
                    data-effect="this.textContent = searchMessage()"
                    class="text-lg font-black text-purple-600 mt-2 bg-purple-200 px-3 py-1 border-2 border-purple-600"
                >
                </div>
            </div>

            <div>
                <label class="block text-lg font-black text-black mb-2 uppercase tracking-wide">
                    THROTTLED BUTTON (1S)
                </label>
                <button
                    {...{
                        "data-on-click__throttle.1s": "clicks(clicks() + 1)",
                    }}
                    class="px-6 py-3 bg-blue-600 text-white font-black text-lg border-4 border-black hover:bg-blue-700 transform active:scale-95 transition-all uppercase"
                >
                    CLICK ME!
                </button>
                <div
                    data-effect="this.textContent = 'CLICKS: ' + clicks()"
                    class="text-lg font-black text-blue-600 mt-2 bg-blue-200 px-3 py-1 border-2 border-blue-600"
                >
                </div>
            </div>

            <div>
                <button
                    data-on-click__once="onceMessage('THIS ONLY WORKS ONCE!')"
                    class="px-6 py-3 bg-orange-600 text-white font-black text-lg border-4 border-black hover:bg-orange-700 transform active:scale-95 transition-all uppercase neon-glow"
                >
                    ONE-TIME BUTTON
                </button>
                <div
                    data-effect="this.textContent = onceMessage()"
                    class="text-lg font-black text-orange-600 mt-2 bg-orange-200 px-3 py-1 border-2 border-orange-600"
                >
                </div>
            </div>
        </div>
    </DemoSection>
);

export const Home = () => (
    <Scaffold>
        <Hero />
        <Install />
        <main
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            id="demos"
        >
            <CounterDemo />
            <BindingDemo />
            <ComputedDemo />
            <FetchDemo />
            <FormDemo />
            <SseDemo />
            <ModifiersDemo />
        </main>
    </Scaffold>
);
