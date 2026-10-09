import { readFile, writeFile } from "node:fs/promises";

const manifestUrl = new URL("../package.json", import.meta.url);
const sourceUrl = new URL("../src/client.js", import.meta.url);
const outputUrl = new URL("../lib/client.js", import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const source = await readFile(sourceUrl, "utf8");

const importPattern = /^import React from ["']react["'];\r?\n/m;
if (!importPattern.test(source)) {
  throw new Error("src/client.js must import React from 'react' as its only runtime import");
}

const body = source
  .replace(importPattern, 'const reactModule = require("react");\nconst React = reactModule.default ?? reactModule;\n')
  .replace(/^export\s+(?=(?:const|function|class)\b)/gm, "");

const output = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(manifest.name)},\n  factory: (require) => {\n    const module = { exports: {} };\n${body.split("\n").map((line) => line.length === 0 ? "" : `    ${line}`).join("\n")}\n    Object.assign(module.exports, { apply, inject });\n    return module.exports;\n  }\n});\n`;

await writeFile(outputUrl, output, "utf8");
