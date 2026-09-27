/** Readers for ordinary Codeforces HTML pages, as served to the signed-in user's own browser. */

export const codeforcesOrigin = "https://codeforces.com";

export interface Sample {
  input: string;
  output: string;
}

export interface StatementSection {
  title: string;
  markdown: string;
}

export interface ProblemStatement {
  title: string | null;
  timeLimit: string | null;
  memoryLimit: string | null;
  inputFile: string | null;
  outputFile: string | null;
  sections: StatementSection[];
  samples: Sample[];
  /** Number of sections that appear before the examples on the page. */
  samplesAfterSection: number;
}

// Codeforces serves gym contests (IDs from 100000) under /gym instead of /contest.
function contestPath(contestId: number): string {
  return contestId >= 100000 ? `/gym/${contestId}` : `/contest/${contestId}`;
}

export function problemUrl(contestId: number | undefined, index: string, origin = codeforcesOrigin): string | null {
  return contestId === undefined ? null : `${origin}${contestPath(contestId)}/problem/${encodeURIComponent(index)}`;
}

export function submissionUrl(contestId: number | undefined, submissionId: string, origin = codeforcesOrigin): string | null {
  return contestId === undefined ? null : `${origin}${contestPath(contestId)}/submission/${submissionId}`;
}

/** The handle shown in the page header, or null when the page shows Enter/Register instead. */
export function signedInHandle(doc: Document): string | null {
  const header = doc.querySelector(".lang-chooser");
  if (!header || !header.querySelector('a[href*="/logout"]')) return null;
  const profile = header.querySelector('a[href*="/profile/"]');
  const href = profile?.getAttribute("href") ?? "";
  const handle = decodeURIComponent(href.slice(href.indexOf("/profile/") + "/profile/".length)).split(/[/?#]/)[0]!;
  return handle.trim() || null;
}

/** A browser check or refusal from Codeforces; never try to get past it. */
export function isBrowserCheck(status: number, html: string): boolean {
  // Normal pages often carry Cloudflare's "/cdn-cgi/challenge-platform/scripts/jsd/main.js" detection
  // script, so that path alone must not count; only markers of an actual challenge page do.
  return status === 403 || status === 429 ||
    /Your browser is being checked|_cf_chl_opt|cf-chl-|<title>\s*(Just a moment|Attention Required)/i.test(html);
}

/** Problem page URL that asks Codeforces for the English statement and title. */
export function englishPage(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}locale=en`;
}

export function isSignInPage(finalUrl: string): boolean {
  try { return new URL(finalUrl).pathname.startsWith("/enter"); } catch { return false; }
}

export function extractSource(doc: Document): string | null {
  const text = doc.getElementById("program-source-text")?.textContent;
  return text ? text.replace(/\r\n?/g, "\n") : null;
}

function textWithBreaks(node: Node): string {
  if (node.nodeType === 3) return node.textContent ?? "";
  if (node.nodeType !== 1) return "";
  if ((node as Element).tagName.toLowerCase() === "br") return "\n";
  return Array.from(node.childNodes, textWithBreaks).join("");
}

function preText(pre: Element): string {
  const lines = pre.querySelectorAll(".test-example-line");
  const text = lines.length ? Array.from(lines, (line) => line.textContent ?? "").join("\n") : textWithBreaks(pre);
  return text.replace(/\r\n?/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "");
}

export function fence(text: string, language = ""): string {
  const longest = Math.max(0, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length));
  const marks = "`".repeat(Math.max(3, longest + 1));
  return `${marks}${language}\n${text}\n${marks}`;
}

function inlineCode(text: string): string {
  const core = text.trim();
  if (!core) return text;
  const marks = core.includes("`") ? "``" : "`";
  return `${marks}${core}${marks}`;
}

function wrap(mark: string, text: string): string {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
  return match[2] ? `${match[1]}${mark}${match[2]}${mark}${match[3]}` : text;
}

function absolute(href: string, base: string): string {
  try { return new URL(href, base).href; } catch { return href; }
}

function toMarkdown(node: Node, base: string): string {
  if (node.nodeType === 3) return (node.textContent ?? "").replace(/\s+/g, " ");
  if (node.nodeType !== 1) return "";
  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const classes = element.classList;
  const inner = () => Array.from(element.childNodes, (child) => toMarkdown(child, base)).join("");
  const block = (text: string) => `\n\n${text.trim()}\n\n`;

  // Rendered pages (not raw fetches) contain MathJax output; keep only the original TeX.
  if (classes.contains("MathJax_Preview") || classes.contains("MathJax") || classes.contains("MathJax_Display")) return "";
  switch (tag) {
    case "script": {
      const type = element.getAttribute("type") ?? "";
      if (!type.startsWith("math/tex")) return "";
      const tex = (element.textContent ?? "").trim();
      return type.includes("mode=display") ? block(`$$${tex}$$`) : `$${tex}$`;
    }
    case "style": case "noscript": return "";
    case "br": return "\n";
    case "p": case "div": case "center": case "blockquote": return block(inner());
    case "pre": return block(fence(preText(element), "text"));
    case "ul": case "ol": {
      const items = Array.from(element.children).filter((child) => child.tagName.toLowerCase() === "li")
        .map((item, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${Array.from(item.childNodes, (child) => toMarkdown(child, base)).join("").trim().replace(/\n{2,}/g, "\n  ")}`);
      return block(items.join("\n"));
    }
    case "b": case "strong": return wrap("**", inner());
    case "i": case "em": return wrap("*", inner());
    case "code": case "tt": return inlineCode(inner());
    case "sup": return `^{${inner().trim()}}`;
    case "sub": return `_{${inner().trim()}}`;
    case "img": {
      const src = element.getAttribute("src");
      return src ? `![${element.getAttribute("alt") ?? "image"}](${absolute(src, base)})` : "";
    }
    case "a": {
      const href = element.getAttribute("href");
      const text = inner();
      return href && !/^javascript:/i.test(href) && text.trim() ? `[${text.trim()}](${absolute(href, base)})` : text;
    }
    case "table": {
      const rows = Array.from(element.querySelectorAll("tr"), (row) => Array.from(row.children,
        (cell) => toMarkdown(cell, base).trim().replace(/\s*\n+\s*/g, " ").replace(/\|/g, "\\|")));
      if (!rows.length) return "";
      const width = Math.max(...rows.map((row) => row.length));
      const line = (cells: string[]) => `| ${Array.from({ length: width }, (_, i) => cells[i] ?? "").join(" | ")} |`;
      return block([line(rows[0]!), line(Array(width).fill("---")), ...rows.slice(1).map(line)].join("\n"));
    }
    case "span":
      if (classes.contains("tex-font-style-tt")) return inlineCode(inner());
      if (classes.contains("tex-font-style-bf")) return wrap("**", inner());
      if (classes.contains("tex-font-style-it") || classes.contains("tex-font-style-sl")) return wrap("*", inner());
      return inner();
    default: return inner();
  }
}

function tidy(markdown: string): string {
  return markdown
    // Raw Codeforces HTML writes TeX as $$$inline$$$ and $$$$$$display$$$$$$.
    .replace(/\${6}([\s\S]+?)\${6}/g, (_, tex: string) => `$$${tex.trim()}$$`)
    .replace(/\${3}([\s\S]+?)\${3}/g, (_, tex: string) => `$${tex.trim()}$`)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function property(header: Element | null, className: string): string | null {
  const element = header?.querySelector(`.${className}`);
  if (!element) return null;
  const clone = element.cloneNode(true) as Element;
  clone.querySelector(".property-title")?.remove();
  return clone.textContent?.replace(/\s+/g, " ").trim() || null;
}

const sectionNames: Record<string, string> = {
  "input-specification": "Input",
  "output-specification": "Output",
  "note": "Note",
};

/** Read the problem statement, limits and example tests from a problem page. */
export function extractStatement(doc: Document, pageUrl: string): ProblemStatement | null {
  const root = doc.querySelector(".problem-statement");
  if (!root) return null;
  const header = root.querySelector(".header");
  const sections: StatementSection[] = [];
  const samples: Sample[] = [];
  let samplesAfterSection: number | null = null;

  for (const child of Array.from(root.children)) {
    if (child.classList.contains("header")) continue;
    if (child.classList.contains("sample-tests")) {
      samplesAfterSection ??= sections.length;
      const inputs = Array.from(child.querySelectorAll(".input pre"), preText);
      const outputs = Array.from(child.querySelectorAll(".output pre"), preText);
      inputs.forEach((input, i) => samples.push({ input, output: outputs[i] ?? "" }));
      continue;
    }
    const clone = child.cloneNode(true) as Element;
    const heading = Array.from(clone.children).find((element) => element.classList.contains("section-title"));
    const known = Object.keys(sectionNames).find((name) => clone.classList.contains(name));
    const title = heading?.textContent?.replace(/\s+/g, " ").trim() || (known ? sectionNames[known]! : "Statement");
    heading?.remove();
    const markdown = tidy(toMarkdown(clone, pageUrl));
    if (markdown) sections.push({ title, markdown });
  }

  return {
    title: header?.querySelector(".title")?.textContent?.replace(/\s+/g, " ").trim() || null,
    timeLimit: property(header, "time-limit"),
    memoryLimit: property(header, "memory-limit"),
    inputFile: property(header, "input-file"),
    outputFile: property(header, "output-file"),
    sections,
    samples,
    samplesAfterSection: samplesAfterSection ?? sections.length,
  };
}
