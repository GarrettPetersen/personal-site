import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calendarFeed, daysBetween, isStale, localDate, monthCells, publishedGlossaryMetric, validateDesk } from "../src/lib/desk.mjs";
import { parseDate } from "../src/lib/dates.mjs";
import { validateKdpReport } from "../src/lib/kdp.mjs";
import { calculateRevenueScenario, compareRevenueScenarios, defaultRevenueScenario, formatMoney, summarizeRevenue } from "../src/lib/revenue.mjs";
import { dailyTasks, taskLanes, totalEffort, formatEffort } from "../src/lib/tasks.mjs";
import { marqueTelemetrySnapshot } from "../src/lib/telemetry.mjs";

const snapshot = JSON.parse(readFileSync(new URL("../src/data/desk.json", import.meta.url), "utf8"));
const kdpSnapshot = JSON.parse(readFileSync(new URL("../src/data/kdp.json", import.meta.url), "utf8"));

test("daily picks reject completed, dismissed or unknown work and preserve bounded owner effort", () => {
  const tasks = [
    { id: "short-important", status: "open", importance: 5, effortMinutes: { min: 10, max: 15 } },
    { id: "long-later", status: "open", importance: 2, effortMinutes: { min: 90, max: 120 } },
    { id: "longer-important", status: "open", importance: 5, effortMinutes: { min: 20, max: 40 } },
  ];
  tasks.forEach(task => { task.lane = 'active'; });
  const picks = dailyTasks(tasks, { taskIds: tasks.map(task => task.id) });
  assert.deepEqual(picks.map(task => task.id), ["longer-important", "short-important", "long-later"]);
  assert.deepEqual(totalEffort(picks), { min: 120, max: 175 });
  assert.equal(formatEffort(totalEffort(picks)), "2h–2h 55m");
  for (const state of ["done", "dismissed"]) {
    const invalid = structuredClone(snapshot);
    const task = invalid.tasks.find(task => task.id === invalid.dailyPlan.taskIds[0]);
    task.status = state;
    task.dismissedReason = "Owner declined";
    assert.throws(() => validateDesk(invalid), /open tasks/);
  }
  for (const mutate of [
    d => d.dailyPlan.taskIds.push(d.dailyPlan.taskIds[0]),
    d => d.dailyPlan.taskIds[0] = "missing-task",
    d => d.dailyPlan.date = "2026-11-11",
    d => d.tasks.find(t => t.id === d.dailyPlan.taskIds[0]).effortMinutes.max = -1,
  ]) {
    const invalid = structuredClone(snapshot); mutate(invalid);
    assert.throws(() => validateDesk(invalid), /daily|open tasks/);
  }
});

test("waiting and backburner work cannot leak onto the priority board", () => {
  for (const lane of ['waiting', 'backburner']) {
    const broken = structuredClone(snapshot);
    const task = broken.tasks.find(t => t.id === broken.dailyPlan.taskIds[0]);
    task.lane = lane;
    assert.throws(() => validateDesk(broken), /daily picks must be active/);
    assert.throws(() => dailyTasks(broken.tasks, broken.dailyPlan), /open and active/);
  }
  const lanes = taskLanes(snapshot.tasks, snapshot.dailyPlan);
  const remaining = snapshot.tasks.filter(t => t.status === 'open' && !snapshot.dailyPlan.taskIds.includes(t.id));
  assert.equal(Object.values(lanes).flat().length, remaining.length);
  for (const [lane, tasks] of Object.entries(lanes)) assert.ok(tasks.every(t => t.lane === lane));
  const broken = structuredClone(snapshot); delete broken.tasks.find(t => t.status === 'open').lane;
  assert.throws(() => validateDesk(broken), /explicit lane/);
  assert.throws(() => taskLanes(broken.tasks, broken.dailyPlan), /Invalid task lane/);
});

test("telemetry imports only aggregates and rejects missing or invalid observations", () => {
  const payload = { schemaVersion: 5, windowDays: 1, generatedAt: "2026-11-12T23:14:29.706Z", totals: { players: 62, sessions: 164, crashes: 0 }, mapIntegrityIssues: [{ reports: 39, privateContext: "never publish" }, { reports: 5 }], rawFeedback: "never publish" };
  const clean = marqueTelemetrySnapshot(payload);
  assert.deepEqual(clean, { observedAt: payload.generatedAt, windowDays: 1, installations: 62, sessions: 164, crashReports: 0, chartWarnings: 44 });
  for (const change of [{ schemaVersion: 6 }, { windowDays: 7 }, { generatedAt: "invalid" }, { totals: { players: 62, sessions: 164 } }, { mapIntegrityIssues: [{ reports: -1 }] }]) assert.throws(() => marqueTelemetrySnapshot({ ...payload, ...change }));
});

