/** Static shape of the version 1 records in docs/evidence-contract-v1.md. */
export const schemaVersion = 1 as const;

export interface StudentAccount {
  schemaVersion: 1;
  platform: string;
  namespace: string;
  handle: string;
}

export interface ProblemRef {
  platform: string;
  problemId: string;
  name: string;
  contestId?: number;
  index?: string;
  difficulty?: number;
  tags?: string[];
}

export interface Submission extends StudentAccount {
  submissionId: string;
  problem: ProblemRef;
  verdict: string | null;
  language: string;
  submittedAt: number;
  source: string | null;
  sourceStatus: "available" | "unavailable" | "not-collected";
  captureMethod: "api" | "saved-page" | "user-export";
  provenance: string;
  capturedAt: string;
}

export { IndexedDbEvidenceStore, MemoryEvidenceStore, type EvidenceStore } from "./storage.js";
