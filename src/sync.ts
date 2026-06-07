// Orchestrazione del sync: legge ZAK e fa upsert in Notion (tutte le strutture mappate).
import { NOTION_DB_ID, mapUnit } from "./config";
import { fetchReservationsByArrival, fetchTodayReservations, fetchCustomerName, normalizeReservation } from "./zak";
import { upsertReservation, type UpsertResult } from "./notion";

export interface SyncEnv {
  ZAK_API_KEY: string;
  NOTION_TOKEN: string;
  NOTION_DB_ID?: string;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function runSync(env: SyncEnv, daysAhead = 14): Promise<{
  ok: boolean;
  total: number;
  skipped: number;
  results: UpsertResult[];
  errors: string[];
}> {
  const dbId = env.NOTION_DB_ID || NOTION_DB_ID;
  const today = new Date();
  const to = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const raw = [
    ...(await fetchReservationsByArrival(env.ZAK_API_KEY, ymd(today), ymd(to))),
    ...(await fetchTodayReservations(env.ZAK_API_KEY)),
  ];

  // Dedup per rcode.
  const byCode = new Map<string, ReturnType<typeof normalizeReservation>>();
  for (const r of raw) {
    const n = normalizeReservation(r);
    if (n.rcode) byCode.set(n.rcode, n);
  }

  const all = Array.from(byCode.values());

  // Solo strutture riconosciute (Divo + Relais + Vatican); sconosciute saltate.
  const known = all.filter(r => mapUnit(r.roomTypeId) !== undefined);

  // Fetch nomi ospiti: un'unica chiamata per booker_id univoco (dedup).
  const uniqueBookerIds = [...new Set(known.map(r => r.bookerId).filter((id): id is number => id != null))];
  const nameCache = new Map<number, string>();
  await Promise.all(
    uniqueBookerIds.map(async id => {
      const name = await fetchCustomerName(env.ZAK_API_KEY, id);
      if (name) nameCache.set(id, name);
    }),
  );
  for (const r of known) {
    if (r.bookerId != null && nameCache.has(r.bookerId)) {
      r.guestName = nameCache.get(r.bookerId);
    }
  }

  const results: UpsertResult[] = [];
  const errors: string[] = [];
  for (const r of known) {
    try {
      results.push(await upsertReservation(env.NOTION_TOKEN, dbId, r));
    } catch (e: any) {
      errors.push(`${r.rcode}: ${e?.message ?? e}`);
    }
  }
  return { ok: errors.length === 0, total: known.length, skipped: all.length - known.length, results, errors };
}
