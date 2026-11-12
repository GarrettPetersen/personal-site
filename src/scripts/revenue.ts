import { requiredElement } from "../lib/dom";
import { calculateRevenueScenario, compareRevenueScenarios, defaultRevenueScenario, formatMoney } from "../lib/revenue.mjs";

const form = requiredElement("[data-revenue-form]", HTMLFormElement);
const inputs = {
  launchWishlists: requiredElement('[name="launchWishlists"]', HTMLInputElement, form),
  salesPerWishlist: requiredElement('[name="salesPerWishlist"]', HTMLInputElement, form),
  launchDiscountPercent: requiredElement('[name="launchDiscountPercent"]', HTMLInputElement, form),
  priceUsd: requiredElement('[name="priceUsd"]', HTMLInputElement, form),
  steamSharePercent: requiredElement('[name="steamSharePercent"]', HTMLInputElement, form),
};
const copies = requiredElement("[data-revenue-copies]", HTMLOutputElement, form);
const discounted = requiredElement("[data-revenue-discounted]", HTMLOutputElement, form);
const after = requiredElement("[data-revenue-after]", HTMLOutputElement, form);
const error = requiredElement("[data-revenue-error]", HTMLElement, form);
const reset = requiredElement('button[type="reset"]', HTMLButtonElement, form);
const count = new Intl.NumberFormat("en-CA");

function showError(message: string) {
  for (const output of form.querySelectorAll("output")) output.value = "—";
  error.textContent = message;
  error.hidden = false;
}

function render() {
  for (const input of Object.values(inputs)) input.setAttribute("aria-invalid", String(!input.validity.valid));
  const invalid = Object.values(inputs).find((input) => !input.validity.valid);
  if (invalid) {
    const label = invalid.closest("label");
    if (!label) throw new Error("Scenario input is missing its label");
    const name = requiredElement("span", HTMLElement, label).textContent?.trim();
    if (!name) throw new Error("Scenario input has an empty label");
    showError(`${name}: ${invalid.validationMessage}`);
    return;
  }
  try {
    const assumptions = {
      launchWishlists: inputs.launchWishlists.valueAsNumber,
      salesPerWishlist: inputs.salesPerWishlist.valueAsNumber,
      launchDiscountPercent: inputs.launchDiscountPercent.valueAsNumber,
      priceUsd: inputs.priceUsd.valueAsNumber,
      steamSharePercent: inputs.steamSharePercent.valueAsNumber,
    };
    const result = calculateRevenueScenario(assumptions);
    copies.value = count.format(result.copies);
    discounted.value = formatMoney(result.discountedGrossCents);
    after.value = formatMoney(result.afterSteamCents);
    for (const scenario of compareRevenueScenarios(assumptions)) {
      const row = requiredElement(`[data-revenue-comparison="${scenario.salesPerWishlist}"]`, HTMLTableRowElement, form);
      requiredElement("[data-comparison-copies]", HTMLOutputElement, row).value = count.format(scenario.copies);
      requiredElement("[data-comparison-after]", HTMLOutputElement, row).value = formatMoney(scenario.afterSteamCents);
    }
    error.hidden = true;
    error.textContent = "";
  } catch (cause) {
    if (!(cause instanceof RangeError)) throw cause;
    showError(cause.message);
  }
}

form.addEventListener("input", render);
form.addEventListener("reset", (event) => {
  event.preventDefault();
  for (const key of Object.keys(inputs) as (keyof typeof inputs)[]) inputs[key].value = String(defaultRevenueScenario[key]);
  render();
});
form.addEventListener("submit", (event) => event.preventDefault());
for (const input of Object.values(inputs)) input.disabled = false;
reset.disabled = false;
render();
