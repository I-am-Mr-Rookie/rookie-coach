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
const reportHtml = readFileSync(new URL("report.html", root), "utf8");
const reportScript = reportHtml.match(/<script type="module" src="([^"]+)"/);
assert.ok(reportScript, "report needs a module script");
assert.ok(existsSync(new URL(reportScript[1], root)), "compiled report script is missing");

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
async function render(handle) {
  const nodes = Object.fromEntries(["#status", "#report", "#overview", "#repeats", "#verdicts", "#languages", "#coverage", "#difficulties", "#tags", "#coaching-status", "#support", "#action", "#source", "#source-details"]
    .map((selector) => [selector, { textContent: "", hidden: true, children: [], replaceChildren(...children) { this.children = children; },
      set innerHTML(_) { throw new Error("Report must not parse imported text as HTML"); } }]));
  runInNewContext(readFileSync(new URL(reportScript[1], root), "utf8"), {
    document: { querySelector: (selector) => nodes[selector], createElement: () => ({ textContent: "", set innerHTML(_) { throw new Error("Imported HTML executed"); } }) },
    indexedDB,
    localStorage: { getItem: (key) => key === "codeforcesHandle" ? handle : null },
  });
  for (let attempt = 0; nodes["#report"].hidden && attempt < 20; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return nodes;
}
const nodes = await render("fixture_learner");
assert.equal(nodes["#report"].hidden, false);
assert.match(nodes["#overview"].textContent, /2 observed attempts; 1 accepted/);
assert.match(nodes["#overview"].textContent, /1 without source text/);
assert.match(nodes["#repeats"].children[0].textContent, /1 observed before first acceptance/);
assert.deepEqual(nodes["#coverage"].children.map((item) => item.textContent), ["available: 1", "unavailable: 1"]);
assert.match(nodes["#verdicts"].children[1].textContent, /WRONG_ANSWER: 1/);
assert.match(nodes["#coaching-status"].textContent, /insufficient evidence/i);
assert.equal(nodes["#action"].hidden, true);

const malicious = '<img src=x onerror=alert(1)>';
const before = `for (int i = 0; i <= n; i++) {\n ${malicious}\n}`;
const after = `for (int i = 0; i < n; i++) {\n ${malicious}\n}`;
const demoRecord = (id, problemId, verdict, sourceText) => ({
  schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle: "finding_demo",
  submissionId: String(id), problem: { platform: "codeforces", problemId, name: `${malicious} ${problemId}` },
  submittedAt: id, verdict, language: "GNU C++20", source: sourceText, sourceStatus: "available",
  captureMethod: "user-export", provenance: malicious, capturedAt: "2026-09-27T00:00:00Z",
  sourceCaptureMethod: "user-export", sourceProvenance: malicious, sourceCapturedAt: "2026-09-27T00:00:00Z",
});
const synthetic = [demoRecord(1, "A", "WRONG_ANSWER", before), demoRecord(2, "A", "OK", after),
  demoRecord(3, "B", "WRONG_ANSWER", before), demoRecord(4, "B", "OK", after)];
const database = await new Promise((resolve, reject) => {
  const request = indexedDB.open("rookie-coach-evidence", 1);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
await new Promise((resolve, reject) => {
  const transaction = database.transaction("submissions", "readwrite");
  for (const record of synthetic) transaction.objectStore("submissions").put(record);
  for (const record of [demoRecord(10, "C", "WRONG_ANSWER", before), demoRecord(11, "C", "OK", before)]) {
    transaction.objectStore("submissions").put({ ...record, handle: "no_pattern_demo" });
  }
  transaction.oncomplete = resolve;
  transaction.onerror = () => reject(transaction.error);
});
database.close();
const finding = await render("finding_demo");
assert.equal(finding["#report"].hidden, false);
assert.match(finding["#coaching-status"].textContent, /possible recurring.*not establish the cause/i);
assert.equal(finding["#support"].children.length, 2);
assert.match(finding["#support"].children[0].textContent, /A.*1.*2.*user-export/i);
assert.match(finding["#support"].children[1].textContent, /B.*3.*4.*user-export/i);
assert.match(finding["#action"].textContent, /Trace an exclusive loop bound.*\[4, 7, 9\].*0, 1, 2/s);
assert.equal(finding["#action"].hidden, false);
assert.match(finding["#repeats"].children[0].textContent, /<img src=x onerror=alert\(1\)>/);
assert.match(finding["#support"].children[0].textContent, /<img src=x onerror=alert\(1\)>/);
assert.match(finding["#source"].textContent, /for \(int i = 0; i <= n; i\+\+\).*<img src=x onerror=alert\(1\)>.*for \(int i = 0; i < n; i\+\+\)/s);
assert.equal(finding["#source-details"].hidden, false);
assert.doesNotMatch(finding["#support"].children[0].textContent, /sum \+=/);
const noPattern = await render("no_pattern_demo");
assert.match(noPattern["#coaching-status"].textContent, /no supported pattern.*imported records/i);
assert.equal(noPattern["#action"].hidden, true);
assert.equal(noPattern["#source"].textContent, "");
assert.equal(noPattern["#source-details"].hidden, true);
const empty = await render("empty_demo");
assert.equal(empty["#report"].hidden, false);
assert.match(empty["#coaching-status"].textContent, /insufficient evidence.*no submissions/i);
assert.equal(empty["#action"].hidden, true);
console.log("MV3 popup import and local report with synthetic IndexedDB evidence: PASS");
console.log("Finding demo:", finding["#coaching-status"].textContent, finding["#support"].children.map((item) => item.textContent).join(" | "), finding["#action"].textContent);
console.log("Abstention demo:", nodes["#coaching-status"].textContent, "No pattern:", noPattern["#coaching-status"].textContent, "Empty:", empty["#coaching-status"].textContent);