test("KDP charts reject mismatched units, currencies and historical benchmarks", () => {
  assert.equal(validateKdpReport(structuredClone(kdpSnapshot)).schemaVersion,1);
  for(const mutate of [r=>r.totalUnits++,r=>r.currencyTotals[0].amountCents++,r=>r.currencyTotals.pop(),r=>r.benchmark.maxMonthlyCents++,r=>r.months.reverse(),r=>r.catalogue.liveWorks=r.catalogue.totalWorks+1]){
    const broken=structuredClone(kdpSnapshot);mutate(broken);
    assert.throws(()=>validateKdpReport(broken),/KDP report:/);
  }
});

test("decision board requires one next gate and qualitative evidence within its scale", () => {
  const noGate=structuredClone(snapshot);noGate.opportunities[0].milestones.forEach(step=>{step.state='done';});
  assert.throws(()=>validateDesk(noGate),/one next gate/);
  const probability=structuredClone(snapshot);probability.opportunities[0].demand.level=75;
  assert.throws(()=>validateDesk(probability),/qualitative evidence/);
});

test("first-week scenarios deduct launch discount before the Steam share", () => {
  assert.deepEqual(calculateRevenueScenario(defaultRevenueScenario), { copies: 3000, grossCents: 4497000, discountedGrossCents: 3822450, afterSteamCents: 2675715 });
  assert.equal(formatMoney(2675715), "US$26,757.15");
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, launchDiscountPercent: 0 }).afterSteamCents, 3147900);
  assert.deepEqual(compareRevenueScenarios(defaultRevenueScenario).map(({ copies, afterSteamCents }) => [copies, afterSteamCents]), [[1500, 1337858], [2250, 2006787], [3000, 2675715]]);
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, launchWishlists: 5500 }).copies, 1100);
});

test("total-sales ratios allow organic buyers and round copies before currency", () => {
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, launchWishlists: 100, salesPerWishlist: 1.5 }).copies, 150);
  assert.deepEqual(calculateRevenueScenario({ ...defaultRevenueScenario, launchWishlists: 13, salesPerWishlist: .20, priceUsd: .29, launchDiscountPercent: 0 }), { copies: 3, grossCents: 87, discountedGrossCents: 87, afterSteamCents: 61 });
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, launchWishlists: 0 }).afterSteamCents, 0);
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, steamSharePercent: 100 }).afterSteamCents, 0);
  assert.equal(calculateRevenueScenario({ ...defaultRevenueScenario, launchDiscountPercent: 100 }).afterSteamCents, 0);
  assert.deepEqual(compareRevenueScenarios({ ...defaultRevenueScenario, salesPerWishlist: .18, launchDiscountPercent: 100 }).map(r => r.afterSteamCents), [0, 0, 0]);
});

test("invalid financial assumptions fail instead of showing plausible results", () => {
  for (const change of [{ launchWishlists: -1 }, { launchWishlists: 1.5 }, { salesPerWishlist: NaN }, { salesPerWishlist: -1 }, { priceUsd: Infinity }, { priceUsd: 14.999 }, { steamSharePercent: 101 }, { launchDiscountPercent: -1 }, { launchDiscountPercent: 101 }, { launchDiscountPercent: NaN }, { launchDiscountPercent: undefined }, { launchWishlists: Number.MAX_SAFE_INTEGER }]) {
    assert.throws(() => calculateRevenueScenario({ ...defaultRevenueScenario, ...change }), RangeError);
  }
});

const earningsReport = { amountCents: 1912, currency: "CAD", periodStart: "2026-11-01", periodEnd: "2026-11-12", basis: "estimated", observedAt: "2026-11-12T20:40:34Z", source: "Test royalty report" };
const revenueStream = (id, report) => ({ id, label: id, projectId: null, note: "Test source", report });

test("revenue distinguishes unreported sources from measured zero and refunds", () => {
  assert.deepEqual(summarizeRevenue([revenueStream("missing", null)]), { totals: [], reported: 0, missing: 1 });
  const result = summarizeRevenue([revenueStream("kdp", earningsReport), revenueStream("zero", { ...earningsReport, amountCents: 0 }), revenueStream("refund", { ...earningsReport, amountCents: -100 }), revenueStream("missing", null)]);
  assert.equal(result.totals[0].amountCents, 1812);
  assert.equal(result.reported, 3);
  assert.equal(result.missing, 1);
  assert.equal(formatMoney(-100, "CAD"), "-$1");
});

test("revenue never adds incompatible currencies, periods or reporting bases", () => {
  const result = summarizeRevenue([
    revenueStream("kdp", earningsReport),
    revenueStream("usd", { ...earningsReport, currency: "USD" }),
    revenueStream("earlier", { ...earningsReport, periodEnd: "2026-11-11" }),
    revenueStream("final", { ...earningsReport, basis: "finalized" }),
  ]);
  assert.equal(result.totals.length, 4);
  assert.ok(result.totals.every((total) => total.amountCents === 1912));
});

