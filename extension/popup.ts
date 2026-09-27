import { IndexedDbEvidenceStore, type StudentAccount } from "@rookie-coach/core";
import { importPage } from "./import.js";

const form = document.querySelector<HTMLFormElement>("#import-form")!;
const handleInput = document.querySelector<HTMLInputElement>("#handle")!;
const metadataInput = document.querySelector<HTMLInputElement>("#metadata")!;
const sourceInput = document.querySelector<HTMLInputElement>("#sources")!;
const statusElement = document.querySelector<HTMLElement>("#status")!;
const button = form.querySelector<HTMLButtonElement>("button")!;

handleInput.value = localStorage.getItem("codeforcesHandle") ?? "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const handle = handleInput.value.trim();
  if (!handle) {
    statusElement.textContent = "Enter your Codeforces handle.";
    return;
  }
  localStorage.setItem("codeforcesHandle", handle);
  const metadataFile = metadataInput.files?.[0];
  if (!metadataFile) {
    statusElement.textContent = "Select your Codeforces user.status JSON file.";
    return;
  }
  button.disabled = true;
  try {
    const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle };
    statusElement.textContent = "Reading selected files…";
    const page: unknown = JSON.parse(await metadataFile.text());
    const sourceFile = sourceInput.files?.[0];
    const source: unknown | undefined = sourceFile ? JSON.parse(await sourceFile.text()) : undefined;
    const count = await importPage(account, page, source, new IndexedDbEvidenceStore(),
      (message) => { statusElement.textContent = message; });
    statusElement.textContent = `Stored ${count} submissions locally for ${handle}.`;
  } catch (error) {
    statusElement.textContent = `Import failed: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    button.disabled = false;
  }
});
