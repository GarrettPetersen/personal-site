import { parseDate } from "./dates.mjs";
import { summarizeRevenue } from "./revenue.mjs";
import { validateTelemetry } from "./telemetry.mjs";

export const timeZone = "America/Vancouver";

/** @param {Date} [now] */
export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** @param {string} value @param {Intl.DateTimeFormatOptions} [options] */
export function formatDate(value, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "UTC" }).format(parseDate(value));
}

/** @param {string} value */
export function formatChecked(value) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

/** @param {string} from @param {string} to */
export function daysBetween(from, to) {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

/** @param {string} value @param {Date} [now] */
export function isStale(value, now = new Date()) {
  const observedAt = new Date(value.length === 10 ? `${value}T23:59:59Z` : value).getTime();
  if (!Number.isFinite(observedAt) || !Number.isFinite(now.getTime())) throw new Error("Invalid freshness timestamp");
  const age = now.getTime() - observedAt;
  return age > 48 * 60 * 60 * 1000;
}

/** Published output excludes empty reviews and intermediate extractions. @param {any} status */
export function publishedGlossaryMetric(status) {
  const publication = status.publication;
  const count = (value) => Number.isSafeInteger(value) && value >= 0;
  if (status.published !== true || status.preview !== false || !Number.isFinite(Date.parse(status.generatedAt)) || !publication) throw new Error("Published glossary status is unavailable or its schema changed");
  for (const key of ["publishedPeople", "publishedNonemptyChapters", "publishedChapters", "sourceChapters"]) {
    if (!count(publication[key])) throw new Error(`Invalid published glossary count: ${key}`);
  }
  if (publication.publishedNonemptyChapters > publication.publishedChapters || publication.publishedChapters > publication.sourceChapters || status.people !== publication.publishedPeople) throw new Error("Published glossary counts disagree");
  const chapters = publication.publishedNonemptyChapters;
  return {
    label: "Person pages published",
    value: publication.publishedPeople,
    total: null,
    note: `${chapters.toLocaleString("en-CA")} nonempty chapter${chapters === 1 ? "" : "s"} published.`,
    observedAt: status.generatedAt,
  };
}

/** @param {number} year @param {number} month Zero-based month. */
export function monthCells(year, month) {
  const first = new Date(Date.UTC(year, month, 1, 12));
  const offset = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1 || day > days) return null;
    return new Date(Date.UTC(year, month, day, 12)).toISOString().slice(0, 10);
  });
}

/** @param {string} text */
function calendarText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

/** @param {string} line */
function foldLine(line) {
  const encoder = new TextEncoder();
  let result = "", width = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (width + bytes > 75) { result += "\r\n "; width = 1; }
    result += character;
    width += bytes;
  }
  return result;
}

/** @param {{id:string, date:string, title:string, kind:string, note:string, sourceUrl:string|null}[]} events @param {string} updatedAt */
export function calendarFeed(events, updatedAt) {
  const stamp = new Date(updatedAt).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Garrett Petersen//Project desk//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Project desk"];
  for (const event of events) {
    const end = parseDate(event.date);
    end.setUTCDate(end.getUTCDate() + 1);
    lines.push("BEGIN:VEVENT", `UID:${event.id}@garrettpetersen.com`, `DTSTAMP:${stamp}`, `LAST-MODIFIED:${stamp}`, `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`, `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll("-", "")}`, `SUMMARY:${calendarText(event.title)}`, `DESCRIPTION:${calendarText(event.note)}`, `STATUS:${event.kind === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`);
    if (event.sourceUrl) lines.push(`URL:${event.sourceUrl}`);
    lines.push("END:VEVENT");
  }
  return [...lines, "END:VCALENDAR"].map(foldLine).join("\r\n") + "\r\n";
}

