export const marqueTelemetryUrl = "https://dashboard.marque-and-reprisal.com/api/dashboard?days=1";

/** Publish selected aggregates only; raw incidents and player context stay outside this repo. */
export function marqueTelemetrySnapshot(payload) {
  if (payload.schemaVersion !== 5 || payload.windowDays !== 1 || !Number.isFinite(Date.parse(payload.generatedAt)) || !Array.isArray(payload.mapIntegrityIssues)) throw new Error("M&R telemetry schema or reporting window changed");
  const snapshot = {
    observedAt: payload.generatedAt,
    windowDays: payload.windowDays,
    installations: payload.totals?.players,
    sessions: payload.totals?.sessions,
    crashReports: payload.totals?.crashes,
    chartWarnings: payload.mapIntegrityIssues.reduce((sum, issue) => {
      if (!Number.isSafeInteger(issue.reports) || issue.reports < 0) throw new Error("Invalid chart warning count");
      return sum + issue.reports;
    }, 0),
  };
  return validateTelemetry(snapshot);
}

export function validateTelemetry(snapshot) {
  if (!snapshot || snapshot.windowDays !== 1 || typeof snapshot.observedAt !== "string" || !Number.isFinite(Date.parse(snapshot.observedAt))) throw new Error("Invalid telemetry observation");
  if (Object.keys(snapshot).some(key => !["observedAt", "windowDays", "installations", "sessions", "crashReports", "chartWarnings"].includes(key))) throw new Error("Telemetry contains fields outside the public aggregate allowlist");
  for (const key of ["installations", "sessions", "crashReports", "chartWarnings"]) {
    if (!Number.isSafeInteger(snapshot[key]) || snapshot[key] < 0) throw new Error(`Invalid telemetry aggregate: ${key}`);
  }
  return snapshot;
}
