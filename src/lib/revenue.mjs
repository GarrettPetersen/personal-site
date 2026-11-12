import { parseDate } from "./dates.mjs";

/** @typedef {{launchWishlists: number, salesPerWishlist: number, priceUsd: number, launchDiscountPercent: number, steamSharePercent: number}} RevenueAssumptions */

/** Illustrative first-week assumptions, never an observed Steam KPI. @type {Readonly<RevenueAssumptions>} */
export const defaultRevenueScenario = Object.freeze({
  launchWishlists: 15_000,
  salesPerWishlist: 0.20,
  priceUsd: 14.99,
  launchDiscountPercent: 10,
  steamSharePercent: 30,
});

/** @param {RevenueAssumptions} assumptions */
export function calculateRevenueScenario(assumptions) {
  const { launchWishlists, salesPerWishlist, priceUsd, launchDiscountPercent, steamSharePercent } = assumptions;
  if (!Number.isSafeInteger(launchWishlists) || launchWishlists < 0) throw new RangeError("Launch wishlists must be a nonnegative whole number within the calculator’s numeric range.");
  if (!Number.isFinite(salesPerWishlist) || salesPerWishlist < 0) throw new RangeError("The total-sales/wishlist ratio must be a nonnegative number.");
  if (!Number.isFinite(priceUsd) || priceUsd < 0) throw new RangeError("List price must be a nonnegative US dollar amount.");
  if (!Number.isFinite(steamSharePercent) || steamSharePercent < 0 || steamSharePercent > 100) throw new RangeError("Steam share must be between 0% and 100%.");
  if (!Number.isFinite(launchDiscountPercent) || launchDiscountPercent < 0 || launchDiscountPercent > 100) throw new RangeError("Launch discount must be between 0% and 100%.");
  const priceCents = Math.round(priceUsd * 100);
  if (!Number.isSafeInteger(priceCents) || Math.abs(priceUsd * 100 - priceCents) > 0.000001) throw new RangeError("List price must have at most two decimal places within the calculator’s numeric range.");

  // Total sales already include non-wishlist buyers; do not add an organic uplift.
  const copies = Math.round(launchWishlists * salesPerWishlist);
  const grossCents = copies * priceCents;
  if (!Number.isSafeInteger(copies) || !Number.isSafeInteger(grossCents)) throw new RangeError("Scenario values are too large to calculate safely.");
  const discountedGrossCents = Math.round(grossCents * (1 - launchDiscountPercent / 100));
  const afterSteamCents = Math.round(discountedGrossCents * (1 - steamSharePercent / 100));
  return { copies, grossCents, discountedGrossCents, afterSteamCents };
}

/** Comparison scenarios are not bounds or confidence intervals. @param {RevenueAssumptions} assumptions */
export function compareRevenueScenarios(assumptions) {
  return [0.10, 0.15, 0.20].map((salesPerWishlist) => ({ salesPerWishlist, ...calculateRevenueScenario({ ...assumptions, salesPerWishlist }) }));
}

/** Signed earnings allow refunds and adjustments. @param {number} cents @param {string} [currency] */
export function formatMoney(cents, currency = "USD") {
  if (!Number.isSafeInteger(cents)) throw new RangeError("Money must be a safe whole number of cents.");
  if (!Intl.supportedValuesOf("currency").includes(currency)) throw new RangeError("Money needs a recognized currency code.");
  const formatter = new Intl.NumberFormat("en-CA", { style: "currency", currency });
  if (formatter.resolvedOptions().maximumFractionDigits !== 2) throw new RangeError("This ledger supports currencies with two decimal places.");
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100);
}

/** @typedef {{amountCents:number, currency:string, periodStart:string, periodEnd:string, basis:string, observedAt:string, source:string}} EarningsReport */
/** @typedef {{id:string, label:string, projectId:string|null, note:string, report:EarningsReport|null}} RevenueStream */

/** Never combine different periods, currencies or estimate/final bases. @param {RevenueStream[]} streams */
export function summarizeRevenue(streams) {
  if (!Array.isArray(streams) || streams.length === 0) throw new Error("Revenue needs at least one tracked source.");
  const ids = new Set();
  const totals = new Map();
  let reported = 0;
  for (const stream of streams) {
    if (typeof stream.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stream.id) || ids.has(stream.id) || !stream.label?.trim() || !stream.note?.trim()) throw new Error("Invalid or duplicate revenue source.");
    ids.add(stream.id);
    if (stream.report === null) continue;
    const report = stream.report;
    if (!report) throw new Error("Missing revenue must be explicitly unreported.");
    if (typeof report.currency !== "string") throw new Error("Revenue needs its source currency.");
    formatMoney(report.amountCents, report.currency);
    for (const date of [report.periodStart, report.periodEnd]) parseDate(date);
    if (report.periodStart > report.periodEnd || !["estimated", "finalized"].includes(report.basis) || !/T.*Z$/.test(report.observedAt) || !Number.isFinite(Date.parse(report.observedAt)) || report.observedAt.slice(0, 10) < report.periodEnd || !report.source?.trim()) throw new Error("Revenue needs a valid period, basis, source and observation time.");
    const key = [report.currency, report.periodStart, report.periodEnd, report.basis].join("|");
    const total = totals.get(key) ?? { currency: report.currency, periodStart: report.periodStart, periodEnd: report.periodEnd, basis: report.basis, amountCents: 0, sources: 0 };
    total.amountCents += report.amountCents;
    if (!Number.isSafeInteger(total.amountCents)) throw new RangeError("Revenue subtotal exceeds the safe numeric range.");
    total.sources++;
    totals.set(key, total);
    reported++;
  }
  return { totals: [...totals.values()], reported, missing: streams.length - reported };
}
