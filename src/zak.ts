// Client minimale per la WuBook kapi (ZAK).
// Auth: header "x-api-key: wb_...". Endpoint reservations:
//   POST /kp/reservations/fetch_reservations       (lista, con filtri date arrivo + paginazione)
//   POST /kp/reservations/fetch_today_reservations  (arrivi/in casa oggi)
// Doc: https://tdocs.wubook.net/kapi/reservation.html
import { ZAK_BASE } from "./config";

// Forma "grezza" della prenotazione ZAK. I nomi esatti dei campi vanno confermati
// con la rotta /debug; qui usiamo accessi difensivi (vedi normalizeReservation).
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

// Prenotazioni con arrivo in una finestra di date (YYYY-MM-DD).
export async function fetchReservationsByArrival(
  apiKey: string,
  fromDate: string,
  toDate: string,
): Promise<ZakReservationRaw[]> {
  // Il filtro esatto va confermato con la doc/dati reali; passiamo una struttura
  // ragionevole e lasciamo che /debug ci mostri la risposta.
  const json = await zakPost(apiKey, "/reservations/fetch_reservations", {
    filters: {
      arrival: { from: fromDate, to: toDate },
      pager: { limit: 100, offset: 0 },
    },
  });
  return extractList(json);
}

// Arrivi/prenotazioni di oggi.
export async function fetchTodayReservations(apiKey: string): Promise<ZakReservationRaw[]> {
  const json = await zakPost(apiKey, "/reservations/fetch_today_reservations", {});
  return extractList(json);
}

// La kapi di solito incapsula i dati in { data: ... } o { results: [...] }.
// Normalizziamo qui in modo difensivo.
function extractList(json: any): ZakReservationRaw[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.reservations)) return json.data.reservations;
  if (Array.isArray(json?.reservations)) return json.reservations;
  if (Array.isArray(json?.results)) return json.results;
  return [];
}

// Vista normalizzata usata dal sync. Accesso difensivo: i nomi alternativi coprono
// le varianti più comuni della kapi; confermare con /debug e rifinire se serve.
export interface ZakReservation {
  rcode: string;
  guestName?: string;
  arrival?: string; // YYYY-MM-DD
  departure?: string; // YYYY-MM-DD
  guests?: number;
  roomName?: string;
  channel?: string;
  amount?: number; // euro
  arrivalTime?: string;
}

export function normalizeReservation(r: ZakReservationRaw): ZakReservation {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = k.split(".").reduce<any>((o, kk) => (o == null ? o : o[kk]), r);
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };
  const rooms = pick("rooms", "accommodations", "units");
  const firstRoom = Array.isArray(rooms) ? rooms[0] : rooms;

  return {
    rcode: String(pick("rcode", "id", "reservation_code", "code") ?? ""),
    guestName: pick("customer.name", "guest.name", "booker", "customer_name", "name"),
    arrival: pick("arrival", "checkin", "from", "dfrom"),
    departure: pick("departure", "checkout", "to", "dto"),
    guests: Number(pick("guests", "occupancy", "persons", "pax")) || undefined,
    roomName: firstRoom?.name ?? firstRoom?.room_name ?? pick("room_name"),
    channel: pick("channel", "source", "ota", "origin"),
    amount: Number(pick("total", "amount", "price", "total_price")) || undefined,
    arrivalTime: pick("arrival_time", "checkin_time", "eta"),
  };
}