/** Validate the published allowlist, including cross-references. @param {any} data */
export function validateDesk(data) {
  const required = (condition, message) => { if (!condition) throw new Error(`Project desk: ${message}`); };
  const timestamp = (value) => typeof value === "string" && /T.*Z$/.test(value) && Number.isFinite(Date.parse(value));
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  const id = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const url = (value) => { try { return typeof value === "string" && !/\s/.test(value) && new URL(value).protocol === "https:"; } catch { return false; } };
  required(data.schemaVersion === 1 && timestamp(data.reviewedAt), "invalid snapshot version or review time");
  required(data.prototypeStrategy && text(data.prototypeStrategy.approach) && text(data.prototypeStrategy.decision), "next-game strategy needs an approach and decision gate");
  required(data.platformExpansion && ["model", "timing", "gates"].every((key) => text(data.platformExpansion[key])), "platform expansion needs its model, tentative timing and release gates");
  for (const field of ["projects", "tasks", "metrics", "events", "archive", "sources"]) required(Array.isArray(data[field]), `${field} must be an array`);
  const ids = new Set();
  for (const project of data.projects) {
    required(id(project.id) && !ids.has(project.id), "project IDs must be unique slugs");
    ids.add(project.id);
    required(["focus", "prototype", "secondary"].includes(project.group), `invalid group for ${project.id}`);
    required(["attention", "moving", "exploring"].includes(project.health), `invalid health for ${project.id}`);
    for (const field of ["name", "stage", "summary", "next", "blocker"]) required(text(project[field]), `${project.id} needs ${field}`);
    required(project.url === null || url(project.url), "invalid project URL");
    required(project.repo === null || /^[\w.-]+\/[\w.-]+$/.test(project.repo), "invalid repository");
    required(project.activity !== undefined && (project.activity !== null || (project.repo === null && project.group === "secondary")), "repository projects need activity evidence");
  }
  summarizeRevenue(data.revenue);
  for (const stream of data.revenue) required(stream.projectId === null || ids.has(stream.projectId), "unknown revenue project");
  required(Array.isArray(data.opportunities)&&data.opportunities.length>0,"missing next-commitment decisions");
  const opportunityIds=new Set();
  for(const opportunity of data.opportunities){
    required(id(opportunity.id)&&!opportunityIds.has(opportunity.id)&&ids.has(opportunity.projectId),"invalid decision reference");
    opportunityIds.add(opportunity.id);
    for(const field of ["name","returnNote","timing","effort","effortNote","effortAssumptions","gate"])required(text(opportunity[field]),`decision needs ${field}`);
    required(["Earn","Learn"].includes(opportunity.kind)&&["now","next","later"].includes(opportunity.priority)&&["steam-scenario","kdp-history","unknown"].includes(opportunity.returnKind),"invalid decision category");
    for(const evidence of [opportunity.demand,opportunity.delivery])required(evidence&&Number.isInteger(evidence.level)&&evidence.level>=0&&evidence.level<=3&&text(evidence.label),"invalid qualitative evidence");
    required(Array.isArray(opportunity.milestones)&&opportunity.milestones.length>=2&&opportunity.milestones.filter(s=>s.state==='next').length===1,"a decision needs one next gate");
    for(const step of opportunity.milestones)required(text(step.label)&&["done","next","later"].includes(step.state),"invalid milestone");
  }
  for (const group of [data.tasks, data.metrics, data.events, data.archive, data.sources]) {
    const itemIds = new Set();
    for (const item of group) {
      required(id(item.id) && !itemIds.has(item.id), "item IDs must be unique slugs within a group");
      itemIds.add(item.id);
      if (item.projectId) required(ids.has(item.projectId), `unknown project ${item.projectId}`);
    }
  }
  for (const task of data.tasks) {
    required(["now", "next", "later"].includes(task.priority) && ["open", "done", "dismissed"].includes(task.status), "invalid task state");
    if (task.status === "open") required(["active", "waiting", "backburner"].includes(task.lane), "open task needs an explicit lane");
    for (const field of ["title", "owner", "source", "note"]) required(text(task[field]), `task needs ${field}`);
    required(timestamp(task.checkedAt), "task needs its actual verification time");
    if (task.due) parseDate(task.due);
    if (task.completedOn !== null) {
      parseDate(task.completedOn);
      required(task.status === "done" && task.completedOn <= localDate(new Date(task.checkedAt)), "invalid task completion date");
    }
    if (task.status === "dismissed") required(text(task.dismissedReason), "dismissed task needs the owner's reason");
    required(task.completionKind === null || (task.completionKind === "source" && task.status === "done"), "invalid completion kind");
  }
  const plan = data.dailyPlan;
  required(plan && timestamp(plan.checkedAt), "daily picks need a review timestamp");
  required(text(plan.focus) && plan.focus.length <= 350, "daily focus must be a short big-picture priority");
  required(text(plan.basis) && plan.basis.length <= 350, "daily picks need a concise evidence basis");
  parseDate(plan.date);
  required(plan.date === localDate(new Date(plan.checkedAt)), "daily picks must match their review date");
  required(Array.isArray(plan.taskIds) && plan.taskIds.length >= 1 && plan.taskIds.length <= 3 && new Set(plan.taskIds).size === plan.taskIds.length, "choose one to three unique daily tasks");
  for (const taskId of plan.taskIds) {
    const task = data.tasks.find(task => task.id === taskId);
    required(task && task.status === "open", "daily picks must reference open tasks");
    required(task.lane === "active", "daily picks must be active, not waiting or backburner tasks");
    required(Number.isInteger(task.importance) && task.importance >= 1 && task.importance <= 5, "daily task needs an importance rating");
    required(task.effortMinutes && Number.isSafeInteger(task.effortMinutes.min) && Number.isSafeInteger(task.effortMinutes.max) && task.effortMinutes.min > 0 && task.effortMinutes.max >= task.effortMinutes.min, "invalid daily effort range");
    required(["blue", "coral", "sage", "gold"].includes(task.tone) && text(task.signal) && text(task.outcome), "daily task needs presentation and a completion condition");
  }
  validateTelemetry(data.telemetry);
  for (const metric of data.metrics) {
    required(Number.isFinite(metric.value) && text(metric.label) && text(metric.note) && timestamp(metric.observedAt), "invalid metric or missing observation time");
    if (metric.total !== null) required(Number.isFinite(metric.total) && metric.total > 0 && metric.value >= 0 && metric.value <= metric.total, "invalid progress denominator");
  }
  for (const event of data.events) {
    parseDate(event.date);
    required(["confirmed", "planned"].includes(event.kind) && text(event.title) && text(event.note), "invalid calendar item");
    required(timestamp(event.verifiedAt) && (event.sourceUrl === null || url(event.sourceUrl)), "calendar evidence missing");
  }
  for (const source of data.sources) required(text(source.label) && timestamp(source.checkedAt), "invalid source check");
  for (const project of data.archive) {
    required(text(project.name) && text(project.status) && (project.url === null || url(project.url)), "invalid archived project");
    if (project.description !== undefined || project.status === "On hold") required(text(project.description), "held projects need a description");
  }
  return data;
}
