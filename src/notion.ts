// Upsert delle prenotazioni nel database Notion 📅 PRENOTAZIONI.
// Usa la REST API pubblica di Notion (Authorization: Bearer NOTION_TOKEN).
// Match per "Codice ZAK": se esiste -> aggiorna solo i campi provenienti da ZAK,
// lasciando intatti i campi gestiti a mano (Modalità Booking, Stato ricevuta, ▶️...).
import { GUIDEBOOK_URL, mapChannel, mapRoom } from "./config";
import type { ZakReservation } from "./zak";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "content-type": "application/json",
  };
}

async function findPageByZakCode(token: string, dbId: string, rcode: string): Promise<string | null> {
  const res = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      filter: { property: "Codice ZAK", rich_text: { equals: rcode } },
      page_size: 1,
    }),
  });
  if (!res.ok) throw new Error(`Notion query HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json<any>();
  return json.results?.[0]?.id ?? null;
}

// Proprietà che derivano da ZAK (sovrascrivibili a ogni sync).
function zakProps(r: ZakReservation) {
  const camera = mapRoom(r.roomName);
  const piattaforma = mapChannel(r.channel);
  const props: Record<string, any> = {
    Nome: { title: [{ text: { content: r.guestName || r.rcode || "Senza nome" } }] },
    "Codice ZAK": { rich_text: [{ text: { content: r.rcode } }] },
  };
  if (r.arrival) props["Check-in"] = { date: { start: r.arrival } };
  if (r.departure) props["Check-out"] = { date: { start: r.departure } };
  if (r.guests) props["N. Ospiti"] = { number: r.guests };
  if (r.arrivalTime) props["Orario Arrivo"] = { rich_text: [{ text: { content: r.arrivalTime } }] };
  if (piattaforma) props["Piattaforma"] = { select: { name: piattaforma } };
  if (camera) {
    props["Camera Divo"] = { select: { name: camera } };
    if (GUIDEBOOK_URL[camera]) props["Guidebook camera"] = { url: GUIDEBOOK_URL[camera] };
  }
  if (typeof r.amount === "number") {
    props["Da Incassare"] = { number: r.amount };
    props["Importo (cents)"] = { number: Math.round(r.amount * 100) };
  }
  return props;
}

// Proprietà impostate SOLO alla creazione (default; non toccate sugli update).
function defaultsOnCreate() {
  return {
    "Stato ricevuta": { select: { name: "Da fare" } },
  };
}

export interface UpsertResult {
  rcode: string;
  action: "created" | "updated";
}

export async function upsertReservation(
  token: string,
  dbId: string,
  r: ZakReservation,
): Promise<UpsertResult> {
  if (!r.rcode) throw new Error("Reservation senza rcode: impossibile fare upsert");
  const existing = await findPageByZakCode(token, dbId, r.rcode);

  if (existing) {
    const res = await fetch(`${NOTION_API}/pages/${existing}`, {
      method: "PATCH",
      headers: headers(token),
      body: JSON.stringify({ properties: zakProps(r) }),
    });
    if (!res.ok) throw new Error(`Notion update HTTP ${res.status}: ${await res.text()}`);
    return { rcode: r.rcode, action: "updated" };
  }

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: { ...zakProps(r), ...defaultsOnCreate() },
    }),
  });
  if (!res.ok) throw new Error(`Notion create HTTP ${res.status}: ${await res.text()}`);
  return { rcode: r.rcode, action: "created" };
}
