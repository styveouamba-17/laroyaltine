import type { APIRoute } from 'astro';
import { slotsFor, isValidDate } from '../../lib/slots';
import { countsFor } from '../../lib/store';

export const prerender = false;

// GET /api/creneaux?date=YYYY-MM-DD&delai=jour|48h -> { slots: [{ time, free }] }
export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date') ?? '';
  const lead = url.searchParams.get('delai') === '48h' ? '48h' : 'jour';
  if (!isValidDate(date)) return Response.json({ error: 'Paramètres invalides' }, { status: 400 });
  const counts = await countsFor(date);
  return Response.json({ slots: slotsFor(date, lead, (t) => counts.get(t) ?? 0) }, { headers: { 'cache-control': 'no-store' } });
};