test("incomplete or invalid revenue evidence fails before publication", () => {
  for (const change of [{ amountCents: 1.1 }, { currency: undefined }, { currency: "XXX" }, { currency: "JPY" }, { periodEnd: "2026-02-30" }, { periodStart: "2026-11-13" }, { basis: "cash" }, { observedAt: "2026-11-11T20:00:00Z" }, { source: "" }]) {
    assert.throws(() => summarizeRevenue([revenueStream("kdp", { ...earningsReport, ...change })]));
  }
  assert.throws(() => summarizeRevenue([revenueStream("kdp", undefined)]), /explicitly unreported/);
  assert.throws(() => summarizeRevenue([revenueStream("same", earningsReport), revenueStream("same", earningsReport)]), /duplicate/);
  assert.throws(() => summarizeRevenue([revenueStream("large", { ...earningsReport, amountCents: Number.MAX_SAFE_INTEGER }), revenueStream("extra", earningsReport)]), /safe numeric/);
  const broken = structuredClone(snapshot);
  broken.revenue[0].projectId = "missing-project";
  assert.throws(() => validateDesk(broken), /unknown revenue project/);
});

test("published glossary output excludes empty reviews and intermediate extractions", () => {
  const status = { published: true, preview: false, generatedAt: "2026-11-07T02:31:38.080Z", people: 72, extractedChapters: 2050, publication: { publishedPeople: 72, publishedNonemptyChapters: 1, publishedChapters: 16, sourceChapters: 4099 } };
  const metric = publishedGlossaryMetric(status);
  assert.equal(metric.value, 72);
  assert.equal(metric.note, "1 nonempty chapter published.");
  assert.equal(metric.observedAt, status.generatedAt);
  assert.equal(metric.total, null);
  assert.throws(() => publishedGlossaryMetric({ ...status, preview: true }), /unavailable/);
  assert.throws(() => publishedGlossaryMetric({ ...status, people: 73 }), /disagree/);
  assert.throws(() => publishedGlossaryMetric({ ...status, publication: { ...status.publication, publishedNonemptyChapters: undefined } }), /Invalid published/);
});

test("dates reject impossible days and remain calendar-based through daylight saving", () => {
  assert.throws(() => parseDate("2026-02-29"));
  assert.throws(() => parseDate("2026-13-01"));
  assert.throws(() => parseDate("November 18"));
  assert.equal(daysBetween("2026-10-31", "2026-11-02"), 2);
  assert.equal(daysBetween("2026-11-18", "2026-11-12"), -6);
});

test("today and stale state use actual observation times", () => {
  assert.equal(localDate(new Date("2026-11-13T07:59:00Z")), "2026-11-12");
  assert.equal(localDate(new Date("2026-11-13T08:01:00Z")), "2026-11-13");
  assert.equal(isStale("2026-11-12T17:00:00Z", new Date("2026-11-13T17:00:00Z")), false);
  assert.equal(isStale("2026-11-07T17:00:00Z", new Date("2026-11-13T17:00:00Z")), true);
  assert.throws(() => isStale("not-a-time"), /Invalid freshness/);
});

test("calendar handles leap years and month rollover with Monday first", () => {
  const leap = monthCells(2028, 1);
  assert.equal(leap.filter(Boolean).length, 29);
  assert.equal(monthCells(2026, 10)[6], "2026-11-01");
  assert.equal(monthCells(2026, 12).filter(Boolean)[0], "2027-01-01");
});

test("calendar export escapes text, folds UTF-8 lines and distinguishes planned dates", () => {
  const feed = calendarFeed([{ id: "review", date: "2026-12-31", title: "Review, launch; then\\plan\n" + "界".repeat(70), note: "One\rTwo", kind: "planned", sourceUrl: null }], "2026-11-12T17:00:00Z");
  assert.match(feed, /DTEND;VALUE=DATE:20270101/);
  assert.match(feed, /STATUS:TENTATIVE/);
  assert.match(feed, /SUMMARY:Review\\, launch\\; then\\\\plan\\n/);
  assert.ok(feed.split("\r\n").every((line) => Buffer.byteLength(line) <= 75));
  assert.match(feed, /DESCRIPTION:One\\nTwo/);
});

test("invalid references and misleading progress fail before publication", () => {
  assert.equal(validateDesk(structuredClone(snapshot)).schemaVersion, 1);
  const badProject = structuredClone(snapshot);
  badProject.tasks[0].projectId = "missing-project";
  assert.throws(() => validateDesk(badProject), /unknown project/);
  const badMetric = structuredClone(snapshot);
  badMetric.metrics[0].total = 0;
  assert.throws(() => validateDesk(badMetric), /denominator/);
});
