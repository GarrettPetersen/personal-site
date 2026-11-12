/** Select editorial picks from the shared ledger, ordered by importance then effort. */
export function dailyTasks(tasks, plan) {
  return plan.taskIds.map(id => {
    const task = tasks.find(task => task.id === id);
    if (!task || task.status !== "open") throw new Error(`Daily task is not open: ${id}`);
    return task;
  }).sort((a, b) => b.importance - a.importance || b.effortMinutes.max - a.effortMinutes.max);
}

export function formatEffort({ min, max }) {
  const duration = minutes => minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
  return min === max ? duration(min) : `${duration(min)}–${duration(max)}`;
}

export function totalEffort(tasks) {
  return tasks.reduce((sum, task) => ({ min: sum.min + task.effortMinutes.min, max: sum.max + task.effortMinutes.max }), { min: 0, max: 0 });
}
