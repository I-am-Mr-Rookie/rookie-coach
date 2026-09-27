const notCodeforces = document.querySelector<HTMLElement>("#not-codeforces")!;
const openButton = document.querySelector<HTMLButtonElement>("#open")!;
const form = document.querySelector<HTMLFormElement>("#form")!;
const account = document.querySelector<HTMLElement>("#account")!;
const handleInput = document.querySelector<HTMLInputElement>("#handle")!;
const limitSelect = document.querySelector<HTMLSelectElement>("#limit")!;
const apiKeyInput = document.querySelector<HTMLInputElement>("#api-key")!;
const apiSecretInput = document.querySelector<HTMLInputElement>("#api-secret")!;
const startButton = document.querySelector<HTMLButtonElement>("#start")!;
const statusLine = document.querySelector<HTMLElement>("#status")!;

function isCodeforces(url: string | undefined): boolean {
  try {
    const { protocol, hostname } = new URL(url ?? "");
    return protocol === "https:" && (hostname === "codeforces.com" || hostname.endsWith(".codeforces.com"));
  } catch { return false; }
}

// Runs inside the Codeforces tab. It must stay self-contained because Chrome serializes it.
function probeTab(): { handle: string | null; running: boolean } {
  const header = document.querySelector(".lang-chooser");
  const href = header?.querySelector('a[href*="/profile/"]')?.getAttribute("href") ?? "";
  const handle = header?.querySelector('a[href*="/logout"]')
    ? decodeURIComponent(href.split("/profile/")[1] ?? "").split(/[/?#]/)[0]!.trim() : "";
  return { handle: handle || null, running: Boolean((globalThis as { __rookieCoachRunning?: boolean }).__rookieCoachRunning) };
}

function setOptions(options: unknown): void {
  (globalThis as { __rookieCoachOptions?: unknown }).__rookieCoachOptions = options;
}

async function init(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tab?.id;
  if (tabId === undefined || !isCodeforces(tab?.url)) {
    notCodeforces.hidden = false;
    openButton.addEventListener("click", async () => {
      if (tabId !== undefined) await chrome.tabs.update(tabId, { url: "https://codeforces.com/" });
      window.close();
    });
    return;
  }

  const [probe] = await chrome.scripting.executeScript({ target: { tabId }, func: probeTab });
  const signedIn = probe?.result?.handle ?? null;
  form.hidden = false;
  handleInput.value = signedIn ?? localStorage.getItem("lastHandle") ?? "";
  if (signedIn) {
    account.textContent = `Signed in as ${signedIn}. Your code will be included.`;
  } else {
    account.textContent = "Not signed in. You can still save problems and verdicts, but your code needs you to sign in to Codeforces.";
    account.classList.add("warn");
  }
  if (probe?.result?.running) {
    startButton.disabled = true;
    statusLine.textContent = "A file is already being created in this tab. Progress is shown on the page.";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const handle = handleInput.value.trim();
    const key = apiKeyInput.value.trim();
    const secret = apiSecretInput.value.trim();
    if (!handle) { statusLine.textContent = "Enter a Codeforces handle."; return; }
    if (Boolean(key) !== Boolean(secret)) { statusLine.textContent = "Enter both the API key and the API secret, or leave both empty."; return; }
    const limit = limitSelect.value === "all" ? "all" : Number(limitSelect.value);
    startButton.disabled = true;
    try {
      localStorage.setItem("lastHandle", handle);
      await chrome.scripting.executeScript({ target: { tabId }, func: setOptions,
        args: [{ handle, limit, ...(key ? { api: { key, secret } } : {}) }] });
      await chrome.scripting.executeScript({ target: { tabId }, files: ["dist/collector.js"] });
      apiKeyInput.value = apiSecretInput.value = "";
      statusLine.textContent = "Started. Progress is shown on the Codeforces page. You can close this popup, but keep that tab open.";
    } catch (error) {
      startButton.disabled = false;
      statusLine.textContent = `Could not start: ${error instanceof Error ? error.message : String(error)}`;
    }
  });
}

void init().catch((error: unknown) => {
  statusLine.textContent = `Something went wrong: ${error instanceof Error ? error.message : String(error)}`;
});
