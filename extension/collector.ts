import {
  bundleFileName, bundleToMarkdown, collectBundle, partSize, requestSpacingMs, signedInHandle, splitBundle, zipFiles,
  type CollectOptions,
} from "@rookie-coach/codeforces";

type Options = Pick<CollectOptions, "handle" | "limit" | "api">;
const scope = globalThis as typeof globalThis & { __rookieCoachOptions?: Options; __rookieCoachRunning?: boolean };

function panel(onStop: () => void) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    .box{width:340px;font:14px/1.45 system-ui,sans-serif;color:#17233a;background:#fff;border:1px solid #c9d3e3;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:14px 16px}
    b{display:block;margin-bottom:4px} p{margin:6px 0;word-wrap:break-word} .muted{color:#5b6475;font-size:12.5px}
    .bar{height:6px;background:#e7ebf2;border-radius:3px;overflow:hidden;margin:8px 0} .bar i{display:block;height:100%;width:0;background:#2f6fd1}
    button{margin-top:6px;padding:6px 12px;font:inherit;cursor:pointer}
  </style><div class="box" role="status" aria-live="polite"><b>Rookie Coach</b><p class="msg">Starting…</p>
  <div class="bar"><i></i></div><p class="muted eta">Keep this tab open.</p><button class="go" type="button" hidden>I passed the check, continue</button>
  <button class="stop" type="button">Stop and save what I have</button></div>`;
  const message = root.querySelector<HTMLElement>(".msg")!;
  const eta = root.querySelector<HTMLElement>(".eta")!;
  const bar = root.querySelector<HTMLElement>(".bar i")!;
  const button = root.querySelector<HTMLButtonElement>(".stop")!;
  const go = root.querySelector<HTMLButtonElement>(".go")!;
  let waiting: ((carryOn: boolean) => void) | null = null;
  const answer = (carryOn: boolean) => { go.hidden = true; waiting?.(carryOn); waiting = null; };
  button.addEventListener("click", () => { button.disabled = true; button.textContent = "Stopping…"; answer(false); onStop(); });
  go.addEventListener("click", () => { message.textContent = "Continuing…"; answer(true); });
  document.body.append(host);
  return {
    waitForCheck(text: string): Promise<boolean> {
      message.textContent = `${text}. Open codeforces.com in a new tab and complete the check there yourself, then come back and press Continue. Or stop and save what you have.`;
      go.hidden = false;
      return new Promise<boolean>((resolve) => { waiting = resolve; });
    },
    progress(text: string, done: number, total: number) {
      message.textContent = text;
      if (total) {
        bar.style.width = `${Math.round((done / total) * 100)}%`;
        const minutes = Math.ceil(((total - done) * requestSpacingMs) / 60000);
        eta.textContent = `${done} of ${total} pages · about ${minutes} min left. Keep this tab open.`;
      }
    },
    finish(text: string) {
      message.textContent = text;
      bar.style.width = "100%";
      eta.textContent = "Nothing else was saved: no copies, caches or temporary files.";
      button.disabled = false;
      button.textContent = "Close";
      button.onclick = () => host.remove();
    },
  };
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download; release the in-memory copy shortly after.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function run(): Promise<void> {
  const options = scope.__rookieCoachOptions;
  delete scope.__rookieCoachOptions;
  if (!options || scope.__rookieCoachRunning) return;
  scope.__rookieCoachRunning = true;
  const controller = new AbortController();
  const ui = panel(() => controller.abort());
  try {
    const bundle = await collectBundle({ ...options, signedInHandle: signedInHandle(document), origin: location.origin }, {
      fetchPage: async (url) => {
        const response = await fetch(url, { credentials: "same-origin" });
        return { status: response.status, url: response.url, text: await response.text() };
      },
      parseHtml: (html) => new DOMParser().parseFromString(html, "text/html"),
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      now: () => new Date(),
      progress: ui.progress,
      waitForCheck: ui.waitForCheck,
      signal: controller.signal,
    });
    const markdown = bundleToMarkdown(bundle);
    const parts = bundle.requested === "all" ? splitBundle(bundle) : [bundle];
    let fileName: string;
    if (parts.length === 1) {
      fileName = bundleFileName(bundle);
      download(new Blob([markdown], { type: "text/markdown;charset=utf-8" }), fileName);
    } else {
      fileName = bundleFileName(bundle, "zip");
      const files = parts.map((part) => ({ name: bundleFileName(part), text: bundleToMarkdown(part) }));
      download(new Blob([zipFiles(files, new Date(bundle.collectedAt))], { type: "application/zip" }), fileName);
    }
    const submissions = bundle.problems.reduce((total, problem) => total + problem.submissions.length, 0);
    const incomplete = /^complete: no \((.*); each/m.exec(markdown)?.[1];
    ui.finish(`Saved ${fileName} to your downloads${parts.length > 1 ? ` (${parts.length} Markdown files of up to ${partSize} submissions)` : ""}: ` +
      `${submissions} submissions on ${bundle.problems.length} problems.` +
      (incomplete ? ` Warning: the file is incomplete (${incomplete}).` : " Everything was collected.") +
      (bundle.notes.length ? ` Notes: ${bundle.notes.join(" ")}` : ""));
  } catch (error) {
    ui.finish(`Could not create the file: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    scope.__rookieCoachRunning = false;
  }
}

void run();
