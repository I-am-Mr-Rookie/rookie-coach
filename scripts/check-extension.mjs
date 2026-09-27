// Checks the built extension: manifest, files, the popup flow and one synthetic collection run in a fake tab.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { DOMParser } from "linkedom";

const root = new URL("../extension/", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const fixture = (name) => readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8");

const manifest = JSON.parse(read("manifest.json"));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ["activeTab", "scripting"], "only activeTab and scripting are allowed");
for (const key of ["host_permissions", "content_scripts", "background", "optional_permissions"]) {
  assert.equal(key in manifest, false, `${key} must not be requested`);
}
assert.equal(manifest.action.default_popup, "popup.html");
assert.match(read("popup.html"), /src="dist\/popup\.js"/);
for (const file of ["dist/popup.js", "dist/collector.js"]) assert.ok(existsSync(new URL(file, root)), `${file} is missing`);

// Popup: fake just the elements and Chrome calls it touches.
function element() {
  const listeners = {};
  return {
    hidden: true, textContent: "", value: "", disabled: false, listeners,
    classList: { values: new Set(), add(name) { this.values.add(name); } },
    addEventListener(type, listener) { listeners[type] = listener; },
  };
}

async function popup({ url, probe, fill = {} }) {
  const ids = ["#not-codeforces", "#open", "#form", "#account", "#handle", "#limit", "#api-key", "#api-secret", "#start", "#status"];
  const nodes = Object.fromEntries(ids.map((id) => [id, element()]));
  nodes["#limit"].value = "250";
  const calls = [];
  const chrome = {
    tabs: {
      query: async () => [{ id: 7, url }],
      update: async (tabId, properties) => { calls.push({ update: [tabId, properties] }); },
    },
    scripting: {
      executeScript: async (injection) => {
        calls.push(injection);
        if (injection.files || injection.args) return [{}];
        return [{ result: probe }];
      },
    },
  };
  const storage = new Map();
  runInNewContext(read("dist/popup.js"), {
    document: { querySelector: (selector) => nodes[selector] },
    chrome, URL, console,
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    window: { close: () => calls.push({ closed: true }) },
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  for (const [id, value] of Object.entries(fill)) nodes[id].value = value;
  return { nodes, calls, storage, submit: () => nodes["#form"].listeners.submit({ preventDefault() {} }) };
}

const outside = await popup({ url: "https://example.com/" });
assert.equal(outside.nodes["#not-codeforces"].hidden, false);
assert.equal(outside.nodes["#form"].hidden, true);
await outside.nodes["#open"].listeners.click();
const same = (actual, expected, message) => assert.equal(JSON.stringify(actual), JSON.stringify(expected), message); // objects from the VM have another realm's prototypes
same(outside.calls.find((call) => call.update).update, [7, { url: "https://codeforces.com/" }]);

const signedIn = await popup({ url: "https://codeforces.com/problemset", probe: { handle: "fixture_learner", running: false } });
assert.equal(signedIn.nodes["#form"].hidden, false);
assert.equal(signedIn.nodes["#handle"].value, "fixture_learner");
assert.match(signedIn.nodes["#account"].textContent, /Signed in as fixture_learner/);
await signedIn.submit();
const [, optionsCall, filesCall] = signedIn.calls;
same(optionsCall.args, [{ handle: "fixture_learner", limit: 250 }]);
same(filesCall.files, ["dist/collector.js"]);
assert.match(signedIn.nodes["#status"].textContent, /Started/);

const halfKey = await popup({ url: "https://codeforces.com/", probe: { handle: null, running: false }, fill: { "#handle": "someone", "#api-key": "k" } });
assert.match(halfKey.nodes["#account"].textContent, /Not signed in/);
await halfKey.submit();
assert.match(halfKey.nodes["#status"].textContent, /both the API key and the API secret/);
assert.equal(halfKey.calls.some((call) => call.files), false);

// Collector: run the real bundle in a fake signed-in Codeforces tab served by synthetic pages.
const origin = "https://codeforces.com";
const statusPage = fixture("codeforces-user-status-page.json").replaceAll("999999", "1999");
const pages = {
  [`${origin}/api/user.info?handles=fixture_learner&lang=en`]: '{"status":"OK","result":[{"handle":"fixture_learner","rating":1234,"rank":"pupil"}]}',
  [`${origin}/api/user.rating?handle=fixture_learner&lang=en`]: '{"status":"OK","result":[]}',
  [`${origin}/api/user.status?handle=fixture_learner&from=1&count=100&lang=en`]: statusPage,
  [`${origin}/api/user.status?handle=fixture_learner&from=3&count=100&lang=en`]: '{"status":"OK","result":[]}',
  [`${origin}/contest/1999/problem/A?locale=en`]: fixture("codeforces-problem-page.html"),
  [`${origin}/contest/1999/submission/900000001`]: fixture("codeforces-submission-page.html"),
  [`${origin}/contest/1999/submission/900000002`]: fixture("codeforces-submission-page.html"),
};
const tab = new DOMParser().parseFromString(fixture("codeforces-problem-page.html"), "text/html");
const requested = [];
let saved = null;
let savedName = null;
tab.createElement = ((create) => (tag) => {
  const node = create(tag);
  if (tag === "a") node.click = () => { savedName = node.download; };
  return node;
})(tab.createElement.bind(tab));
class TabURL extends URL {
  static createObjectURL(blob) { saved = blob; return "blob:https://codeforces.com/1"; }
  static revokeObjectURL() {}
}
const context = {
  document: tab, location: { origin }, URL: TabURL, Blob, TextEncoder, AbortController, crypto, console,
  DOMParser, setTimeout: (callback) => setTimeout(callback, 0),
  fetch: async (url) => {
    requested.push(url);
    const text = pages[url];
    return { status: text ? 200 : 404, url, text: async () => text ?? "missing" };
  },
  __rookieCoachOptions: { handle: "fixture_learner", limit: 250 },
};
context.globalThis = context;
runInNewContext(read("dist/collector.js"), context);
for (let i = 0; i < 200 && (!saved || context.__rookieCoachRunning); i++) await new Promise((resolve) => setTimeout(resolve, 5));
assert.ok(saved, "collector must hand one Markdown file to the browser");
assert.equal(context.__rookieCoachOptions, undefined, "options (and any API secret) are removed after start");
const markdown = await saved.text();
assert.match(markdown, /^# Codeforces submissions for fixture_learner/);
assert.match(markdown, /signed_in_as: fixture_learner/);
assert.match(markdown, /source_included: 2\/2/);
assert.match(markdown, /\ncomplete: yes\napprox_tokens: \d+/);
assert.match(savedName ?? "", /^codeforces-fixture_learner-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-UTC\.md$/, "file name carries the time to the second");
assert.match(markdown, /### Example 1\n\ninput:/);
assert.match(markdown, /````cpp\n#include <bits\/stdc\+\+\.h>/);
assert.match(markdown, /## Student profile[\s\S]*rating: 1234\nrank: pupil/);
assert.equal(requested.length, 7);
assert.equal(requested.every((url) => url.startsWith(origin)), true, "only Codeforces is contacted");

console.log(`Extension check: manifest, popup states and a synthetic collection run PASS (${markdown.length} characters of Markdown).`);
