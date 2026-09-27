import { expect, test } from "vitest";
import { evidenceVersion } from "./index.js";

test("adapter workspace resolves the shared evidence contract", () => {
  expect(evidenceVersion).toBe(1);
});
