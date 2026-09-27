import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { indexedDB } from "fake-indexeddb";

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
const metadata = { files: [] };
const sources = { files: [] };
const button = { disabled: false };
let submit;
runInNewContext(readFileSync(new URL(script[1], root), "utf8"), {
  document: { querySelector: (selector) => ({
    "#import-form": { addEventListener: (_event, listener) => { submit = listener; }, querySelector: () => button },
    "#handle": input,
    "#metadata": metadata,
    "#sources": sources,
    "#status": status,
  })[selector] },
  indexedDB,
  localStorage: {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  },
});
assert.equal(input.value, "ExistingHandle");
input.value = "  ";
await submit({ preventDefault() {} });
assert.equal(saved.get("codeforcesHandle"), "ExistingHandle");
input.value = "  fixture_learner  ";
const page = readFileSync(new URL("../fixtures/codeforces-user-status-page.json", root), "utf8");
const source = JSON.parse(readFileSync(new URL("../fixtures/codeforces-user-source-export.json", root), "utf8"));
source.account.namespace = "local-student";
metadata.files = [{ text: async () => page }];
sources.files = [{ text: async () => JSON.stringify(source) }];
await submit({ preventDefault() {} });
assert.equal(saved.get("codeforcesHandle"), "fixture_learner");
assert.match(status.textContent, /Stored 2 submissions locally/);
assert.equal(button.disabled, false);
const db = await new Promise((resolve, reject) => {
  const request = indexedDB.open("rookie-coach-evidence", 1);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const stored = await new Promise((resolve, reject) => {
  const request = db.transaction("submissions").objectStore("submissions").getAll();
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
db.close();
assert.equal(stored.length, 2);
assert.equal(stored.find((record) => record.submissionId === "900000002")?.sourceStatus, "available");
metadata.files = [{ text: async () => '{' }];
await submit({ preventDefault() {} });
assert.match(status.textContent, /Import failed:/);
assert.equal(button.disabled, false);
console.log("MV3 popup synthetic import to IndexedDB: PASS");
