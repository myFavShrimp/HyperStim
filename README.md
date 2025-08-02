# HyperStim

A hypermedia framework inspired by [datastar](https://data-star.dev) and HTMX, implementing reactive signals and HTML-driven interactions with a minimal footprint.

## Overview

HyperStim brings reactive programming to HTML through data attributes, eliminating the need for complex build systems or large JavaScript frameworks. It provides:

- **Reactive Signals**: Declare and bind state directly in HTML
- **Automatic Form Hijacking**: Seamless AJAX form submissions with progress tracking
- **Server-Sent Events**: Real-time updates with automatic DOM patching
- **Effect System**: Reactive computations that update when dependencies change
- **Event Handling**: Powerful event binding with modifiers for timing, conditions, and more

## Installation

Build from source:

```bash
deno task bundle
```

Include HyperStim in your HTML:

```html
<script type="module" src="dist/hyperstim.min.js"></script>
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="dist/hyperstim.min.js"></script>
</head>
<body>
    <!-- Declare a signal -->
    <div data-signals-counter="0"></div>
    
    <!-- Display the signal -->
    <h1 data-effect="this.textContent = counter()"></h1>
    
    <!-- Buttons to modify the signal -->
    <button data-on-click="counter(counter() - 1)">-1</button>
    <button data-on-click="counter(counter() + 1)">+1</button>
</body>
</html>
```

## Core Concepts

### Signals

Signals are reactive values that automatically notify dependents when they change. HyperStim uses the [alien-signals](https://github.com/alien-signals/alien-signals) library for optimal performance.

**Declaration**:
```html
<!-- Single signal -->
<div data-signals-username="'John'"></div>
<div data-signals-count="0"></div>

<!-- Multiple signals -->
<div data-signals="{ username: 'John', count: 0 }"></div>
```

**Usage**:
```html
<!-- Reading a signal -->
<span data-effect="this.textContent = username()"></span>

<!-- Writing to a signal -->
<button data-on-click="count(count() + 1)">Increment</button>
```

### Effects

Effects run immediately and re-run whenever their signal dependencies change:

```html
<div data-effect="this.textContent = `Hello ${username()}!`"></div>
<div data-effect="this.style.display = count() > 5 ? 'block' : 'none'"></div>
```

### Computed Values

Computed signals derive their value from other signals:

```html
<div data-computed-total="price() * quantity()"></div>
<span data-effect="this.textContent = total()"></span>
```

### Two-Way Binding

Bind form controls to signals for automatic synchronization:

```html
<div data-signals-message="'Hello'"></div>
<input data-bind="message()" type="text">
<p data-effect="this.textContent = message()"></p>
```

## Attributes Reference

### `data-signals`

Declare reactive signals.

**Syntax**:
```html
<!-- Named signal -->
<div data-signals-{name}="{expression}"></div>

<!-- Multiple signals -->
<div data-signals="{object}"></div>
```

**Examples**:
```html
<div data-signals-counter="0"></div>
<div data-signals-user="{ name: 'Alice', age: 30 }"></div>
<div data-signals="{ x: 0, y: 0, visible: true }"></div>
```

### `data-effect`

Run expressions reactively when dependencies change. Multiple expressions must be separated by commas.

**Syntax**:
```html
<element data-effect="{expression}"></element>
<element data-effect="{expression1}, {expression2}"></element>
```

**Examples**:
```html
<h1 data-effect="this.textContent = counter()"></h1>
<div data-effect="this.className = active() ? 'active' : ''"></div>
<div data-effect="console.log('Counter changed:', counter())"></div>

<!-- Multiple expressions separated by commas -->
<div data-effect="this.textContent = counter(), this.style.color = counter() > 10 ? 'red' : 'black'"></div>
```

### `data-computed`

Create derived signals from other signals. Multiple expressions must be separated by commas. When using multiple expressions, only the last expression's value will be assigned to the computed signal.

**Syntax**:
```html
<element data-computed-{name}="{expression}"></element>
<element data-computed-{name}="{expression1}, {expression2}"></element>
```

**Examples**:
```html
<div data-computed-total="price() * quantity()"></div>
<div data-computed-fullname="firstName() + ' ' + lastName()"></div>

<!-- Multiple expressions - only the last value is used -->
<div data-computed-result="console.log('Computing...'), price() * quantity()"></div>
<!-- The computed 'result' signal will contain price() * quantity(), not the console.log -->
```

### `data-bind`

Two-way binding between form controls and signals.

**Syntax**:
```html
<input data-bind="{signalName}()">
<textarea data-bind="{signalName}()"></textarea>
<select data-bind="{signalName}()"></select>
```

**Examples**:
```html
<input data-bind="username()" type="text">
<input data-bind="agreed()" type="checkbox">
<select data-bind="country()">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
</select>
```

### `data-on`

Handle DOM events with modifiers.

**Syntax**:
```html
<element data-on-{event}[__{modifier}]="{expression}"></element>
```

**Basic Events**:
```html
<button data-on-click="counter(counter() + 1)">Click me</button>
<input data-on-input="query(this.value)" type="text">
<form data-on-submit="handleSubmit(event)"></form>
```

**Event Modifiers**:
```html
<!-- Prevent default behavior -->
<form data-on-submit__prevent="submitForm()"></form>

<!-- Stop propagation -->
<div data-on-click__stop="handleClick()"></div>

<!-- Only trusted events -->
<button data-on-click__trusted="safeAction()"></button>

<!-- Timing modifiers -->
<input data-on-input__debounce.300ms="search(this.value)">
<button data-on-click__throttle.1s="heavyOperation()">Process</button>

<!-- Multiple modifiers -->
<form data-on-submit__prevent__trusted="submitForm()"></form>
```

## Actions

### Fetch Action

Perform HTTP requests with built-in progress tracking and response handling.

**Usage**:
```html
<div data-signals-api="fetch('/api/data')"></div>
<button data-on-click="api().trigger()">Load Data</button>

<!-- Monitor state -->
<div data-effect="this.textContent = api().state()"></div>
<div data-effect="this.style.display = api().state() === 'pending' ? 'block' : 'none'">
    Loading...
</div>
```

**Action States**:
- `initial`: Action created but not yet triggered
- `pending`: Request in progress
- `success`: Request completed successfully
- `error`: Request failed (check `error()` for details)

**Progress Tracking**:
```html
<!-- Upload progress -->
<div data-effect="
    const progress = api().uploadProgress(),
    this.textContent = progress.percent ? `${progress.percent}%` : 'Uploading...'
"></div>

<!-- Download progress -->
<div data-effect="
    const progress = api().downloadProgress(),
    this.style.width = (progress.percent || 0) + '%'
"></div>
```

**Response Handling**:

HyperStim automatically processes responses based on `Content-Type`:

- `text/html`: Patches DOM elements using `hs-target` and `hs-mode` headers
- `application/json`: Updates signals with the provided data
- `text/javascript`: Evaluates JavaScript expressions

**Server Response Examples**:
```javascript
// HTML response
res.setHeader('Content-Type', 'text/html');
res.setHeader('hs-target', '#content');
res.setHeader('hs-mode', 'replace');
res.send('<div>New content</div>');

// Signal update response
res.setHeader('Content-Type', 'application/json');
res.json({ counter: 42, message: 'Updated!' });

// JavaScript response
res.setHeader('Content-Type', 'text/javascript');
res.send('alert("Hello from server!")');
```

### Server-Sent Events

Real-time updates from the server.

**Usage**:
```html
<div data-signals-stream="sse('/events')"></div>
<button data-on-click="stream().connect()">Connect</button>
<button data-on-click="stream().close()">Disconnect</button>

<!-- Monitor connection state -->
<div data-effect="this.textContent = stream().state()"></div>
```

**Connection States**:
- `initial`: Stream created but not connected
- `connecting`: Attempting to establish connection
- `open`: Successfully connected and receiving events
- `error`: Connection failed (check `error()` for details)
- `closed`: Connection closed (manually or due to error)

**Connection Management**:
```html
<!-- Auto-reconnect on errors -->
<div data-effect="
    if (stream().state() === 'error') {
        setTimeout(() => stream().connect(), 5000);
    }
"></div>

<!-- Display connection status -->
<div data-effect="
    const state = stream().state(),
    this.textContent = state === 'open' ? '🟢 Connected' : 
                      state === 'connecting' ? '🟡 Connecting...' : 
                      '🔴 Disconnected'
"></div>
```

**Supported Event Types**:

HyperStim listens for these specific SSE event types:

- **`signals`**: Update signal values
  ```
  event: signals
  data: {"counter": 42, "username": "Alice"}
  ```

- **`html`**: Patch DOM elements
  ```
  event: html
  data: {"html": "<p>New content</p>", "patchTarget": "#container", "patchMode": "append"}
  ```

- **`javascript`**: Execute JavaScript expressions
  ```
  event: javascript
  data: console.log("Hello from server!")
  ```

## Form Hijacking

HyperStim automatically hijacks forms with the `data-hijack` attribute, converting them to AJAX submissions.

**Basic Usage**:
```html
<form action="/submit" method="post" data-hijack>
    <input name="username" type="text">
    <input name="email" type="email">
    <button type="submit">Submit</button>
</form>
```

**Accessing Form Action**:
```html
<form action="/submit" method="post" data-hijack>
    <input name="data" type="text">
    <button type="submit">Submit</button>
    
    <!-- Monitor form submission state -->
    <div data-effect="this.textContent = this.form.__hyperstim_action?.state()"></div>
</form>
```

**Supported Form Features**:
- All HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, etc.)
- Multiple encoding types:
  - `application/x-www-form-urlencoded` (default)
  - `multipart/form-data`
  - `application/json`
- Progress tracking for uploads and downloads
- Automatic error handling

**Programmatic Control**:
```html
<form action="/api/save" method="post" data-hijack>
    <input name="title" type="text">
    <button type="submit">Save</button>
</form>

<script>
// Access the form's fetch action
const form = document.querySelector('form');
const action = form.__hyperstim_action;

// Monitor progress
action.uploadProgress(); // { loaded: number, total: number, percent: number }
action.state(); // 'initial' | 'pending' | 'success' | 'error'

// Modify request before submission
action.options({ 
    headers: { 'Authorization': 'Bearer token' } 
});

// Trigger manually
action.trigger();
</script>
```

## Server Integration

### Response Headers

Control DOM patching with special headers:

- `hs-target`: CSS selector for the target element
- `hs-mode`: How to patch the content (`replace`, `append`, `prepend`, `before`, `after`)

### Patch Modes

```javascript
// Replace content
res.setHeader('hs-mode', 'replace');

// Append to content
res.setHeader('hs-mode', 'append');

// Insert before element
res.setHeader('hs-mode', 'before');
```

### Example Server (Deno)

```typescript
Deno.serve({ port: 8000 }, async (req) => {
    const url = new URL(req.url);
    
    if (url.pathname === '/api/data') {
        // Return HTML patch
        return new Response('<div>Updated content</div>', {
            headers: {
                'Content-Type': 'text/html',
                'hs-target': '#content',
                'hs-mode': 'replace'
            }
        });
    }
    
    if (url.pathname === '/api/signals') {
        // Update signals
        return new Response(JSON.stringify({
            counter: Math.floor(Math.random() * 100),
            timestamp: Date.now()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Serve static files
    // (implement static file serving as needed)
});
```

## Modifiers

Event handling supports powerful modifiers for timing, conditions, and behavior:

### Timing Modifiers

```html
<!-- Debounce: Wait for pause in events -->
<input data-on-input__debounce.300ms="search(this.value)">
<input data-on-input__debounce.1s.leading="search(this.value)">

<!-- Throttle: Limit frequency -->
<button data-on-click__throttle.1s="heavyOperation()">Process</button>
<div data-on-scroll__throttle.100ms="handleScroll()"></div>

<!-- Delay: Execute after timeout -->
<button data-on-click__delay.500="delayedAction()">Delayed</button>
```

### Condition Modifiers

```html
<!-- Only trusted events (not programmatically triggered) -->
<button data-on-click__trusted="secureAction()">Secure Action</button>

<!-- Execute only once -->
<div data-on-click__once="initialize()">Initialize</div>

<!-- Outside clicks -->
<div data-on-click__outside="closeModal()">Modal Content</div>
```

### Event Modifiers

```html
<!-- Prevent default -->
<form data-on-submit__prevent="handleSubmit()"></form>

<!-- Stop propagation -->
<div data-on-click__stop="handleClick()"></div>

<!-- Passive event listener -->
<div data-on-scroll__passive="handleScroll()"></div>

<!-- Capture phase -->
<div data-on-click__capture="handleClick()"></div>
```

### Target Modifiers

```html
<!-- Listen on window instead of element -->
<div data-on-resize__window="handleResize()"></div>
<div data-on-keydown__window="handleGlobalKeys()"></div>
```

### View Transition

```html
<!-- Wrap in view transition -->
<button data-on-click__viewtransition="changePage()">Navigate</button>
```

## API Access

HyperStim provides access to signals and actions through a global object:

### Global Object

Access all functionality via `globalThis.HyperStim`:

```javascript
// Access signals
const counterSignal = HyperStim.signals.counter;
counterSignal(42); // Set value
const value = counterSignal(); // Get value

// Create actions programmatically
const api = HyperStim.actions.fetch('/api/data', { method: 'POST' });
api.trigger();

const stream = HyperStim.actions.sse('/events');
stream.connect();
```

### Working with Signals

```javascript
// Check if signal exists
if ('mySignal' in HyperStim.signals) {
    console.log('Signal exists');
}

// Create signal programmatically (if using alien-signals directly)
import { signal } from 'alien-signals';
HyperStim.signals.newSignal = signal('initial value');

// Access all signals
console.log(Object.keys(HyperStim.signals));
```

### Action Management

```javascript
// Create and configure fetch action
const action = HyperStim.actions.fetch('/api/endpoint');
action.options({ 
    method: 'PUT',
    headers: { 'Authorization': 'Bearer token' }
});

// Monitor action state
console.log(action.state()); // 'initial', 'pending', 'success', 'error'
console.log(action.uploadProgress()); // { loaded, total, percent }

// SSE connection management
const sse = HyperStim.actions.sse('/live-updates');
sse.connect();
console.log(sse.state()); // 'initial', 'connecting', 'open', 'error', 'closed'
```

---

HyperStim brings the power of reactive programming to HTML without the complexity of traditional frameworks. Build dynamic, real-time applications with minimal JavaScript and maximum expressiveness.
