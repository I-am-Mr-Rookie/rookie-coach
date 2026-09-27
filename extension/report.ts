import { IndexedDbEvidenceStore, summarizeEvidence, type StudentAccount } from "@rookie-coach/core";

const status = document.querySelector<HTMLElement>("#status")!;
const report = document.querySelector<HTMLElement>("#report")!;

function list(selector: string, lines: string[]): void {
  const element = document.querySelector<HTMLUListElement>(selector)!;
  const items = (lines.length ? lines : ["None in the imported records."]).map((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    return item;
  });
  element.replaceChildren(...items);
}

async function load(): Promise<void> {
  const handle = localStorage.getItem("codeforcesHandle")?.trim();
  if (!handle) {
    status.textContent = "Set your Codeforces handle in the extension popup and import a page first.";
    return;
  }
  const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle };
  try {
    const summary = summarizeEvidence(account, await new IndexedDbEvidenceStore().list(account));
    status.textContent = summary.totalAttempts ? `Showing locally stored evidence for ${handle}.` :
      `No stored submissions for ${handle}. Import a user.status JSON page from the popup first.`;
    if (!summary.totalAttempts) return;
    const withoutSource = summary.sourceStatusDistribution
      .filter(({ status }) => status !== "available").reduce((total, { attempts }) => total + attempts, 0);
    document.querySelector<HTMLElement>("#overview")!.textContent =
      `${summary.totalAttempts} observed attempts; ${summary.acceptedCount} accepted; ${withoutSource} without source text. ${summary.problems.length} distinct problems in the imported records.`;
    list("#repeats", summary.problems.filter((problem) => problem.attempts > 1).map((problem) =>
      `${problem.name} (${problem.problemId}): ${problem.attempts} observed attempts; ${problem.observedAttemptsBeforeFirstAcceptance === null
        ? "no acceptance observed" : `${problem.observedAttemptsBeforeFirstAcceptance} observed before first acceptance`}.`));
    list("#verdicts", summary.verdictDistribution.map(({ verdict, attempts }) => `${verdict ?? "Unjudged / missing verdict"}: ${attempts}`));
    list("#languages", summary.languageDistribution.map(({ language, attempts }) => `${language}: ${attempts}`));
    list("#coverage", summary.sourceStatusDistribution.map(({ status, attempts }) => `${status}: ${attempts}`));
    list("#difficulties", summary.difficultyDistribution.map(({ difficulty, attempts }) => `${difficulty}: ${attempts}`));
    list("#tags", summary.tagDistribution.map(({ tag, attempts }) => `${tag}: ${attempts}`));
    report.hidden = false;
  } catch (error) {
    status.textContent = `Could not read local evidence: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void load();
