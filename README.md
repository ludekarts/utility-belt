# Utility Belt

JavaScript Utilities Collection see [full documentation](https://ludekarts.github.io/utility-belt). Press `?` key to enable index seach.

### Note

- Docs uses native [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) implementation. If something does not work it may be that you're using outdated browser.
- This package is **not isomorphic** it can be used only for frontend tech (for now).

## Installation


With NPM

```
npm install @ludekarts/utility-belt;
```

With Browser (unpkg)

```
<script src="https://unpkg.com/@ludekarts/utility-belt@latest/dist/utility-belt.umd.js"></script>
```


## Usage

With bundler

```
import { clipboard } from "@ludekarts/utility-belt";

const copy = clipboard();

copy("Hello! I'm copied text.");

```

With browser

```
const { clipboard } = window.utilityBelt;

const copy = clipboard();

copy("Hello! I'm copied text.");

```

See methods [full documentation](https://ludekarts.github.io/utility-belt).