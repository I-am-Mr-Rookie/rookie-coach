import { normalizeStatusPage, parseUserSourceExport } from "@rookie-coach/codeforces";
import type { EvidenceStore, StudentAccount, Submission } from "@rookie-coach/core";

/** Import one user-supplied API page. No network access or identity verification occurs here. */
export async function importPage(
  account: StudentAccount,
  page: unknown,
  sourceExport: unknown | undefined,
  store: EvidenceStore,
  progress: (message: string) => void,
  capturedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
): Promise<number> {
  progress("Validating metadata and source evidence…");
  const records = normalizeStatusPage(page, account, capturedAt);
  const sources = sourceExport === undefined ? [] : parseUserSourceExport(sourceExport, account, capturedAt);
  const ids = new Set(records.map((record) => record.submissionId));
  if (ids.size !== records.length) throw new Error("Duplicate submission IDs in metadata page");
  if (sources.some((source) => !ids.has(source.submissionId))) {
    throw new Error("Source export contains a submission missing from this metadata page");
  }
  const sourceById = new Map(sources.map((source) => [source.submissionId, source]));
  const previous = new Map((await store.list(account)).map((record) => [record.submissionId, record]));
  for (const [index, metadata] of records.entries()) {
    const source = sourceById.get(metadata.submissionId);
    const existing = previous.get(metadata.submissionId);
    const retained = existing?.sourceStatus !== "not-collected" ? existing : undefined;
    const record: Submission = source ? {
      ...metadata, source: source.source, sourceStatus: source.sourceStatus,
      sourceCaptureMethod: "user-export",
      sourceProvenance: source.provenance, sourceCapturedAt: source.capturedAt,
    } : retained ? {
      ...metadata, source: retained.source, sourceStatus: retained.sourceStatus,
      sourceCaptureMethod: retained.sourceCaptureMethod ?? (retained.captureMethod === "saved-page" ? "saved-page" : "user-export"),
      sourceProvenance: retained.sourceProvenance ?? retained.provenance,
      sourceCapturedAt: retained.sourceCapturedAt ?? retained.capturedAt,
    } : metadata;
    await store.upsert(record);
    progress(`Stored ${index + 1} of ${records.length} submissions…`);
  }
  return records.length;
}
