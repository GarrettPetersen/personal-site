import { execFileSync } from "node:child_process";
import { readFile, rename, writeFile } from "node:fs/promises";
import { validateDesk } from "../src/lib/desk.mjs";

// Only aggregates and dates cross this boundary. Never copy API payloads or
// private commit/issue titles into the public repository.
const snapshotUrl = new URL("../src/data/desk.json", import.meta.url);
const data = validateDesk(JSON.parse(await readFile(snapshotUrl, "utf8")));
const checkedAt = new Date().toISOString();

function github(endpoint) {
  return JSON.parse(execFileSync("gh", ["api", endpoint], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 }));
}

for (const project of data.projects) {
  if (!project.repo) continue;
  const base = `repos/${project.repo}`;
  const metadata = github(base);
  const commits = github(`${base}/commits?per_page=1`);
  if (!commits[0]?.commit?.committer?.date) throw new Error(`No default-branch activity for ${project.id}`);
  const query = (type) => github(`search/issues?q=${encodeURIComponent(`repo:${project.repo} is:${type} is:open`)}`);
  const pulls = query("pr"), issues = query("issue");
  if (pulls.incomplete_results || issues.incomplete_results) throw new Error(`Incomplete work counts for ${project.id}`);
  const runs = github(`${base}/actions/runs?branch=${encodeURIComponent(metadata.default_branch)}&per_page=1`);
  const latestRun = runs.workflow_runs[0];
  project.activity = {
    checkedAt,
    lastCommitAt: commits[0].commit.committer.date,
    openPullRequests: pulls.total_count,
    openIssues: issues.total_count,
    ci: latestRun ? { status: latestRun.status, conclusion: latestRun.conclusion, createdAt: latestRun.created_at } : null,
  };
  console.log(`Checked ${project.name}`);
}

const response = await fetch("https://24histories.com/data/progress.json", { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Glossary data returned HTTP ${response.status}`);
const progress = await response.json();
const glossary = progress.peopleGlossary;
if (!glossary || !Number.isInteger(glossary.extractedChapters) || !Number.isInteger(glossary.sourceChapters) || !Number.isFinite(Date.parse(progress.generatedAt))) throw new Error("Glossary progress schema changed");
const metric = data.metrics.find((item) => item.id === "glossary");
if (!metric) throw new Error("Missing glossary metric");
Object.assign(metric, { value: glossary.extractedChapters, total: glossary.sourceChapters, observedAt: progress.generatedAt });
for (const id of ["github", "glossary"]) {
  const source = data.sources.find((item) => item.id === id);
  if (!source) throw new Error(`Missing source: ${id}`);
  source.checkedAt = checkedAt;
  if (id === "glossary") source.note = "Measurement retains the published source snapshot’s original date; collection does not make it newer.";
}

// Human/agent review, email and Steam observation times intentionally stay put.
// Fail before replacing the file if any source or validation step failed.
validateDesk(data);
const temporaryUrl = new URL("./desk.json.tmp", snapshotUrl);
await writeFile(temporaryUrl, JSON.stringify(data, null, 2) + "\n");
await rename(temporaryUrl, snapshotUrl);
console.log("Saved aggregate source checks. Editorial review and Steam metrics retain their actual timestamps.");
