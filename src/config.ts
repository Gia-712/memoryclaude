// Configurazione del sync ZAK -> Notion PRENOTAZIONI.
// Nessun segreto qui: le credenziali stanno nei secret del Worker.

export const NOTION_DB_ID = "8a4031151e134b79b10a795c936b2c6c";

export const ZAK_BASE = "https://kapi.wubook.net/kp";

// Mappa id_zak_room_type (numerico, come stringa) → nome camera Divo.
// Valori reali confermati dal Planner ZAK (giugno 2026):
//   63470 BLU · 63620 ROSSA · 63621 ORO · 63471 BORGO.
// Fuori mappa (= saltate dal sync): Relais 63466 SuiteVasca / 63469 Suite /
//   63468 Standard B-C, Vatican 88625.
export const ROOM_MAP: Record<string, "BLU" | "ROSSO" | "GIALLO" | "BORGO"> = {
  "63470": "BLU",
  "63620": "ROSSO",
  "63621": "GIALLO", // in ZAK "Oro", all'ospite si dice GIALLO
  "63471": "BORGO",
};

export const GUIDEBOOK_URL: Record<string, string> = {
  BLU:   "https://app.notion.com/p/376321d78ccd8151a6fff2f796902192",
  ROSSO: "https://app.notion.com/p/376321d78ccd81d9bdfdf3a9156d85fb",
  GIALLO:"https://app.notion.com/p/376321d78ccd81dc9422cb4189215e26",
  BORGO: "https://app.notion.com/p/376321d78ccd81ecb9b0daefca44056a",
};

export const CHANNEL_MAP: Array<{ match: string; value: "Airbnb" | "Booking.com" | "Diretto" | "Expedia" }> = [
  { match: "airbnb",  value: "Airbnb" },
  { match: "booking", value: "Booking.com" },
  { match: "expedia", value: "Expedia" },
  { match: "direct",  value: "Diretto" },
  { match: "diret",   value: "Diretto" },
  { match: "web",     value: "Diretto" },
];

export function mapRoom(roomTypeId: string | undefined): "BLU" | "ROSSO" | "GIALLO" | "BORGO" | undefined {
  if (!roomTypeId) return undefined;
  return ROOM_MAP[roomTypeId];
}

export function mapChannel(zakChannel: string | undefined): string | undefined {
  if (!zakChannel) return undefined;
  const n = zakChannel.toLowerCase();
  for (const c of CHANNEL_MAP) if (n.includes(c.match)) return c.value;
  return undefined;
}
