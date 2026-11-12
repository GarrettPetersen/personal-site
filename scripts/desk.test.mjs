import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calendarFeed, daysBetween, isStale, localDate, monthCells, parseDate, validateDesk } from "../src/lib/desk.mjs";

const snapshot = JSON.parse(readFileSync(new URL("../src/data/desk.json", import.meta.url), "utf8"));

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
