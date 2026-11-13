import { daysBetween, formatDate, isStale, localDate, monthCells } from "../lib/desk.mjs";
import { requiredElement } from "../lib/dom";

const calendar = requiredElement("[data-calendar]", HTMLElement);
const grid = requiredElement("[data-calendar-grid]", HTMLElement);
const monthLabel = requiredElement("[data-month-label]", HTMLElement);
const agenda = requiredElement("[data-agenda]", HTMLElement);
const emptyAgenda = requiredElement("[data-agenda-empty]", HTMLElement);
const reset = requiredElement("[data-calendar-reset]", HTMLButtonElement);
const eventData = requiredElement("#desk-calendar-data", HTMLElement).dataset.events;
if (!eventData) throw new Error("Missing calendar events");
type CalendarEvent = { date: string; title: string; kind: string; note: string };
const events: CalendarEvent[] = JSON.parse(eventData);
let year = Number(calendar.dataset.year), month = Number(calendar.dataset.month);
if (!Number.isInteger(year) || !Number.isInteger(month)) throw new Error("Invalid calendar month");

function renderAgenda(date?: string) {
  let visible = 0;
  for (const event of agenda.querySelectorAll<HTMLElement>("[data-event-date]")) {
    if (!event.dataset.eventDate) throw new Error("Calendar event has no date");
    event.hidden = date ? event.dataset.eventDate !== date : event.dataset.eventDate < localDate();
    if (!event.hidden) visible++;
  }
  emptyAgenda.hidden = visible > 0;
  emptyAgenda.textContent = date ? `No events on ${formatDate(date)}.` : "No upcoming dates recorded.";
  reset.hidden = !date;
}

let selectedDate: string | undefined;
function renderMonth() {
  const today = localDate();
  monthLabel.textContent = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month, 1, 12)));
  grid.replaceChildren();
  for (const date of monthCells(year, month)) {
    if (!date) { grid.append(document.createElement("span")); continue; }
    const matches = events.filter((event) => event.date === date);
    const day = document.createElement("button");
    day.type = "button";
    day.className = "desk-day";
    day.textContent = String(Number(date.slice(-2)));
    day.setAttribute("aria-label", `${formatDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${matches.length ? ": " + matches.map((event) => event.title).join(", ") : ": no events"}`);
    day.setAttribute("aria-pressed", String(selectedDate === date));
    if (date === today) { day.classList.add("desk-day--today"); day.setAttribute("aria-current", "date"); }
    if (matches.length) day.classList.add(matches.some((event) => event.kind === "confirmed") ? "desk-day--confirmed" : "desk-day--event");
    day.addEventListener("click", () => { selectedDate = date; renderAgenda(date); renderMonth(); grid.querySelector<HTMLButtonElement>(`[aria-pressed="true"]`)!.focus(); });
    grid.append(day);
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-month-step]")) {
  button.hidden = false;
  button.addEventListener("click", () => {
    const next = new Date(Date.UTC(year, month + Number(button.dataset.monthStep), 1, 12));
    year = next.getUTCFullYear(); month = next.getUTCMonth(); selectedDate = undefined;
    renderMonth(); renderAgenda();
  });
}
reset.addEventListener("click", () => { selectedDate = undefined; renderAgenda(); renderMonth(); });

function refreshDates() {
  const dailyBoard = requiredElement("[data-daily-date]", HTMLElement);
  requiredElement("[data-daily-title]", HTMLElement).textContent = dailyBoard.dataset.dailyDate === localDate() ? "Next priorities" : "Last picks";
  const freshness = requiredElement("[data-reviewed-at]", HTMLElement);
  const reviewedAt = freshness.dataset.reviewedAt;
  if (!reviewedAt) throw new Error("Missing review timestamp");
  const state = requiredElement("[data-check-state]", HTMLElement), stale = isStale(reviewedAt);
  state.textContent = stale ? "Review overdue" : "Reviewed";
  state.classList.toggle("check-state--stale", stale);
  for (const metric of document.querySelectorAll<HTMLElement>("[data-observed-at]")) {
    const label = metric.querySelector<HTMLElement>("[data-metric-stale]");
    if (!metric.dataset.observedAt || !label) throw new Error("Missing metric freshness data");
    label.hidden = !isStale(metric.dataset.observedAt);
  }
  const launch = requiredElement("[data-launch-date]", HTMLElement);
  if (!launch.dataset.launchDate) throw new Error("Missing launch date");
  const days = daysBetween(localDate(), launch.dataset.launchDate), count = requiredElement("[data-launch-count]", HTMLElement), label = document.createElement("span");
  count.replaceChildren(document.createTextNode(days > 0 ? String(days) : days === 0 ? "Today" : "Past date"));
  label.textContent = days > 0 ? "days to launch" : days === 0 ? "Launch day" : "Confirm launch outcome";
  count.append(label);
}

refreshDates(); renderMonth(); renderAgenda();
document.addEventListener("visibilitychange", () => { if (!document.hidden) { refreshDates(); renderMonth(); renderAgenda(selectedDate); } });
