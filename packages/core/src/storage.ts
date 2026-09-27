import type { StudentAccount, Submission } from "./index.js";

export interface EvidenceStore {
  upsert(record: Submission): Promise<void>;
  list(account: StudentAccount): Promise<Submission[]>;
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
}

/** Browser-local evidence. The compound key prevents handles or namespaces from colliding. */
export class IndexedDbEvidenceStore implements EvidenceStore {
  constructor(private readonly factory: IDBFactory = indexedDB) {}

  private async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open("rookie-coach-evidence", 1);
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore("submissions", {
          keyPath: ["platform", "namespace", "handle", "submissionId"],
        });
        store.createIndex("account", ["platform", "namespace", "handle"]);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async upsert(record: Submission): Promise<void> {
    recordKey(record);
    const db = await this.open();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("submissions", "readwrite");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
        transaction.objectStore("submissions").put(record);
      });
    } finally {
      db.close();
    }
  }

  async list(account: StudentAccount): Promise<Submission[]> {
    const key = accountKey(account);
    const db = await this.open();
    try {
      return await new Promise<Submission[]>((resolve, reject) => {
        const transaction = db.transaction("submissions", "readonly");
        const request = transaction.objectStore("submissions").index("account").getAll(key);
        let records: Submission[] = [];
        request.onsuccess = () => { records = request.result as Submission[]; };
        transaction.oncomplete = () => resolve(records);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  }
}
