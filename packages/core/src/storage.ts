import type { StudentAccount, Submission } from "./index.js";

export interface EvidenceStore {
  upsert(record: Submission): Promise<void>;
  list(account: StudentAccount): Promise<Submission[]>;
  delete(account: StudentAccount): Promise<number>;
}

function accountKey(account: StudentAccount): [string, string, string] {
  if (account.schemaVersion !== 1 || !account.platform.trim() || !account.namespace.trim() || !account.handle.trim()) {
    throw new Error("Invalid evidence account");
  }
  return [account.platform, account.namespace, account.handle];
}

function recordKey(record: Submission): [string, string, string, string] {
  const key = accountKey(record);
  if (!record.submissionId.trim() || record.problem.platform !== record.platform ||
      (record.sourceStatus === "available" ? !record.source?.trim() : record.source !== null) ||
      (record.sourceStatus === "not-collected" && record.sourceCaptureMethod !== undefined) ||
      ([record.sourceCaptureMethod, record.sourceProvenance, record.sourceCapturedAt].some((field) => field !== undefined) &&
        (!record.sourceCaptureMethod || !record.sourceProvenance?.trim() || !record.sourceCapturedAt)) ||
      !record.provenance.trim()) throw new Error("Invalid evidence submission");
  return [...key, record.submissionId];
}

/** A deterministic store with the same account and submission keys as IndexedDB. */
export class MemoryEvidenceStore implements EvidenceStore {
  private records = new Map<string, Submission>();

  async upsert(record: Submission): Promise<void> {
    this.records.set(JSON.stringify(recordKey(record)), structuredClone(record));
  }

  async list(account: StudentAccount): Promise<Submission[]> {
    const [platform, namespace, handle] = accountKey(account);
    return [...this.records.values()]
      .filter((record) => record.platform === platform && record.namespace === namespace && record.handle === handle)
      .map((record) => structuredClone(record));
  }

  async delete(account: StudentAccount): Promise<number> {
    const prefix = JSON.stringify(accountKey(account)).slice(0, -1) + ",";
    let count = 0;
    for (const key of this.records.keys()) {
      if (key.startsWith(prefix)) { this.records.delete(key); count++; }
    }
    return count;
  }
}
