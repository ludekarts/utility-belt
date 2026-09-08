# Utility Belt

JavaScript Utilities Collection

## Error Handling

Utility Belt uses the following error and result conventions:

- Synchronous utilities throw `Error` when their input is invalid or a required browser API is unavailable.
- Promise-based utilities, including `request`, `compressJson`, and `decompressJson`, resolve with a value or reject with the underlying failure. Callers should use `await`/`try...catch` or `.catch()`.
- Callback-based DOM loading through `importHtml` renders its failure state and then invokes its completion callback so subsequent imports can continue.
- `copyToClipboard` is a legacy helper that returns the copied string on success and `undefined` on failure; its current behavior is retained for compatibility.
