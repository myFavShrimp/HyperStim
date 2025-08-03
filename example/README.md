# HyperStim Examples

This directory contains a comprehensive example showcasing HyperStim's features with interactive demonstrations.

## Running the Example

From the repository root run the following commands:

```bash
deno task bundle
deno task example
```

Then open http://localhost:3000 in your browser.

## What's Included

The example demonstrates:

1. **Basic Signals & Effects** - Reactive counters and computed displays
2. **Two-Way Data Binding** - Form inputs synchronized with signals
3. **Computed Signals** - Derived values that update automatically  
4. **Fetch Actions** - HTTP requests with state management
5. **Form Hijacking** - Automatic AJAX form submissions
6. **Server-Sent Events** - Real-time updates from the server
7. **Event Modifiers** - Debouncing, throttling, and other modifiers

## Server Endpoints

- `/` - Serves the example page
- `/hyperstim.js` - Serves HyperStim from the dist directory
- `/api/users` - Returns sample user data (JSON)
- `/api/counter` - Returns a random counter value (JSON)
- `/api/form` - Handles form submissions (returns HTML)
- `/sse` - Server-sent events endpoint
