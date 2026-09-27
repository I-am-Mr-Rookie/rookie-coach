import { IndexedDbEvidenceStore, type StudentAccount } from "@rookie-coach/core";
import { importPage } from "./import.js";

const form = document.querySelector<HTMLFormElement>("#import-form")!;
const handleInput = document.querySelector<HTMLInputElement>("#handle")!;
const metadataInput = document.querySelector<HTMLInputElement>("#metadata")!;
const sourceInput = document.querySelector<HTMLInputElement>("#sources")!;
const statusElement = document.querySelector<HTMLElement>("#status")!;
const button = form.querySelector<HTMLButtonElement>("button")!;
const exportButton = document.querySelector<HTMLButtonElement>("#export")!;
const deleteButton = document.querySelector<HTMLButtonElement>("#delete")!;

function selectedAccount(): StudentAccount | null {
  const handle = handleInput.value.trim();
  if (!handle) { statusElement.textContent = "Enter your Codeforces handle."; return null; }
  return { schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle };
}

function setBusy(busy: boolean): void {
  button.disabled = exportButton.disabled = deleteButton.disabled = busy;
}

handleInput.value = localStorage.getItem("codeforcesHandle") ?? "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const account = selectedAccount();
  if (!account) return;
  const { handle } = account;
  localStorage.setItem("codeforcesHandle", handle);
  const metadataFile = metadataInput.files?.[0];
  if (!metadataFile) {
    statusElement.textContent = "Select your Codeforces user.status JSON file.";
    return;
  }
  setBusy(true);
  try {
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
    setBusy(false);
  }
});

exportButton.addEventListener("click", async () => {
  const account = selectedAccount();
  if (!account) return;
  setBusy(true);
  try {
    const submissions = await new IndexedDbEvidenceStore().list(account);
    if (!submissions.length) { statusElement.textContent = `No evidence to export for ${account.handle}.`; return; }
    submissions.sort((a, b) => a.submissionId.localeCompare(b.submissionId));
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, account, submissions }, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = "rookie-coach-evidence.json";
      link.click();
      statusElement.textContent = `Exported ${submissions.length} local submissions for ${account.handle}. Keep the file private.`;
    } finally { URL.revokeObjectURL(url); }
  } catch (error) {
    statusElement.textContent = `Export failed: ${error instanceof Error ? error.message : String(error)}`;
  } finally { setBusy(false); }
});

deleteButton.addEventListener("click", async () => {
  const account = selectedAccount();
  if (!account || !confirm(`Delete all local evidence for ${account.handle} permanently? This cannot be undone.`)) return;
  setBusy(true);
  try {
    const count = await new IndexedDbEvidenceStore().delete(account);
    const disconnected = localStorage.getItem("codeforcesHandle") === account.handle;
    if (disconnected) localStorage.removeItem("codeforcesHandle");
    handleInput.value = "";
    metadataInput.value = sourceInput.value = "";
    statusElement.textContent = `Deleted ${count} local submissions for ${account.handle}.${disconnected ? " The saved handle is disconnected." : ""}`;
  } catch (error) {
    statusElement.textContent = `Delete failed: ${error instanceof Error ? error.message : String(error)}`;
  } finally { setBusy(false); }
});
