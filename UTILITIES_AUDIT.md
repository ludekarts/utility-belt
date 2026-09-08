# Utilities Audit

## Scope and baseline

This audit covers every module in `src/utils/`, the public barrel in `src/index.ts`, and the browser tests in `tests/`.

`pnpm build` passed on 2026-09-08: TypeScript declaration generation and the Vite production bundles completed without diagnostics. The package does not define a `test` script, so the browser test files are not part of a repeatable CI command. Findings below are based on source inspection and that build result; a passing build does not exercise browser behavior.

Severity means likely impact to consumers, not merely code style. User-controlled values reaching HTML APIs are security-relevant only when the calling application supplies untrusted content.

## Priority actions

| Priority | Finding                                                           | Why it matters                                                                                                                               | Recommended action                                                                                                                          |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Unescaped HTML sinks in `componens.ts`                            | `html`, `$innerhtml`, and dynamic updates can assign caller-controlled strings to `innerHTML`. This can become DOM XSS.                      | Escape by default; require an explicit `unsafeHtml()` wrapper for trusted markup. Document the trust boundary and add XSS regression tests. |
| P1       | Browser globals are used without capability checks                | Clipboard, compression, UUID, fetch, and DOM helpers throw in unsupported browsers, SSR, workers, or non-secure contexts.                    | Guard each API with `globalThis`; return/reject with a documented error or provide a compatible fallback.                                   |
| P1       | `copyToClipboard` uses deprecated `execCommand` and hides failure | Clipboard writes can fail silently and the reused textarea remains mounted.                                                                  | Prefer `navigator.clipboard.writeText`; retain a bounded legacy fallback; return `Promise<boolean>` or reject with a clear error.           |
| P1       | Public component test expects private functions                   | `fragment` is exported, but `dynamicElement` and `createRepeater` are not exported while `tests/component.test.js` destructures them.        | Either test only public APIs or export documented public wrappers. Do not export internals accidentally.                                    |
| P2       | No automated test command and broad coverage gaps                 | Eight modules have no dedicated test file; browser tests are not wired into package scripts.                                                 | Add a browser-capable test runner and a `test` script before substantial refactoring.                                                       |
| P2       | Request cache identity and lifetime need an explicit policy       | In-memory cache can retain responses indefinitely. Callers control `requestHash`; cache behavior does not include a TTL or cache-size bound. | Define cache key ownership, TTL, maximum entries, invalidation, and sensitive-response policy.                                              |
| P2       | Event delegation cannot be disposed                               | `catchEvents` attaches listeners but exposes no remover.                                                                                     | Return `destroy()` that removes every installed listener and clears handler references.                                                     |

## Security findings

### S1 - HTML rendering APIs need a clear trust boundary (P0)

`src/utils/componens.ts` has multiple `innerHTML` / `insertAdjacentHTML` writes, including the documented `attribute:html` and `$innerhtml` binding paths. This is not safe for arbitrary text. A library-level escape helper exists, but the default rendering path does not make trusted versus untrusted markup explicit.

Fix: make interpolation and HTML attribute updates text-safe by default. Keep raw markup behind an intentionally named wrapper such as `unsafeHtml(value)`. Avoid treating a string as safe merely because it originated from application state. Add tests using payloads such as `<img src=x onerror=...>` and verify that they render as text.

### S2 - Script and markup loading require caller-side trust controls (P1)

`src/utils/dom.ts` fetches a caller-provided module URL and injects returned markup through `innerHTML` in `includeScriptTag`. `src/utils/componens.ts` also exposes markup construction. These helpers should be documented as trusted-origin APIs, not sanitizers.

Fix: do not add a weak homemade sanitizer. Accept only trusted URLs/content, make cross-origin expectations explicit, and offer a text-only alternative. Applications needing arbitrary rich HTML should use a maintained sanitizer at their boundary.

### S3 - Hashing name can suggest unsuitable security properties (P1)

`src/utils/hashing.ts` exposes `hashCode`, a conventional 32-bit non-cryptographic hash. It must not be used for authentication, signatures, passwords, integrity checks, or collision-sensitive identity. The `a & a` expression is redundant but produces the intended signed 32-bit coercion.

Fix: document `hashCode` as non-cryptographic and provide a separate async Web Crypto digest helper only if the package has a real integrity use case. Do not silently replace this function with a different numeric algorithm in a patch release because persisted keys may change.

### S4 - Sensitive responses can stay in process memory (P2)

`src/utils/request.ts` caches resolved responses in module-level state when `cacheRequest` is enabled. There is no time-to-live or capacity limit visible in the public options.

Fix: add an opt-in TTL/capacity policy, avoid caching authenticated or personal responses by default, and document that `clearCache` is needed after logout or permission changes.

## Reliability and compatibility findings

### R1 - Capability checks are missing for browser-only APIs (P1)

