import type { APIRoute } from 'astro';
import { ordering, productById } from '../../lib/royaltine';
import { slotsFor, isValidDate } from '../../lib/slots';
import { addOrder, countsFor, storageReady, type Line } from '../../lib/store';

export const prerender = false;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const FULL = 'Ce créneau vient d’être complet. Choisissez une autre heure.';

// POST /api/commande { items: [{ id, qty }], date, time, name, phone, note? }
// Prices and lead times are taken from the catalogue on the server, never from the browser.
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (clean(body.website, 100)) return Response.json({ error: 'Requête refusée.' }, { status: 400 });
  if (!storageReady()) {
    console.error('Order refused: no Redis configured (KV_REST_API_URL / KV_REST_API_TOKEN).');
    return Response.json({ error: 'La commande en ligne est momentanément indisponible. Appelez-nous pour commander.' }, { status: 503 });
  }

  const lines: Line[] = [];
  let needs48h = false;
  for (const raw of Array.isArray(body.items) ? body.items.slice(0, 40) : []) {
    const p = productById.get(clean((raw as { id?: unknown })?.id, 60));
    const qty = Number((raw as { qty?: unknown })?.qty);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > ordering.maxQty) continue;
    if (p.lead === '48h') needs48h = true;
    const same = lines.find((l) => l.id === p.id);
    if (same) same.qty = Math.min(same.qty + qty, ordering.maxQty);
    else lines.push({ id: p.id, name: p.name, unit: p.unit, price: p.price, qty });
  }

  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 30);
  const note = clean(body.note, 300);

  const errors: Record<string, string> = {};
  if (!lines.length) errors.items = 'Votre panier est vide.';
  if (!isValidDate(date)) errors.time = 'Choisissez un jour de retrait.';
  else if (!/^\d{2}:\d{2}$/.test(time)) errors.time = 'Choisissez une heure de retrait.';
  if (name.length < 2) errors.name = 'Indiquez votre nom.';
  if (phone.replace(/\D/g, '').length < 9) errors.phone = 'Indiquez un numéro joignable.';
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  const counts = await countsFor(date);
  const slot = slotsFor(date, needs48h ? '48h' : 'jour', (t) => counts.get(t) ?? 0).find((s) => s.time === time);
  if (!slot) return Response.json({ error: 'Cette heure n’est plus disponible pour ce panier. Choisissez-en une autre.', code: 'slot' }, { status: 409 });
  if (slot.free < 1) return Response.json({ error: FULL, code: 'full' }, { status: 409 });

  const total = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const o = await addOrder({ date, time, lines, total, name, phone, note: note || undefined });
  if (!o) return Response.json({ error: FULL, code: 'full' }, { status: 409 });

  return Response.json({ ref: o.ref, total, date, time }, { status: 201 });
};
