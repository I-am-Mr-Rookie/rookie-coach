import { expect, test } from "vitest";
import page from "../fixtures/codeforces-user-status-page.json";
import sourceExport from "../fixtures/codeforces-user-source-export.json";
import { MemoryEvidenceStore } from "@rookie-coach/core";
import { importPage } from "./import.js";

const account = sourceExport.account as { schemaVersion: 1; platform: string; namespace: string; handle: string };
const capturedAt = "2023-11-15T00:00:00Z";

test("imports metadata and matching source, preserving source on repeated metadata import", async () => {
  const store = new MemoryEvidenceStore();
  const progress: string[] = [];
  expect(await importPage(account, page, sourceExport, store, (message) => progress.push(message), capturedAt)).toBe(2);
  let records = await store.list(account);
  expect(records.find((record) => record.submissionId === "900000002")).toMatchObject({
    sourceStatus: "available", source: "int main() { return 0; }\n",
    captureMethod: "api", provenance: "codeforces:user.status",
    sourceCaptureMethod: "user-export", sourceProvenance: "codeforces:user-provided-source-export",
  });
  expect(records.find((record) => record.submissionId === "900000001")?.sourceStatus).toBe("unavailable");
  expect(progress.at(-1)).toBe("Stored 2 of 2 submissions…");
  await importPage(account, page, undefined, store, () => {}, capturedAt);
  records = await store.list(account);
  expect(records).toHaveLength(2);
  expect(records.find((record) => record.submissionId === "900000002")?.sourceStatus).toBe("available");
  expect(await store.list({ ...account, handle: "other" })).toEqual([]);
});

test("rejects mismatched and orphaned source before writing, and reports invalid pages", async () => {
  const store = new MemoryEvidenceStore();
  const badSource = { ...sourceExport, account: { ...sourceExport.account, handle: "other" } };
  await expect(importPage(account, page, badSource, store, () => {}, capturedAt)).rejects.toThrow("account mismatch");
  const orphaned = { ...sourceExport, submissions: [{ ...sourceExport.submissions[0], submissionId: "5" }] };
  await expect(importPage(account, page, orphaned, store, () => {}, capturedAt)).rejects.toThrow("missing from this metadata page");
  await expect(importPage(account, { status: "FAILED", comment: "Invalid handle" }, undefined, store, () => {}, capturedAt))
    .rejects.toThrow("Invalid handle");
  await expect(importPage(account, { ...page, result: [page.result[0], page.result[0]] }, undefined, store, () => {}, capturedAt))
    .rejects.toThrow("Duplicate submission IDs");
  expect(await store.list(account)).toEqual([]);
});
