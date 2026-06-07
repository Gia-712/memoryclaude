// Orchestrazione del sync: legge ZAK e fa upsert in Notion (solo prenotazioni Divo).
import { NOTION_DB_ID, mapRoom } from "./config";
import { fetchReservationsByArrival, fetchTodayReservations, normalizeReservation } from "./zak";
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

  // Solo Divo (BLU/ROSSO/GIALLO/BORGO): Relais e Vatican vengono saltate.
  const divo = all.filter(r => mapRoom(r.roomName) !== undefined);

  const results: UpsertResult[] = [];
  const errors: string[] = [];
  for (const r of divo) {
    try {
      results.push(await upsertReservation(env.NOTION_TOKEN, dbId, r));
    } catch (e: any) {
      errors.push(`${r.rcode}: ${e?.message ?? e}`);
    }
  }
  return { ok: errors.length === 0, total: divo.length, skipped: all.length - divo.length, results, errors };
}
