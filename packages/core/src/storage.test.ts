import { expect, test } from "vitest";
import { indexedDB as fakeIndexedDB } from "fake-indexeddb";
import type { StudentAccount, Submission } from "./index.js";
import { IndexedDbEvidenceStore, MemoryEvidenceStore } from "./storage.js";

const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "student", handle: "one" };
const second: StudentAccount = { ...account, handle: "two" };
const third: StudentAccount = { ...account, namespace: "other" };

function submission(owner: StudentAccount, source: string | null = null): Submission {
  return {
    ...owner, submissionId: "42",
    problem: { platform: owner.platform, problemId: "contest:1/A", name: "Synthetic task" },
    verdict: "OK", language: "Python 3", submittedAt: 1,
    source, sourceStatus: source ? "available" : "not-collected",
    captureMethod: source ? "user-export" : "api",
    provenance: source ? "synthetic export" : "codeforces:user.status",
    capturedAt: "2026-09-27T00:00:00Z",
  };
}

test("upserts by full account and submission ID, retaining source evidence and isolating copies", async () => {
  const store = new MemoryEvidenceStore();
  const first = submission(account);
  await store.upsert(first);
  first.provenance = "changed after write";
  await store.upsert(submission(second));
  await store.upsert(submission(third));
  await store.upsert(submission(account, "print(42)"));

  expect(await store.list(account)).toEqual([submission(account, "print(42)")]);
  expect(await store.list(second)).toEqual([submission(second)]);
  expect(await store.list(third)).toEqual([submission(third)]);
  const fetched = await store.list(account);
  fetched[0]!.provenance = "changed after read";
  expect((await store.list(account))[0]!.provenance).toBe("synthetic export");
  await expect(store.upsert({ ...submission(account), sourceStatus: "available" })).rejects.toThrow("Invalid evidence submission");
});

test("IndexedDB persists account-isolated upserts across store instances", async () => {
  const store = new IndexedDbEvidenceStore(fakeIndexedDB);
  await store.upsert(submission(account));
  await store.upsert(submission(second));
  await store.upsert(submission(account, "print(42)"));
  const reopened = new IndexedDbEvidenceStore(fakeIndexedDB);
  expect(await reopened.list(account)).toEqual([submission(account, "print(42)")]);
  expect(await reopened.list(second)).toEqual([submission(second)]);
  expect(await reopened.list(third)).toEqual([]);
});

test("deleting one account persists across reopened stores without touching other accounts", async () => {
  for (const store of [new MemoryEvidenceStore(), new IndexedDbEvidenceStore(fakeIndexedDB)]) {
    await store.upsert(submission(account, "private source"));
    await store.upsert(submission(second));
    await store.upsert(submission(third));
    expect(await store.delete(account)).toBe(1);
    expect(await store.delete(account)).toBe(0);
    const reopened = store instanceof MemoryEvidenceStore ? store : new IndexedDbEvidenceStore(fakeIndexedDB);
    expect(await reopened.list(account)).toEqual([]);
    expect(await reopened.list(second)).toEqual([submission(second)]);
    expect(await reopened.list(third)).toEqual([submission(third)]);
    await expect(store.delete({ ...account, handle: " " })).rejects.toThrow("Invalid evidence account");
  }
});
