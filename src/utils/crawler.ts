import * as fs from "node:fs";
import * as path from "node:path";

/*
  Walks a directory recursively and collects file paths.

  USAGE:
  import { crawler } from "@ludekarts/utility-belt";

  The processing callback receives each full path and its fs.Dirent entry:
  - Return a string to include a file or descend into a directory.
  - Return a non-string value to skip a file or avoid descending into a directory.
  - Return crawler.break to stop traversal; the result's stopped property will be true.

  EXAMPLE 1: List every file below the current directory.
  const { results } = crawler(".");

  EXAMPLE 2: Exclude node_modules from traversal.
  const { results } = crawler(".", (fullPath, entry) =>
    entry.isDirectory() && entry.name === "node_modules" ? false : fullPath,
  );

  EXAMPLE 3: Record every encountered path, including directories.
  const paths: string[] = [];
  crawler(".", (fullPath) => {
    paths.push(fullPath);
    return fullPath;
  });

  EXAMPLE 4: List files from only the current directory.
  const { results: files } = crawler(".", (fullPath, entry) =>
    entry.isDirectory() ? false : fullPath,
  );

  EXAMPLE 5: Stop after encountering a particular file.
  const { results, stopped } = crawler(".", (fullPath) =>
    fullPath.endsWith("package.json") ? crawler.break : fullPath,
  );
*/

// Unambiguous stop-signal — won't collide with a real file/directory path.
const CRAWLER_BREAK = Symbol("crawler:break");

type Processing = (fullPath: string, entry: fs.Dirent) => unknown;

interface CrawlResult {
  results: string[];
  stopped: boolean;
}

interface Crawler {
  (directory: string, processing?: Processing, verbose?: boolean): CrawlResult;
  break: typeof CRAWLER_BREAK;
}

const defaultProcessing: Processing = (fullPath) => fullPath;

export const crawler: Crawler = (
  directory,
  processing = defaultProcessing,
  verbose = false,
) => {
  if (processing && typeof processing !== "function") {
    throw new Error("Processing argument should be function");
  }

  // Exit with empty result to enable destructuring when used in recursive calls.
  if (typeof directory !== "string") return { results: [], stopped: false };

  const results: string[] = [];

  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (err) {
    // Directory unreadable/missing/permission error — skip it (optionally notify) instead of aborting crawling.
    verbose &&
      console.error(`Error reading directory ${directory}: ${String(err)}`);
    return { results, stopped: false };
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    // NOTE: "entry" is a Dirent - carries isDirectory()/isFile()/isSymbolicLink() instead of full file's metadata
    const result = processing(fullPath, entry);

    if (result === CRAWLER_BREAK) {
      return { results, stopped: true };
    }

    if (entry.isDirectory()) {
      if (typeof result !== "string") {
        continue;
      }

      const nested = crawler(result, processing, verbose);
      results.push(...nested.results);

      if (nested.stopped) {
        return { results, stopped: true };
      }
      continue;
    }

    if (typeof result === "string") {
      results.push(result);
    }
  }

  return { results, stopped: false };
};

// Expose CRAWLER_BREAK symbol.
crawler.break = CRAWLER_BREAK;
