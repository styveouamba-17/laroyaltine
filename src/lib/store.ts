import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ordering } from './royaltine';

// Two backends, same API:
// - Redis (Upstash REST) when KV_REST_API_URL / KV_REST_API_TOKEN (Vercel's Upstash integration)
//   or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set. Used on Vercel.
// - A JSON file in data/ otherwise, for local development (Vercel's disk is temporary).

export type Status = 'nouvelle' | 'prête' | 'retirée' | 'annulée';
export interface Line { id: string; name: string; unit?: string; price: number; qty: number }
export interface Order {
  id: string;
  ref: string;
  date: string;
  time: string;
  lines: Line[];
  total: number;
  name: string;
  phone: string;
  note?: string;
  status: Status;
  createdAt: string;
}
type NewOrder = Omit<Order, 'id' | 'ref' | 'status' | 'createdAt'>;

const env = (k: string) => process.env[k];
const REDIS_URL = env('KV_REST_API_URL') || env('UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = env('KV_REST_API_TOKEN') || env('UPSTASH_REDIS_REST_TOKEN');
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);
export const storageReady = () => useRedis || !process.env.VERCEL;

const make = (input: NewOrder): Order => ({
  ...input,
  id: crypto.randomUUID(),
  ref: 'RY-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
  status: 'nouvelle',
  createdAt: new Date().toISOString(),
});
const capKey = (o: { date: string; time: string }) => `ry:cap:${o.date}:${o.time}`;
const counts = (s: Status) => s !== 'annulée';

// ------------------------------------------------------------------ Redis
const HASH = 'ry:orders';
async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: 'POST',
    headers: { authorization: `Bearer ${REDIS_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result as T;
}
/** Takes one place of the slot atomically; false when the slot is full. */
async function claim(key: string) {
  const n = await redis<number>(['INCR', key]);
  if (n > ordering.ordersPerSlot) {
    await redis(['DECR', key]);
    return false;
  }
  return true;
}

const redisStore = {
  async list(): Promise<Order[]> {
    const flat = (await redis<string[]>(['HGETALL', HASH])) ?? [];
    const out: Order[] = [];
    for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]));
    return out;
  },
  async add(input: NewOrder) {
    const o = make(input);
    if (!(await claim(capKey(o)))) return null;
    await redis(['HSET', HASH, o.id, JSON.stringify(o)]);
    return o;
  },
  async setStatus(id: string, status: Status) {
    const raw = await redis<string | null>(['HGET', HASH, id]);
    if (!raw) return null;
    const o: Order = JSON.parse(raw);
    if (o.status === status) return o;
    if (counts(o.status) && !counts(status)) await redis(['DECR', capKey(o)]);
    else if (!counts(o.status) && counts(status) && !(await claim(capKey(o)))) return null;
    o.status = status;
    await redis(['HSET', HASH, id, JSON.stringify(o)]);
    return o;
  },
};

// ------------------------------------------------------------------- File
const FILE = path.resolve(process.cwd(), 'data', 'commandes.json');
let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>) => {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
};
async function read(): Promise<Order[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}
async function write(list: Order[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE + '.tmp', JSON.stringify(list, null, 2));
  await fs.rename(FILE + '.tmp', FILE);
}
const full = (list: Order[], o: { date: string; time: string; id?: string }) =>
  list.filter((x) => x.id !== o.id && counts(x.status) && x.date === o.date && x.time === o.time).length >= ordering.ordersPerSlot;

const fileStore = {
  list: read,
  add: (input: NewOrder) =>
    serial(async () => {
      const list = await read();
      if (full(list, input)) return null;
      const o = make(input);
      list.push(o);
      await write(list);
      return o;
    }),
  setStatus: (id: string, status: Status) =>
    serial(async () => {
      const list = await read();
      const o = list.find((x) => x.id === id);
      if (!o) return null;
      if (!counts(o.status) && counts(status) && full(list, o)) return null;
      o.status = status;
      await write(list);
      return o;
    }),
};

// -------------------------------------------------------------------- API
function backend() {
  if (useRedis) return redisStore;
  if (process.env.VERCEL) throw new Error('Stockage non configuré : ajoutez Upstash Redis au projet Vercel.');
  return fileStore;
}
export const listOrders = () => backend().list();
export const addOrder = (input: NewOrder) => backend().add(input);
export const setStatus = (id: string, status: Status) => backend().setStatus(id, status);

/** Active orders per pickup time for one date. */
export async function countsFor(date: string) {
  const m = new Map<string, number>();
  if (!storageReady()) return m;
  for (const o of await listOrders()) {
    if (counts(o.status) && o.date === date) m.set(o.time, (m.get(o.time) ?? 0) + 1);
  }
  return m;
}