`clipboard.ts` assumes `document`; `hashing.ts` assumes `window`, `btoa`, `atob`, `CompressionStream`, and `DecompressionStream`; `general.ts` assumes `crypto.randomUUID`; `request.ts` assumes `fetch` and `AbortController`. These assumptions fail in older browsers and server-side execution.

Fix: check `globalThis` capabilities at the boundary and produce an actionable error. For compression, reject unsupported environments rather than returning a different, ambiguous wire format unless the format includes a version/prefix. For UUID, use `crypto.randomUUID` when available and otherwise either document the secure-context requirement or generate bytes with `crypto.getRandomValues`; never use `Math.random` for security identifiers.

### R2 - Clipboard API result is ambiguous (P1)

`copyToClipboard` returns the copied input string on its success path, `undefined` after an exception, and does not inspect the Boolean result from `document.execCommand("copy")`. It creates or retains a hidden element with a fixed global ID.

Fix: make it `async`, call `navigator.clipboard.writeText`, and return a success signal that reflects the actual write. The fallback must clean up an element it created and should respect a caller-supplied root only when it is connected.

### R3 - Component tests do not match the exported API (P1)

`src/index.ts` re-exports every module, including `fragment` from `dom.ts`. `tests/component.test.js` additionally expects `dynamicElement` and `createRepeater`, which are internal to `componens.ts`. The build cannot detect this because the tests are not typechecked or run by a package script.

Fix: decide whether those functions are supported API. Preferred: test through `html`/`component` behavior and keep the helpers private. If they must be public, export stable names and types deliberately, then add API-contract tests against the package entry point.

### R4 - Event lifecycle is incomplete (P2)

`catchEvents` installs an event listener per requested event but returns only `add` and `callHandler`; it cannot detach them. `keyboard` and `catchAction` return handlers intended for assignment and are safe when consumers overwrite/remove them, but the API does not explain lifecycle ownership.

Fix: add `destroy()` to `catchEvents`. Document that the handler-producing helpers do not attach listeners themselves. Add tests for nested targets, handler replacement, and disposal.

### R5 - Request behavior needs edge-case tests (P2)

`request.ts` builds URLs through `new URL(url)`, so relative URLs require a base and can throw. Request queue/cache keys are derived by `createRequestHash`; verify that method, URL, query/body, and caller-provided hashes meet the intended cache semantics. `clearCache(RegExp)` can also be surprising when callers pass a stateful regex with `g` or `y`.

Fix: document absolute-URL requirements or accept a base URL. Specify cache identity, reset regex `lastIndex` before each test, and test aborted/deduplicated promises, processor errors, rejected fallbacks, and cache invalidation.

### R6 - Type contracts contain weak points (P2)

`transformObject` uses `any` throughout its transformer contract and reconstructs non-array objects as `{}`, which loses prototypes, descriptors, symbols, `Date`, `Map`, `Set`, and class instances. `getFormFields<R>` accepts any requested result type without proving that it matches the form result.

Fix: document `transformObject` as plain-object/array-only or preserve special values explicitly. Replace unconstrained output assertions with an honest result type, or accept a schema/mapper from the caller.

### R7 - Form controls need semantic behavior tests (P2)

`forms.ts` handles inputs by `type`, but `updateForm` writes generic `.value` for simple values; boolean checkbox/radio updates therefore need explicit `checked` objects. The API is workable but easy to misuse. The test name `includeCheckboxValues` differs from the implementation option `includeCheckboxState`.

Fix: correct the test option name or add `includeCheckboxValues` as a deprecated alias. Make simple boolean updates set `checked` when the element is a checkbox/radio, if that is the desired ergonomic contract. Test selects, textareas, disabled controls, checkbox groups, radio groups, and empty groups.

### R8 - Query APIs use a non-obvious variadic calling convention (P3)

`getQueryParams(...params)` treats the last argument as a URL and preceding arguments as keys. It accepts URL-like strings rather than clearly modeling a URL plus keys, and return shape is ambiguous when no query exists.

Fix: prefer `getQueryParams(url, ...keys)` in the next major version, retaining the old form as deprecated compatibility. Use `URL`/`URLSearchParams` consistently and document relative URLs and duplicate key behavior.

### R9 - Utility-specific boundary cases need regression tests (P3)

Array mutations (`removeByIndex`, swaps, insertion), timers (`debounce`, `throttle`, `triggerIfRapid`), traversal cycles, selection behavior, and DOM movement all have semantic edge cases that a TypeScript build cannot validate.

Fix: add focused tests for invalid indexes and zero/negative chunk sizes; fake-timer tests for delay helpers; circular, sparse, and special-object tests for transforms; and DOM tests for fragment wrappers, attribute copying, and node order.

## Usability and maintainability findings

### U1 - Correct the `componens.ts` filename without breaking imports (P2)

