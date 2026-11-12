/** @typedef {{launchWishlists: number, salesRatioPercent: number, priceUsd: number, steamSharePercent: number}} RevenueAssumptions */

/** Illustrative first-week assumptions, never an observed Steam KPI. @type {Readonly<RevenueAssumptions>} */
export const defaultRevenueScenario = Object.freeze({
  launchWishlists: 15_000,
  salesRatioPercent: 20,
  priceUsd: 14.99,
  steamSharePercent: 30,
});

/** @param {RevenueAssumptions} assumptions */
export function calculateRevenueScenario(assumptions) {
  const { launchWishlists, salesRatioPercent, priceUsd, steamSharePercent } = assumptions;
  if (!Number.isSafeInteger(launchWishlists) || launchWishlists < 0) throw new RangeError("Launch wishlists must be a nonnegative whole number within the calculator’s numeric range.");
  if (!Number.isFinite(salesRatioPercent) || salesRatioPercent < 0) throw new RangeError("The sales/wishlist ratio must be a nonnegative number.");
  if (!Number.isFinite(priceUsd) || priceUsd < 0) throw new RangeError("List price must be a nonnegative US dollar amount.");
  if (!Number.isFinite(steamSharePercent) || steamSharePercent < 0 || steamSharePercent > 100) throw new RangeError("Steam share must be between 0% and 100%.");
  const priceCents = Math.round(priceUsd * 100);
  if (!Number.isSafeInteger(priceCents) || Math.abs(priceUsd * 100 - priceCents) > 0.000001) throw new RangeError("List price must have at most two decimal places within the calculator’s numeric range.");

  // Total sales may include non-wishlist buyers, so the ratio may exceed 100%.
  const copies = Math.round(launchWishlists * salesRatioPercent / 100);
  const grossCents = copies * priceCents;
  if (!Number.isSafeInteger(copies) || !Number.isSafeInteger(grossCents)) throw new RangeError("Scenario values are too large to calculate safely.");
  const afterSteamCents = Math.round(grossCents * (1 - steamSharePercent / 100));
  return { copies, grossCents, afterSteamCents };
}

/** @param {number} cents */
export function formatRevenueUsd(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new RangeError("Revenue must be a nonnegative whole number of cents.");
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100);
}
