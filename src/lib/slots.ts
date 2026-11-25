import { hours, info, ordering, type Lead } from './royaltine';

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Date (YYYY-MM-DD) and minutes since midnight in Dakar. */
export function nowInDakar() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: info.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const dayMs = 86400000;
const dayIndex = (date: string) => Math.round(new Date(date + 'T00:00:00Z').getTime() / dayMs);

export function pickupDates() {
  const start = new Date(nowInDakar().date + 'T00:00:00Z').getTime();
  return Array.from({ length: ordering.daysAhead }, (_, i) => new Date(start + i * dayMs).toISOString().slice(0, 10));
}

/** Minutes of notice before the first pickup, by the slowest item in the cart. */
export const leadMinutes = (lead: Lead) => (lead === '48h' ? 48 * 60 : ordering.counterLeadMinutes);

/** Every pickup slot of a day with its free places; slots inside the notice are left out. */
export function slotsFor(date: string, lead: Lead, countAt: (time: string) => number) {
  if (!isValidDate(date) || !pickupDates().includes(date)) return [];
  const now = nowInDakar();
  const earliest = dayIndex(now.date) * 1440 + now.minutes + leadMinutes(lead);
  const base = dayIndex(date) * 1440;
  const h = hours[new Date(date + 'T00:00:00Z').getUTCDay()];
  const out: { time: string; free: number }[] = [];
  for (let m = toMin(h.open); m <= toMin(h.close) - ordering.slotMinutes; m += ordering.slotMinutes) {
    if (base + m < earliest) continue;
    const time = toTime(m);
    out.push({ time, free: Math.max(ordering.ordersPerSlot - countAt(time), 0) });
  }
  return out;
}
