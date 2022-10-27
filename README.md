# Utility Belt

JavaScript Utilities Collection see [full documentation](https://ludekarts.github.io/utility-belt). Press `?` key to enable index seach.

### Note

- Docs uses native [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) implementation. If something does not work it may be that you're using outdated browser.
- This package is **not fully isomorphic** so some of the methods will not work on the server.


## Use with bundler

**Installation**

```
npm install @ludekarts/utility-belt;
```

**Code**

```
import { copyText } from "@ludekarts/utility-belt";

copyText("Hello! I'm copied text.");
```


## Use with browser

**Installation**

```
<script src="https://unpkg.com/@ludekarts/utility-belt@latest/dist/utility-belt.umd.js"></script>
```

**Code**

```
const { copyText } = window.utilityBelt;

copyText("Hello! I'm copied text.");
```

See methods [full documentation](https://ludekarts.github.io/utility-belt).