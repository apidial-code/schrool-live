export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type WeeklySlot = { day: number; minute: number };
export type AvailabilityWindow = { day: number; start: number; end: number };
export function validDay(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0,10) === value;
}
export function addDays(value: string, count: number) {
  return new Date(Date.parse(value + "T00:00:00Z") + count * 86400000).toISOString().slice(0,10);
}
const formatters = new Map<string, Intl.DateTimeFormat>();
export function localParts(date: Date, timezone: string) {
  let formatter=formatters.get(timezone);
  if(!formatter) {
    formatter=new Intl.DateTimeFormat("en-GB", {timeZone:timezone,year:"numeric",month:"2-digit",
      day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
    formatters.set(timezone,formatter);
  }
  const parts=formatter.formatToParts(date);
  const part = (key: string) => parts.find(p => p.type === key)!.value;
  const day = part("year")+"-"+part("month")+"-"+part("day");
  return { date: day, day: new Date(day+"T00:00:00Z").getUTCDay(), minute: Number(part("hour"))*60+Number(part("minute")) };
}
// Resolve wall-clock time by possible zone offsets, rejecting both missing and
// ambiguous daylight-saving times instead of silently moving a family's booking.
export function wallTime(date: string, minute: number, timezone: string) {
  if (!validDay(date) || !Number.isInteger(minute) || minute < 0 || minute >= 1440) throw new Error("Invalid local session time.");
  const wall = Date.parse(date+"T00:00:00Z")+minute*60000;
  const offsets = new Set<number>();
  for (const hours of [-36, -12, 0, 12, 36]) {
    const instant = wall+hours*3600000;
    const local = localParts(new Date(instant),timezone);
    offsets.add(Date.parse(local.date+"T00:00:00Z")+local.minute*60000-instant);
  }
  const candidates = [...offsets].map(offset => new Date(wall-offset)).filter(instant => {
    const local=localParts(instant,timezone);
    return local.date === date && local.minute === minute;
  });
  if(candidates.length !== 1) throw new Error("This time is missing or ambiguous because clocks change. Choose another time.");
  return candidates[0];
}
export function buildTeachingSchedule(weekStart: string, timezone: string, slots: WeeklySlot[], lessonIds: number[]) {
  if (!validDay(weekStart) || new Date(weekStart+"T00:00:00Z").getUTCDay() !== 1) throw new Error("Choose a Monday for the first teaching week.");
  if (slots.length !== 2 || slots[0].day === slots[1].day ||
      slots.some(s => !Number.isInteger(s.day) || s.day<0 || s.day>6 || !Number.isInteger(s.minute) || s.minute<0 || s.minute>1380 || s.minute%30 !== 0) ||
      lessonIds.length !== 23 || new Set(lessonIds).size !== 23) throw new Error("Two different weekly days and 23 lessons are required.");
  const sorted = [...slots].sort((a,b)=>(a.day+6)%7-(b.day+6)%7);
  return lessonIds.flatMap((lessonId,week)=>sorted.map((slot,index)=>{
    const date=addDays(weekStart,week*7+(slot.day+6)%7);
    const startsAt=wallTime(date,slot.minute,timezone);
    const endsAt=new Date(startsAt.getTime()+3600000);
    const end=localParts(endsAt,timezone);
    const endMinute=end.date===date?end.minute:end.date===addDays(date,1) && end.minute===0?1440:-1;
    if (endMinute !== slot.minute+60) throw new Error("A session cannot cross a clock change.");
    return { sequence:week*2+index+1,lessonId,startsAt,endsAt };
  }));
}
export function covered(start: Date, end: Date, timezone: string, windows: AvailabilityWindow[]) {
  const a=localParts(start,timezone),b=localParts(end,timezone);
  const endMinute=a.date===b.date?b.minute:b.date===addDays(a.date,1) && b.minute===0?1440:-1;
  return endMinute-a.minute===60 &&
    windows.some(w=>w.day===a.day && w.start<=a.minute && w.end>=endMinute);
}
export function overlaps(a: {startsAt:Date;endsAt:Date}, b: {startsAt:Date;endsAt:Date}) {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}
export function reportReady(startsAt: Date, endsAt: Date, now = Date.now()) {
  return startsAt.getTime() < endsAt.getTime() && endsAt.getTime() <= now;
}
