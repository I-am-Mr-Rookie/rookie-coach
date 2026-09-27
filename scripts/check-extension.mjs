import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

const root = new URL("../extension/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", root), "utf8"));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.action.default_popup, "popup.html");
assert.equal(manifest.permissions, undefined);
assert.equal(manifest.host_permissions, undefined);
const popup = readFileSync(new URL(manifest.action.default_popup, root), "utf8");
const script = popup.match(/<script type="module" src="([^"]+)"/);
assert.ok(script, "popup needs a module script");
assert.ok(existsSync(new URL(script[1], root)), "compiled popup script is missing");

const saved = new Map([["codeforcesHandle", "ExistingHandle"]]);
const input = { value: "" };
const status = { textContent: "" };
let submit;
runInNewContext(readFileSync(new URL(script[1], root), "utf8"), {
  document: { querySelector: (selector) => ({
    "#import-form": { addEventListener: (_event, listener) => { submit = listener; } },
    "#handle": input,
    "#status": status,
  })[selector] },
  localStorage: {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  },
});
assert.equal(input.value, "ExistingHandle");
input.value = "  ";
submit({ preventDefault() {} });
assert.equal(saved.get("codeforcesHandle"), "ExistingHandle");
input.value = "  OwnHandle  ";
submit({ preventDefault() {} });
assert.equal(saved.get("codeforcesHandle"), "OwnHandle");
assert.match(status.textContent, /no history was collected/);
console.log("MV3 popup manifest, built script, and handle action: PASS");
