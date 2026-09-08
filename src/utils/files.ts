import * as fs from "node:fs";
import * as path from "node:path";

export function readFile(
  filePath: string,
  options: { encoding?: BufferEncoding } = {},
) {
  const { encoding = "utf8" } = options;
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(filePath);
  return fs.readFileSync(absolutePath, { encoding });
}

export function saveFile(
  filePath: string,
  content: string,
  options: { override?: boolean } = {},
) {
  const { override = true } = options;

  // If the path is relative, resolve it against the current working directory
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(filePath);
  const dir = path.dirname(absolutePath);

  if (typeof content !== "string") {
    throw new Error("Content should be a string");
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absolutePath, content.trim(), {
    flag: override ? "w" : "a",
  });
}

export function saveJson(
  filePath: string,
  content: unknown,
  options: { prettyprint?: boolean; override?: boolean } = {},
) {
  const { prettyprint = false, ...rest } = options;
  saveFile(
    filePath,
    JSON.stringify(content, null, prettyprint ? 2 : undefined),
    rest,
  );
}

export function readJson(
  filePath: string,
  options: { encoding?: BufferEncoding } = {},
) {
  return JSON.parse(readFile(filePath, options));
}
