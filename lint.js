// Minimal syntax check for src/App.jsx — parses it with Babel (JSX + modern
// JS syntax) and fails loudly on any parse error. Not a full ESLint setup,
// just a fast guard against typos/unbalanced JSX before shipping.
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";

const file = "src/App.jsx";
const source = readFileSync(file, "utf8");

try {
  parse(source, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  console.log("OK: JSX parses");
} catch (e) {
  console.error(`Parse error in ${file}: ${e.message}`);
  process.exit(1);
}
