# HyperStim

A hypermedia framework inspired by [datastar](https://data-star.dev) and [HTMX](https://htmx.org), implementing reactive signals and HTML-driven interactions with a minimal footprint.

## Usage

HyperStim uses **reactive signals** to manage state and **data attributes** to define behavior directly in HTML. When a signal is declared, it becomes globally accessible and automatically updates any dependent elements when changed.

The core pattern:
1. Declare signals with `data-signals-name="value"`
2. React to changes with `data-effect="expression"`
3. Bind form inputs with `data-bind="signalName()"`
4. Handle events with `data-on-event="expression"`

Signals are automatically created and made available globally, so `data-signals-counter="0"` creates a `counter()` function usable anywhere in HTML.

## Installation

HyperStim encourages self-hosting and does not provide a CDN. Build from source:

```bash
deno task bundle
```

Include HyperStim in HTML:

```html
<script type="module" src="dist/hyperstim.min.js"></script>
```

## Actions

### Fetch

Perform HTTP requests with built-in progress tracking and response handling.

```html
<div data-signals-api="fetch('/api/data')"></div>
<button data-on-click="api().trigger()">Load Data</button>

<!-- Monitor state -->
<div data-effect="this.textContent = api().state()"></div>
<div data-effect="this.style.display = api().state() === 'pending' ? 'block' : 'none'">
    Loading...
</div>
```

#### Parameters

`fetch(resource, options)`

- `resource` (string|URL): The URL to fetch
- `options` (object, optional): Request options
  - `method`: HTTP method (GET, POST, etc.)
  - `headers`: Request headers object
  - `body`: Request body
  - `timeout`: Request timeout in milliseconds
  - `onOther` (function): Handler for custom [commands](#commands)
  - Plus other standard fetch options

#### Return value

The fetch action returns an object with the following properties:

- `state()`: Returns current state of the fetch action
- `error()`: Returns error details when state is `error`
- `uploadProgress()`: Returns upload progress `{ loaded, total, percent, lengthComputable }`
- `downloadProgress()`: Returns download progress `{ loaded, total, percent, lengthComputable }`
- `options(newOptions)`: Get/set request options (method, headers, body, etc.)
- `resource(newUrl)`: Get/set the request URL
- `trigger()`: Execute the request and return the action object
- `abort()`: Cancel the current request

##### State

- `initial`: Action created but not yet triggered
- `pending`: Request in progress
- `success`: Request completed successfully
- `error`: Request failed (check `error()` for details)
- `aborted`: Request was cancelled before completion

#### Response Handling

HyperStim automatically processes JSON responses containing [commands](#commands) that update signals, patch DOM elements, or execute JavaScript.

```html
<div data-signals-api="fetch('/api/data')"></div>
<button data-on-click="api().trigger()">Load Data</button>
```

```json
{"type": "hs-patch-signals", "counter": 42, "username": "Alice"}
```

### Server-Sent Events

Real-time updates via Server-Sent Events.

```html
<div data-signals-stream="sse('/events')"></div>
<button data-on-click="stream().connect()">Connect</button>
<button data-on-click="stream().close()">Disconnect</button>

<!-- Monitor connection state -->
<div data-effect="this.textContent = stream().state()"></div>
```

#### Parameters

`sse(url, options)`

- `url` (string|URL): The Server-Sent Events endpoint URL
- `options` (object, optional): SSE connection options
  - `openWhenHidden` (boolean): Whether to keep connection open when page is hidden (default: false)
  - `onOther` (function): Handler for custom [commands](#commands)
  - Plus all standard `RequestInit` options (method, headers, credentials, etc.)

#### Return Value

The sse action returns an object with the following properties:

- `state()`: Returns connection state (`initial`, `connecting`, `connected`, `error`, `closed`)
- `error()`: Returns error details when state is `error`
- `options(newOptions)`: Get/set SSE connection options
- `resource(newUrl)`: Get/set the SSE endpoint URL
- `connect()`: Establish SSE connection and return the action object
- `close()`: Close the SSE connection

#### Connection States

- `initial`: Stream created but not connected
- `connecting`: Attempting to establish connection
- `connected`: Successfully connected and receiving events
- `error`: Connection failed (check `error()` for details)
- `closed`: Connection closed

#### Event Handling

SSE endpoints send [commands](#commands) as events where the event name determines the command type.

```html
<div data-signals-stream="sse('/events')"></div>
<button data-on-click="stream().connect()">Connect</button>
```

```
event: hs-patch-signals
data: {"counter": 42, "username": "Alice"}
```

### Commands

Both fetch and SSE actions process commands that update signals, patch DOM elements, or execute JavaScript.

#### `hs-patch-signals`

Updates signal values. Any properties other than `type` become signal updates.

```json
{
  "type": "hs-patch-signals",
  "counter": 42,
  "username": "Alice"
}
```

#### `hs-patch-html`

Patches DOM elements. Requires `html` content, `patchTarget` CSS selector, and `patchMode`.

```json
{
  "type": "hs-patch-html",
  "html": "<p>New content</p>",
  "patchTarget": "#container",
  "patchMode": "append"
}
```

##### Patch Modes

HTML patches support different modes:

- `inner`: Replace element content (default)
- `outer`: Replace the entire element
- `append`: Append to element content  
- `prepend`: Prepend to element content
- `before`: Insert before the element
- `after`: Insert after the element

#### `hs-execute`

Executes JavaScript expressions. The `code` property contains the JavaScript to run.

```json
{
  "type": "hs-execute",
  "code": "console.log('Hello from server!')"
}
```

Multiple commands can be sent as an array in fetch responses:

```json
[
  {
    "type": "hs-patch-signals",
    "counter": 1
  },
  {
    "type": "hs-patch-html",
    "html": "<div>Updated</div>",
    "patchTarget": "#status",
    "patchMode": "inner"
  }
]
```

For SSE, the command type is specified as the event name:

```
event: hs-patch-signals
data: { "counter": 1 }


event: hs-patch-html
data: { "html": "<div>Updated</div>", "patchTarget": "#status", "patchMode": "inner" }
```

#### Custom Command Handling

Custom commands can be handled using the `onOther` option:

```html
<div data-signals-api="fetch('/api/data', {
  onOther: (command) => {
    console.log('Received custom command:', command.type);
    // ...
  }
})"></div>

<div data-signals-stream="sse('/events', {
  onOther: (command) => {
    console.log('Received custom command:', command.type);
    // ...
  }
})"></div>
```

## Form Hijacking

HyperStim automatically hijacks forms with the `data-hijack` attribute, converting them to AJAX submissions.

```html
<form action="/submit" method="post" data-hijack>
    <input name="username" type="text">
    <input name="email" type="email">

    <button type="submit">Submit</button>
    
    <!-- Monitor form submission state -->
    <div data-effect="this.textContent = this.form.__hyperstim_action?.state()"></div>
</form>
```

### Supported Form Features

- All HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.)
- Multiple encoding types:
  - `application/x-www-form-urlencoded` (default)
  - `multipart/form-data`
  - `application/json`
- Progress tracking for uploads and downloads
- Automatic error handling

### Form Action Object

Each hijacked form has a `__hyperstim_action` property that contains a regular fetch action object with all the same properties and methods documented above.

## Attributes Reference

### `data-signals`

Declare reactive signals.

- `data-signals-{name}="{expression}"` - Create named signal
- `data-signals="{object}"` - Create multiple signals from object

### `data-effect`

Run expressions reactively when dependencies change. Multiple expressions separated by commas.

`data-effect="{expression1}, {expression2}"`

### `data-computed`

Create derived signals from other signals. When using multiple expressions, only the last expression's value is assigned.

`data-computed-{name}="{expression1}, {expression2}"`

### `data-init`

Execute expressions once when the element is first processed.

`data-init="{expression}"`

### `data-bind`

Two-way binding between form controls and signals.

`data-bind="{signalName}()"`

Supports `input`, `textarea`, and `select` elements.

### `data-on`

Handle DOM events with optional modifiers.

`data-on-{event}[__{modifier}]="{expression}"`

#### Modifiers

Event handling supports optional modifiers:

- **Timing**: `debounce.{time}` (wait for pause), `throttle.{time}` (limit frequency), `delay.{ms}` (postpone execution)
- **Conditions**: `trusted` (user-initiated only), `once` (fire only once), `outside` (when clicking outside element)  
- **Event handling**: `prevent` (preventDefault), `stop` (stopPropagation), `passive` (non-blocking), `capture` (capture phase)
- **Targeting**: `window` (attach to window instead of element)

## Expression Context

All data-attribute expressions have access to the functionality exposed in `globalThis.HyperStim`, which is automatically spread into the expression context:

- **Declared signals by name** - From `HyperStim.signals.*` (e.g., `counter()` for a signal declared as `data-signals-counter`)
- **Action functions** - From `HyperStim.actions.*` (`fetch()`, `sse()`)  
- **Builtin functions** - From `HyperStim.builtin` (`builtin.signal()`, `builtin.effect()`, `builtin.computed()`)

### Signal Access

Signals declared with `data-signals-name` and computed signals declared with `data-computed-name` become accessible as `HyperStim.signals.name`. Regular signals accept no arguments to read, one argument to write. Computed signals are read-only.

### Action Creation

Actions can be created programmatically and return the same objects documented above with their respective properties and methods.

- `HyperStim.actions.fetch(resource, options)` - Creates a fetch action
- `HyperStim.actions.sse(url, options)` - Creates a SSE action

### Builtin Functions

`HyperStim.builtin` functions create signals, effects, and computed values programmatically:

- `HyperStim.builtin.signal(value)` - Creates reactive signal
- `HyperStim.builtin.effect(fn)` - Creates reactive effect
- `HyperStim.builtin.computed(fn)` - Creates computed signal

```javascript
// Creates a signal
const count = HyperStim.builtin.signal(0);

// Creates an effect that runs when `count` changes
const dispose = HyperStim.builtin.effect(() => {
  console.log('Count is:', count());
});

// Creates a computed signal
const doubled = HyperStim.builtin.computed(() => count() * 2);

// Updates the signal
count(5); // Effect logs: "Count is: 5", doubled() now returns 10

// Disposes the effect to stop it from running
dispose();
```
