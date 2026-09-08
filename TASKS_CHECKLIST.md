# Utility Belt Task Checklist

Status: `TODO` | `IN PROGRESS` | `DONE` | `SKIPPED`

Work one item at a time. Update its status and notes before starting the next item.

## P0 - Security

- [x] `DONE` Define a safe HTML rendering boundary in `src/utils/componens.ts`.
- [x] `DONE` Escape untrusted interpolation and dynamic HTML updates by default.
- [x] `DONE` Add an explicit `unsafeHtml()` path for trusted markup.
- [x] `DONE` Add DOM XSS regression tests for component HTML rendering.
- [x] `DONE` Document trusted-content requirements for markup and script loading helpers.

## P1 - Reliability and Public API

- [x] `DONE` Add a browser-capable test runner and a `pnpm test` script.
- [ ] `SKIPPED` Modernize `copyToClipboard` with `navigator.clipboard.writeText` and a cleaned-up fallback.
- [ ] `SKIPPED` Define and test clipboard success/failure behavior.
- [ ] `TODO` Add capability checks and documented failures for browser-only APIs.
  - [x] `DONE` Guard `uid()` when `crypto.randomUUID` is unavailable.
  - [x] `DONE` Guard compression helpers when required Web APIs are unavailable.
  - [x] `DONE` Guard requests when `fetch` or `AbortController` is unavailable.
- [ ] `TODO` Resolve the component-test mismatch: test public APIs or deliberately export supported wrappers.
- [ ] `TODO` Document `hashCode` as non-cryptographic.
- [ ] `TODO` Define the trusted-origin contract for `includeScriptTag`.

## P2 - Behavior, Lifecycle, and Types

- [ ] `TODO` Define request-cache TTL, capacity, invalidation, and sensitive-response policy.
- [ ] `TODO` Add request cache, cancellation, and error-path regression tests.
- [ ] `TODO` Add `destroy()` disposal to `catchEvents` and test it.
- [ ] `TODO` Clarify and test form checkbox, radio, select, textarea, and disabled-control behavior.
- [ ] `TODO` Reconcile `includeCheckboxValues` test naming with `includeCheckboxState`.
- [ ] `TODO` Clarify `transformObject` plain-object and special-object semantics.
- [ ] `TODO` Replace weak type assertions in transform and form APIs where practical.
- [ ] `TODO` Rename `componens.ts` compatibly, retaining a deprecated re-export.

## P3 - API and Documentation Cleanup

- [ ] `TODO` Clarify query API ordering, relative URL support, and duplicate-key behavior.
- [ ] `TODO` Add boundary regression tests for arrays, delay helpers, transforms, and DOM helpers.
- [ ] `TODO` Correct documentation/test mismatches for `highlight`, `plPlurals`, and `decompressJson`.
- [ ] `TODO` Standardize error/result conventions by utility category.

## Release and CI

- [ ] `TODO` Add a CI workflow for test and build on supported targets.
- [ ] `TODO` Verify published-consumer impact before removing or renaming exports.
- [ ] `TODO` Record compatibility aliases and migration guidance in the changelog.

## Decision Log

| Item                                      | Decision  | Notes                                                                                                    |
| ----------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Initial setup                             | `DONE`    | Checklist created from `UTILITIES_AUDIT.md` on 2026-09-08.                                               |
| P0 HTML boundary                          | `DONE`    | `$innerhtml` now accepts only `unsafeHtml(trustedMarkup)`.                                               |
| P0 interpolation and trusted-content docs | `DONE`    | Interpolation uses DOM text nodes; raw markup and script APIs document their trust boundary.             |
| P0 XSS regressions                        | `DONE`    | Browser-harness tests cover safe creation/update, rejection of raw strings, and explicit trusted markup. |
| P1 clipboard work                         | `SKIPPED` | Deferred at user request; retain the current clipboard implementation.                                   |
| P1 browser tests                          | `DONE`    | `pnpm test` builds, opens `/tests/`, and keeps the browser harness available for visible results.        |
| P1 UUID capability check                  | `DONE`    | `uid()` now throws an actionable error when `crypto.randomUUID` is unavailable.                          |
| P1 compression capability check           | `DONE`    | Compression helpers now validate Web API support and throw actionable errors.                            |
| P1 request capability check               | `DONE`    | `request()` now validates `fetch` and `AbortController` support before making a request.                 |
