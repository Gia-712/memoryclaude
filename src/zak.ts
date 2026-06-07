// Client minimale per la WuBook kapi (ZAK).
import { ZAK_BASE } from "./config";

export type ZakReservationRaw = Record<string, any>;

async function zakPost(apiKey: string, path: string, body: unknown): Promise<any> {
  const res = await fetch(`${ZAK_BASE}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`ZAK ${path} HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  return json;
}

export async function fetchReservationsByArrival(
  apiKey: string,
  fromDate: string,
  toDate: string,
): Promise<ZakReservationRaw[]> {
  const json = await zakPost(apiKey, "/reservations/fetch_reservations", {
    filters: {
      arrival: { from: fromDate, to: toDate },
      pager: { limit: 100, offset: 0 },
    },
  });
  return extractList(json);
}

export async function fetchTodayReservations(apiKey: string): Promise<ZakReservationRaw[]> {
  const json = await zakPost(apiKey, "/reservations/fetch_today_reservations", {});
  return extractList(json);
}

function extractList(json: any): ZakReservationRaw[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.reservations)) return json.data.reservations;
  if (Array.isArray(json?.reservations)) return json.reservations;
  if (Array.isArray(json?.results)) return json.results;
  return [];
}

export interface ZakReservation {
  rcode: string;
  guestName?: string;
  arrival?: string;   // YYYY-MM-DD
  departure?: string; // YYYY-MM-DD
  guests?: number;
  roomName?: string;  // id_zak_room_type come stringa; mappato in config.ts
  channel?: string;
  amount?: number;    // euro, quota soggiorno (price.rooms.total)
  arrivalTime?: string;
}

// ZAK manda le date in DD/MM/YYYY; Notion richiede YYYY-MM-DD.
function parseZakDate(d: string | undefined): string | undefined {
  if (!d) return undefined;
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return d;
}

export function normalizeReservation(r: ZakReservationRaw): ZakReservation {
  const firstRoom = Array.isArray(r.rooms) ? r.rooms[0] : null;
  const occ = firstRoom?.occupancy;
  const totalGuests = occ
    ? (occ.adults || 0) + (occ.teens || 0) + (occ.children || 0) + (occ.babies || 0)
    : undefined;

  return {
    rcode: String(r.id_human ?? r.id ?? ""),
    // Il nome ospite non arriva da questo endpoint; va compilato a mano in Notion.
    guestName: undefined,
    arrival: parseZakDate(firstRoom?.dfrom),
    departure: parseZakDate(firstRoom?.dto),
    guests: totalGuests || undefined,
    roomName: firstRoom?.id_zak_room_type != null ? String(firstRoom.id_zak_room_type) : undefined,
    channel: r.origin?.channel,
    amount: r.price?.rooms?.total ?? r.payment?.amount,
    arrivalTime: undefined,
  };
}
