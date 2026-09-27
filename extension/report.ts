import { IndexedDbEvidenceStore, summarizeEvidence, diagnoseRecurringBoundaryEdit, practiceForDiagnosis, type StudentAccount } from "@rookie-coach/core";

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
    const records = await new IndexedDbEvidenceStore().list(account);
    const summary = summarizeEvidence(account, records);
    status.textContent = summary.totalAttempts ? `Showing locally stored evidence for ${handle}.` :
      `No stored submissions for ${handle}. Import a user.status JSON page from the popup first.`;
    const coaching = document.querySelector<HTMLElement>("#coaching-status")!;
    const action = document.querySelector<HTMLElement>("#action")!;
    if (!summary.totalAttempts) {
      coaching.textContent = "Insufficient evidence: no submissions imported for this account.";
    } else {
      const diagnosis = diagnoseRecurringBoundaryEdit(account, records);
      if (diagnosis.status === "finding") {
        coaching.textContent = diagnosis.finding.wording;
        list("#support", diagnosis.finding.support.map(({ problemId, failed, accepted }) =>
          `${problemId}: failed submission ${failed.submissionId} (${failed.captureMethod} metadata: ${failed.provenance}; ${failed.sourceCaptureMethod} source: ${failed.sourceProvenance}, ${failed.sourceCapturedAt}) → accepted submission ${accepted.submissionId} (${accepted.captureMethod} metadata: ${accepted.provenance}; ${accepted.sourceCaptureMethod} source: ${accepted.sourceProvenance}, ${accepted.sourceCapturedAt}).`));
        const byId = new Map(records.map((record) => [record.submissionId, record]));
        document.querySelector<HTMLElement>("#source")!.textContent = diagnosis.finding.support.map(({ problemId, failed, accepted }) =>
          `${problemId}, failed ${failed.submissionId}:\n${byId.get(failed.submissionId)!.source}\n${problemId}, accepted ${accepted.submissionId}:\n${byId.get(accepted.submissionId)!.source}`).join("\n\n");
        document.querySelector<HTMLElement>("#source-details")!.hidden = false;
        const practice = practiceForDiagnosis(diagnosis);
        if (practice) {
          action.textContent = `Practice: ${practice.title}. Why: ${practice.why} Try: ${practice.exercise} Check: ${practice.completion}`;
          action.hidden = false;
        }
      } else {
        const explanations = {
          "no-eligible-pairs": "Insufficient evidence: no observed adjacent judged failure followed by acceptance on the same problem.",
          "missing-source": "Insufficient evidence: source text is missing for an eligible pair; not-collected and unavailable are shown below.",
          "missing-source-origin": "Insufficient evidence: an eligible source pair lacks capture origin.",
          "unsupported-platform": "Insufficient evidence: this rule supports Codeforces only.",
          "unsupported-language": "Insufficient evidence: this rule supports GNU C++20 only.",
          "only-one-problem": "Insufficient evidence: a matching edit was observed on only one distinct problem.",
          "no-matching-edit": "No supported pattern in the imported records' eligible source pairs.",
        };
        coaching.textContent = explanations[diagnosis.reason];
      }
    }
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
