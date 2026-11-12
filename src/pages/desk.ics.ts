import data from "../data/desk.json";
import { calendarFeed, validateDesk } from "../lib/desk.mjs";

export function GET() {
  validateDesk(data);
  return new Response(calendarFeed(data.events, data.reviewedAt), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="project-desk.ics"' },
  });
}