The filename is misspelled. Rename it to `components.ts`, update the barrel, and leave a thin `componens.ts` compatibility re-export marked `@deprecated` until the next major release. This preserves deep-import consumers.

### U2 - Public names and documentation need cleanup (P3)

`plPlurals` is intentionally Polish-specific, so do not rename it to a generic `wordCase` merely to satisfy an outdated test. Either update the test or add a clearly documented generic wrapper. `highlight.ts` documentation shows `<em>` output even though the implementation produces `<strong>` output. `decompressJson` has a misspelled parameter name.

Fix: repair docs/tests to match the supported API, correct typos in the next compatible release, and use aliases only when there is evidence of published consumer use.

### U3 - Error/result conventions vary (P3)

Utilities alternate between throwing, returning `undefined`, logging to console, and returning input values. This complicates composition and makes failures easy to miss.

Fix: standardize per category: pure helpers throw for invalid programmer input; async/browser helpers reject with typed errors or return documented `Result` values; libraries should not call `console.error` by default.

## Module-by-module assessment

| Module         | Assessment                                                                                      | Tests               | Keep/remove recommendation                                                             |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| `arrays.ts`    | Broad useful set; clarify mutation and invalid-index behavior.                                  | `array.test.js`     | Keep; consolidate only after usage analysis.                                           |
| `clipboard.ts` | Deprecated copy mechanism, ambiguous result, DOM-only.                                          | None                | Keep after modernizing API.                                                            |
| `componens.ts` | Feature-rich but largest risk surface; HTML injection and undocumented internals.               | `component.test.js` | Keep; split later only after safety/API work.                                          |
| `delay.ts`     | Useful timing primitives; behavior needs fake-timer tests.                                      | None                | Keep.                                                                                  |
| `dom.ts`       | DOM-only helpers and trusted-markup/script boundary.                                            | None                | Keep, but separate safe text from raw markup APIs.                                     |
| `events.ts`    | Sound handler builders; `catchEvents` lacks disposal.                                           | None                | Keep.                                                                                  |
| `forms.ts`     | Useful extraction/update helpers; improve control semantics and type safety.                    | `forms.test.js`     | Keep.                                                                                  |
| `fuzzy.ts`     | Specialized algorithm; benchmark and test Unicode/ranking edge cases.                           | `fuzzy.test.js`     | Keep only if it has active consumers; otherwise consider a dedicated optional package. |
| `general.ts`   | Mixed helpers; UUID needs capability policy; Polish plural helper should remain clearly scoped. | `general.test.js`   | Keep; consider separating locale-specific code later.                                  |
| `hashing.ts`   | Hash is non-cryptographic; compression depends on modern browser APIs.                          | `hashing.test.js`   | Keep with explicit names/capability behavior.                                          |
| `highlight.ts` | Small helper; docs diverge from output and HTML result requires escaping context.               | None                | Keep if consumers need markup output; otherwise replace with match-range data.         |
| `history.ts`   | State/history behavior needs boundary and immutability tests.                                   | None                | Keep.                                                                                  |
| `pubsub.ts`    | Useful event primitive; tests should call the actual `emit` method, not `emit`.                 | `pubsub.test.js`    | Keep.                                                                                  |
| `query.ts`     | URL helpers work with `URLSearchParams`; improve API ordering/contracts.                        | `query.test.js`     | Keep.                                                                                  |
| `request.ts`   | High-value but highest async/state complexity; add cache/cancel/security policy.                | None                | Keep; do not remove without replacement.                                               |
| `strings.ts`   | Small, clear helpers; test Unicode/index bounds.                                                | `strings.test.js`   | Keep or fold into arrays only if usage proves redundancy.                              |
| `transform.ts` | Cycle-aware for plain objects/arrays; prototype semantics must be explicit.                     | None                | Keep after documenting scope.                                                          |

## Test and release plan

1. Add a test runner and `pnpm test` script that executes in a browser-like DOM environment; retain `pnpm build` as the type/package gate.
2. Add P0/P1 regressions first: unsafe HTML handling, clipboard success/failure, missing browser capability behavior, and public entry-point component tests.
3. Add request cache/abort tests, listener disposal tests, form control matrix tests, and transform prototype/cycle tests.
4. Add a CI workflow that runs test and build on supported Node/browser targets.
5. Make behavior changes in compatible steps: add correct aliases/options, mark legacy names with `@deprecated`, update documentation, and remove only in the next major release.

## Removal candidates

No module should be removed solely on this audit: repository-level usage was not established, and several helpers have tests or clear distinct responsibilities. The only immediate deletion candidate is dead, commented-out debug code in `request.ts` if history confirms it is unused. Consider extracting, rather than deleting, `fuzzy.ts` or the component runtime if bundle-size measurements show that consumers frequently need only small helpers.

Before deleting any export, search published consumers and package download usage, announce deprecation in a minor release, keep a compatibility alias for one major-version cycle, and record the migration path in the changelog.
