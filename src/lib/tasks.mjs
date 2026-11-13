/** Select editorial picks from the shared ledger, ordered by importance then effort. */
export function dailyTasks(tasks, plan) {
  return plan.taskIds.map(id => {
    const task = tasks.find(task => task.id === id);
    if (!task || task.status !== "open" || task.lane !== "active") throw new Error(`Daily task is not open and active: ${id}`);
    return task;
  }).sort((a, b) => b.importance - a.importance || b.effortMinutes.max - a.effortMinutes.max);
}

/** Keep waiting and discretionary work out of the actionable queue. */
export function taskLanes(tasks, plan) {
  const lanes = { active: [], waiting: [], backburner: [] };
  const order = { now: 0, next: 1, later: 2 };
  for (const task of tasks) {
    if (task.status !== "open") continue;
    if (!Object.hasOwn(lanes, task.lane)) throw new Error(`Invalid task lane: ${task.id}`);
    if (!plan.taskIds.includes(task.id)) lanes[task.lane].push(task);
  }
  for (const lane of Object.values(lanes)) lane.sort((a, b) => order[a.priority] - order[b.priority]);
  return lanes;
}

export function formatEffort({ min, max }) {
  const duration = minutes => minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
  return min === max ? duration(min) : `${duration(min)}–${duration(max)}`;
}

export function totalEffort(tasks) {
  return tasks.reduce((sum, task) => ({ min: sum.min + task.effortMinutes.min, max: sum.max + task.effortMinutes.max }), { min: 0, max: 0 });
}
