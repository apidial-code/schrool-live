const dayMs = 86400000;
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function sydneyDate(value: Date | string | number) {
  const parts = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  return ["year", "month", "day"].map(type => parts.find(p => p.type === type)!.value).join("-");
}
const shiftDays = (date: string, days: number) => new Date(Date.parse(date) + days * dayMs).toISOString().slice(0,10);
export function supportWindow(activatedAt: Date | string | null, selectedDate: string, today: string) {
  if (!activatedAt || !validDate(selectedDate) || !validDate(today)) return null;
  const start = sydneyDate(activatedAt);
  const [y,m,d] = start.split("-").map(Number);
  const endMonth = new Date(Date.UTC(y, m-1+3, 1));
  const lastDay = new Date(Date.UTC(endMonth.getUTCFullYear(), endMonth.getUTCMonth()+1, 0)).getUTCDate();
  const end = new Date(Date.UTC(endMonth.getUTCFullYear(), endMonth.getUTCMonth(), Math.min(d,lastDay))).toISOString().slice(0,10);
  const eligible = selectedDate >= start && selectedDate < end && selectedDate <= today;
  const week = selectedDate >= start && selectedDate < end ? Math.floor((Date.parse(selectedDate)-Date.parse(start))/dayMs/7) : null;
  const weekStart = week == null ? null : shiftDays(start, week*7);
  const weekEnd = weekStart ? [shiftDays(weekStart,7),end].sort()[0] : null;
  return { start, end, eligible, week: week == null ? null : week+1, weekStart, weekEnd };
}
