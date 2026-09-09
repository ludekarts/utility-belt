export default [
  {
    file: "actions.ts",
    environment: "Browser",
    utilities: [
      {
        name: "catchAction",
        description: "Event delegation for elements using data-utb-action.",
        signature: "catchAction()",
        example:
          'const onClick = catchAction()\n  .addAction("delete", ({ dataset }) => remove(dataset.id))\n  .addDefaultAction(({ action }) => console.log(action))\n  .done();\nmenu.addEventListener("click", onClick);',
        options:
          "Fluent methods: addAction(action, callback), addDefaultAction(callback), done(). The callback receives action, event, dataset and element.",
      },
    ],
  },
  {
    file: "arrays.ts",
    environment: "Universal",
    utilities: [
      {
        name: "arrayToObject",
        description: "Index an array of objects by one of their keys.",
        signature: "arrayToObject(array, key)",
        example: 'arrayToObject([{ id: "a", name: "Ada" }], "id");',
        options: "key is the object property used as each result key.",
      },
      {
        name: "chunkArray",
        description: "Split an array into equally sized groups.",
        signature: "chunkArray(array, size)",
        example: "chunkArray([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]",
        options: "size is the number of items per chunk.",
      },
      {
        name: "compareArrays",
        description: "Find items added to and removed from another array.",
        signature: "compareArrays(arrayA, arrayB)",
        example:
          "compareArrays([1, 2, 3], [2, 3, 4]); // { added: [4], removed: [1] }",
        options: "Returns { added, removed }.",
      },
      {
        name: "getRandomSubarray",
        description: "Return randomly selected items from an array.",
        signature: "getRandomSubarray(array, size)",
        example: 'getRandomSubarray(["a", "b", "c", "d"], 2);',
        options: "size controls how many random items are returned.",
      },
      {
        name: "reduce",
        description: "Reduce with an additional isLast argument.",
        signature: "reduce(array, reducer, initialValue)",
        example:
          "reduce([1, 2, 3], (sum, value, index, isLast) => sum + value, 0);",
        options: "reducer receives accumulator, item, index and isLast.",
      },
      {
        name: "loop",
        description: "Iterate an array without returning a new value.",
        signature: "loop(array, callback)",
        example: 'loop(["a", "b"], (item, index) => console.log(index, item));',
        options: "callback receives item, index and the original array.",
      },
      {
        name: "shuffleArray",
        description: "Return an array in random order.",
        signature: "shuffleArray(array)",
        example: "shuffleArray([1, 2, 3, 4]);",
        options: "No configuration.",
      },
      {
        name: "removeByIndex",
        description: "Return an array without an item at an index.",
        signature: "removeByIndex(array, index)",
        example: 'removeByIndex(["a", "b", "c"], 1); // ["a", "c"]',
        options: "index is zero-based.",
      },
      {
        name: "removeByInstance",
        description: "Return an array without a matching item.",
        signature: "removeByInstance(array, item)",
        example: "removeByInstance([1, 2, 3], 2); // [1, 3]",
        options: "item is compared by its array value/reference.",
      },
      {
        name: "replaceOnIndex",
        description: "Replace one array item immutably.",
        signature: "replaceOnIndex(array, index, item)",
        example: "replaceOnIndex([1, 2, 3], 1, 20); // [1, 20, 3]",
        options: "index is zero-based.",
      },
      {
        name: "swapOrder",
        description: "Move an item from one position to another.",
        signature: "swapOrder(array, fromIndex, toIndex)",
        example: "swapOrder([1, 2, 3, 4], 0, 2); // [2, 3, 1, 4]",
        options: "Both indexes are zero-based.",
      },
      {
        name: "swapItems",
        description: "Exchange two items in an array.",
        signature: "swapItems(array, indexA, indexB)",
        example: "swapItems([1, 2, 3], 0, 2); // [3, 2, 1]",
        options: "Both indexes are zero-based.",
      },
      {
        name: "insertAtIndex",
        description: "Insert an item at an index immutably.",
        signature: "insertAtIndex(array, index, item)",
        example: "insertAtIndex([1, 2, 3], 1, 10); // [1, 10, 2, 3]",
        options: "index is zero-based.",
      },
      {
        name: "zipArray",
        description: "Pair items from two arrays by index.",
        signature: "zipArray(arrayA, arrayB)",
        example: 'zipArray([1, 2], ["a", "b"]); // [[1, "a"], [2, "b"]]',
        options: "Pairs up to the shortest array.",
      },
      {
        name: "uniqueArray",
        description: "Merge arrays and remove duplicates.",
        signature: "uniqueArray(...arrays)",
        example: "uniqueArray([1, 2], [2, 3]); // [1, 2, 3]",
        options: "Accepts any number of arrays.",
      },
      {
        name: "sortOutArray",
        description: "Partition items by a predicate.",
        signature: "sortOutArray(array, predicate)",
        example:
          "sortOutArray([1, 2, 3, 4], value => value % 2 === 0); // [[2, 4], [1, 3]]",
        options: "predicate receives item and index.",
      },
      {
        name: "splitArrayAt",
        description: "Split an array at a zero-based index.",
        signature: "splitArrayAt(array, index)",
        example: "splitArrayAt([1, 2, 3, 4], 2); // [[1, 2], [3, 4]]",
        options: "index marks the first item in the second result.",
      },
    ],
  },
  {
    file: "clipboard.ts",
    environment: "Browser",
    utilities: [
      {
        name: "copyToClipboard",
        description: "Copy a string through a temporary selection.",
        signature: "copyToClipboard(value, rootElement?)",
        example: 'copyToClipboard("Ready to paste", document.body);',
        options:
          "rootElement is optional and defaults to the document clipboard container.",
      },
    ],
  },
  {
    file: "compress.ts",
    environment: "Browser",
    utilities: [
      {
        name: "compressJson",
        description: "Compress JSON with gzip and encode it as base64.",
        signature: "await compressJson(value)",
        example: 'const packed = await compressJson({ filters: ["new"] });',
        options: "Requires Blob, CompressionStream, Response and btoa support.",
      },
      {
        name: "decompressJson",
        description: "Decode and decompress a value created by compressJson.",
        signature: "await decompressJson(compressedJson)",
        example: "const data = await decompressJson(packed);",
        options:
          "Requires Blob, DecompressionStream, Response and atob support.",
      },
    ],
  },
  {
    file: "crawler.ts",
    environment: "Node",
    utilities: [
      {
        name: "crawler",
        description:
          "Traverse a directory synchronously and collect matching paths.",
        signature: "crawler(dir, processing?, verbose?)",
        example:
          'const { results } = crawler("./src", (path, entry) =>\n  entry.isFile() && path.endsWith(".ts") ? path : false\n);',
        options:
          "processing receives fullPath and fs.Dirent; return a string to include or descend. verbose defaults to false; use crawler.break to stop.",
      },
    ],
  },
  {
    file: "delay.ts",
    environment: "Browser / Node",
    utilities: [
      {
        name: "debounce",
        description: "Delay a callback until calls stop.",
        signature: "debounce(callback, delay)",
        example:
          'const saveDraft = debounce(() => save(), 300);\ninput.addEventListener("input", saveDraft);',
        options: "delay is in milliseconds.",
      },
      {
        name: "triggerIfRapid",
        description: "Run a callback when calls occur within a time window.",
        signature: "triggerIfRapid(callback, delta)",
        example: "const detectDoubleTap = triggerIfRapid(open, 250);",
        options: "delta is the maximum gap in milliseconds.",
      },
      {
        name: "throttle",
        description: "Limit a callback to one call per interval.",
        signature: "throttle(callback, wait)",
        example: 'window.addEventListener("scroll", throttle(update, 100));',
        options: "wait is in milliseconds.",
      },
      {
        name: "wait",
        description: "Pause an async flow for a duration.",
        signature: "await wait(ms)",
        example: "await wait(500);\nshowNextStep();",
        options: "ms is the wait duration in milliseconds.",
      },
    ],
  },
  {
    file: "dom.ts",
    environment: "Browser",
    utilities: [
      {
        name: "fragment",
        description: "Create an Element or DocumentFragment from HTML.",
        signature: "fragment(source, domWrapper?)",
        example:
          'const card = fragment("<article>New</article>");\nconst rows = fragment("<li>A</li><li>B</li>", "ul");',
        options: "domWrapper is an optional wrapping tag for multi-node HTML.",
      },
      {
        name: "getNodesPath",
        description: "Create a function that finds ancestors up to a selector.",
        signature: "getNodesPath(stopSelector)(node, path?)",
        example:
          'const getPath = getNodesPath(".dialog");\nconst path = getPath(event.target);',
        options: "stopSelector is a CSS selector.",
      },
      {
        name: "attachStyle",
        description: "Add or reuse a named style tag.",
        signature: "attachStyle(style, name)",
        example: 'attachStyle(".notice { color: tomato; }", "notice-style");',
        options: "name identifies the style tag for reuse.",
      },
      {
        name: "includeScriptTag",
        description: "Load a script tag dynamically.",
        signature: "includeScriptTag(path, config?)",
        example:
          'includeScriptTag("/vendor.js", { isModule: true, onComplete: init });',
        options: "config: isModule?: boolean, onComplete?: () => void.",
      },
      {
        name: "copyAttrs",
        description: "Copy attributes between DOM elements.",
        signature: "copyAttrs(from, to, excluded?)",
        example: 'copyAttrs(source, target, ["style", "class"]);',
        options: "excluded is an optional list of attribute names.",
      },
      {
        name: "moveNodes",
        description: "Move child nodes relative to a target.",
        signature: "moveNodes(source, target, options?)",
        example: 'moveNodes(template, anchor, "--after --rm-source");',
        options:
          "Options string supports --into, --after, --before and --rm-source.",
      },
      {
        name: "createEventHandler",
        description:
          "Attach an event handler and receive its cleanup function.",
        signature:
          "createEventHandler(element, eventName, callback, useCapture?)",
        example:
          'const destroy = createEventHandler(button, "click", submit);\ndestroy();',
        options: "useCapture defaults to false.",
      },
      {
        name: "importHtml",
        description: "Fetch HTML into elements with data-import attributes.",
        signature: "importHtml(doneCallback)",
        example: 'importHtml(() => console.log("HTML imports loaded"));',
        options:
          "Default export. Requires data-import attributes and an optional completion callback.",
      },
    ],
  },
  {
    file: "files.ts",
    environment: "Node",
    utilities: [
      {
        name: "readFile",
        description: "Read a text file.",
        signature: "readFile(filePath, options?)",
        example: 'const text = readFile("./notes.txt");',
        options: "options.encoding defaults to utf8.",
      },
      {
        name: "saveFile",
        description: "Write a text file, creating parent folders when needed.",
        signature: "saveFile(filePath, content, options?)",
        example: 'saveFile("./output/note.txt", "Hello", { override: true });',
        options: "options.override defaults to true.",
      },
      {
        name: "saveJson",
        description: "Write a value as JSON.",
        signature: "saveJson(filePath, content, options?)",
        example:
          'saveJson("./output/config.json", config, { prettyprint: true });',
        options: "options: prettyprint?: boolean, override?: boolean.",
      },
      {
        name: "readJson",
        description: "Read and parse a JSON file.",
        signature: "readJson(filePath, options?)",
        example: 'const config = readJson("./config.json");',
        options: "options.encoding defaults to utf8.",
      },
    ],
  },
  {
    file: "forms.ts",
    environment: "Browser",
    utilities: [
      {
        name: "getFormFields",
        description: "Extract enabled form control values and elements.",
        signature: "getFormFields(form, options?)",
        example:
          "const fields = getFormFields(form, { onlySelectedCheckboxes: true });\nconsole.log(fields.email.value);",
        options:
          "options: onlySelectedCheckboxes, includeCheckboxState, onlyCheckboxState, onlyRecentValues (all optional booleans).",
      },
      {
        name: "updateForm",
        description: "Set values and checkbox state on a form.",
        signature: "updateForm(selector, source)",
        example:
          'updateForm("#profile", {\n  name: "Ada",\n  newsletter: { checked: true }\n});',
        options:
          "selector accepts a form element or selector; source maps field names to values or { value?, checked? }.",
      },
    ],
  },
  {
    file: "general.ts",
    environment: "Universal",
    utilities: [
      {
        name: "hyphenate",
        description: "Normalize text into a connector-separated slug.",
        signature: "hyphenate(value, connector?)",
        example: 'hyphenate("Hello, World!", "_"); // hello_world',
        options: "connector defaults to '-'.",
      },
      {
        name: "isObject",
        description: "Test for a plain object.",
        signature: "isObject(value)",
        example: "isObject({ ready: true }); // true",
        options: "Arrays return false.",
      },
      {
        name: "isPromise",
        description: "Test whether a value is thenable.",
        signature: "isPromise(value)",
        example: "isPromise(Promise.resolve()); // true",
        options: "Checks for a then function.",
      },
      {
        name: "inPolygon",
        description: "Test whether a point is inside a polygon.",
        signature: "inPolygon(point, vertices)",
        example: "inPolygon([1, 1], [[0, 0], [2, 0], [2, 2], [0, 2]]); // true",
        options: "Points and vertices use [x, y] tuples.",
      },
      {
        name: "plPlurals",
        description: "Create a Polish plural-form resolver.",
        signature: "plPlurals(settings)(value)",
        example:
          'const plural = plPlurals({ one: "plik", few: "pliki", many: "plikow" });\nplural(5); // plikow',
        options: "settings accepts one?, few? and many?.",
      },
      {
        name: "getRandomNumber",
        description: "Return a random integer in a range.",
        signature: "getRandomNumber(min, max)",
        example: "getRandomNumber(1, 6);",
        options: "min and max define the range.",
      },
      {
        name: "uid",
        description: "Create a UUID or compact identifier.",
        signature: "uid(config?)",
        example: 'uid();\nuid("--short");',
        options:
          "Use --short for an 8-character ID; full IDs require crypto.randomUUID().",
      },
    ],
  },
  {
    file: "keyboard.ts",
    environment: "Browser",
    utilities: [
      {
        name: "keyboard",
        description: "Build a keyboard shortcut event handler.",
        signature: "keyboard(filterFn?)",
        example:
          'document.addEventListener("keydown", keyboard()\n  .key("Ctrl+S", save, true)\n  .done());',
        options:
          "filterFn optionally filters events. key(config, callback, preventDefault?) uses event.code-based shortcuts.",
      },
      {
        name: "parseConfig",
        description: "Normalize a shortcut string or config object.",
        signature: "parseConfig(config)",
        example:
          'parseConfig("Z+Shift+Ctrl");\nparseConfig({ key: "KeyZ", ctrl: true });',
        options: "Object config: key, shift?, ctrl?, alt?, meta?.",
      },
    ],
  },
  {
    file: "messages.ts",
    environment: "Node",
    utilities: [
      {
        name: "message",
        description: "Colored console messages and terminal input.",
        signature: "message.info | error | success | warning | input",
        example:
          'message.success("Build complete");\nconst name = await message.input("Name?", "Guest");',
        options:
          "input(question, defaultValue?) returns a Promise. Other methods accept one message string.",
      },
    ],
  },
  {
    file: "pubsub.ts",
    environment: "Universal",
    utilities: [
      {
        name: "PubSub",
        description: "Create a namespaced publish/subscribe bus.",
        signature: "PubSub(logger?)",
        example:
          'const bus = PubSub();\nbus.on("cart", "updated", render);\nbus.emit("cart", "updated", { count: 2 });',
        options:
          "logger is optional. on/emit accept namespace first or use the default '/'; use '*' as a catch-all event.",
      },
    ],
  },
  {
    file: "query.ts",
    environment: "Universal",
    utilities: [
      {
        name: "getQueryParams",
        description: "Read named values from a URL query string.",
        signature: "getQueryParams(...params)",
        example:
          'getQueryParams("id", "tag[]", "/items?id=7&tag=a&tag=b");\n// ["7", ["a", "b"]]',
        options:
          "Pass the URL as the final argument. Use [] suffix to collect repeated values.",
      },
      {
        name: "updateQueryParams",
        description: "Set one or more URL query values.",
        signature: "updateQueryParams(query, name, value?)",
        example: 'updateQueryParams(url, { page: "2", tag: ["js", "ts"] });',
        options:
          "name can be a string or a record. Array values replace existing values.",
      },
      {
        name: "parseCliParams",
        description: "Extract values and booleans for CLI flags.",
        signature: "parseCliParams(params, ...flags)",
        example:
          'const [port, debug] = parseCliParams(process.argv.slice(2), "--port", "--debug");',
        options:
          "params is usually process.argv.slice(2); flags are returned in supplied order.",
      },
    ],
  },
  {
    file: "request.ts",
    environment: "Browser / Node",
    utilities: [
      {
        name: "request",
        description:
          "Fetch a URL with parsing, deduplication, caching and fallbacks.",
        signature: "request(url, options?)",
        example:
          'const users = await request("/api/users", {\n  cacheRequest: true,\n  fallback: []\n});',
        options:
          "options include method, fallback, requestHash, deduplicate, cacheRequest, responseParser and responseProcessor, plus fetch options.",
      },
      {
        name: "requestConfigurator",
        description: "Create a request function with a fixed HTTP method.",
        signature: "requestConfigurator(method, globalOptions?)",
        example:
          'const post = requestConfigurator("POST", { headers: { "Content-Type": "application/json" } });\nawait post("/api/items", { body: JSON.stringify(item) });',
        options: "globalOptions apply to every created request.",
      },
      {
        name: "abortRequest",
        description: "Abort an active request by hash or method and URL.",
        signature: "abortRequest(hashOrMethod, url?)",
        example: 'abortRequest("GET", "/api/users");',
        options: "Pass one value for a hash, or method plus URL.",
      },
      {
        name: "clearCache",
        description: "Clear cached request results.",
        signature: "clearCache(hashOrMethod?, url?)",
        example: "clearCache(/GET:.*users/);\nclearCache();",
        options:
          "Accepts a hash string or RegExp. Call with no arguments to clear all.",
      },
      {
        name: "objectToUrlString",
        description: "Serialize an object for URL-encoded request data.",
        signature: "objectToUrlString(json)",
        example: 'objectToUrlString({ page: 2, tag: ["js", "ts"] });',
        options: "Array values are emitted as repeated keys.",
      },
      {
        name: "objectToDataForm",
        description: "Convert a data object to FormData.",
        signature: "objectToDataForm(body)",
        example:
          'const body = objectToDataForm({ title: "Report", attachment: file });',
        options: "Supports FormData-compatible values including Blob/File.",
      },
    ],
  },
  {
    file: "strings.ts",
    environment: "Universal",
    utilities: [
      {
        name: "splitAtIndex",
        description: "Split a string into two parts.",
        signature: "splitAtIndex(str, index)",
        example: 'splitAtIndex("Hello world", 5); // ["Hello", " world"]',
        options: "index is zero-based.",
      },
      {
        name: "insertStringAtIndex",
        description: "Insert text at a string position.",
        signature: "insertStringAtIndex(baseStr, insertStr, position)",
        example: 'insertStringAtIndex("Hello world", " beautiful", 5);',
        options: "position is zero-based.",
      },
    ],
  },
  {
    file: "transform.ts",
    environment: "Universal",
    utilities: [
      {
        name: "transformObject",
        description: "Recursively transform plain object and array values.",
        signature: "transformObject(input, transformer)",
        example:
          'transformObject({ user: { name: "Ada" } }, (key, value) =>\n  key === "name" ? String(value).toUpperCase() : undefined\n);',
        options:
          "transformer receives key (or null) and value; return undefined to preserve a value. Circular references are supported.",
      },
    ],
  },
];
