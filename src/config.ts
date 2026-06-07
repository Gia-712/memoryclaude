// Configurazione del sync ZAK (WuBook kapi) -> Notion PRENOTAZIONI.
// NB: nessun segreto qui dentro. Le credenziali stanno nei secret del Worker:
//   - ZAK_API_KEY   (wrangler secret put ZAK_API_KEY)   -> chiave kapi "wb_..."
//   - NOTION_TOKEN  (wrangler secret put NOTION_TOKEN)  -> token integrazione interna Notion
// e nelle vars (wrangler.json): NOTION_DB_ID.

// Database Notion 📅 PRENOTAZIONI (data source / database id).
export const NOTION_DB_ID = "8a4031151e134b79b10a795c936b2c6c";

// Endpoint kapi WuBook.
export const ZAK_BASE = "https://kapi.wubook.net/kp";

// Mappa camera ZAK -> opzione "Camera Divo" in Notion.
// I nomi a sinistra sono i nomi unità come registrati in ZAK (vedi pagina struttura Divo).
// Verifica/aggiorna con la rotta /debug una volta visti i dati reali.
export const ROOM_MAP: Record<string, "BLU" | "ROSSO" | "GIALLO" | "BORGO"> = {
  "Frattina - Suite Blu": "BLU",
  "Frattina - Suite Rossa": "ROSSO",
  "Frattina - Suite Oro": "GIALLO", // in ZAK è "Oro", all'ospite si dice GIALLO
  "Borgo": "BORGO", // TODO: confermare il nome esatto dell'unità Borgo in ZAK
  "Borgognona": "BORGO",
};

// Link guidebook Notion per camera (mostrato nella scheda).
export const GUIDEBOOK_URL: Record<string, string> = {
  BLU: "https://app.notion.com/p/376321d78ccd8151a6fff2f796902192",
  ROSSO: "https://app.notion.com/p/376321d78ccd81d9bdfdf3a9156d85fb",
  GIALLO: "https://app.notion.com/p/376321d78ccd81dc9422cb4189215e26",
  BORGO: "https://app.notion.com/p/376321d78ccd81ecb9b0daefca44056a",
};

// Mappa canale/OTA ZAK -> opzione "Piattaforma" in Notion.
// Le chiavi vanno confrontate in modo case-insensitive / contains (vedi mapChannel).
export const CHANNEL_MAP: Array<{ match: string; value: "Airbnb" | "Booking.com" | "Diretto" | "Expedia" }> = [
  { match: "airbnb", value: "Airbnb" },
  { match: "booking", value: "Booking.com" },
  { match: "expedia", value: "Expedia" },
  { match: "direct", value: "Diretto" },
  { match: "diret", value: "Diretto" },
  { match: "web", value: "Diretto" },
];

export function mapRoom(zakRoomName: string | undefined): string | undefined {
  if (!zakRoomName) return undefined;
  if (ROOM_MAP[zakRoomName]) return ROOM_MAP[zakRoomName];
  // fallback: match parziale per colore
  const n = zakRoomName.toLowerCase();
  if (n.includes("blu")) return "BLU";
  if (n.includes("ross")) return "ROSSO";
  if (n.includes("oro") || n.includes("giall")) return "GIALLO";
  if (n.includes("borgo")) return "BORGO";
  return undefined;
}

export function mapChannel(zakChannel: string | undefined): string | undefined {
  if (!zakChannel) return undefined;
  const n = zakChannel.toLowerCase();
  for (const c of CHANNEL_MAP) if (n.includes(c.match)) return c.value;
  return undefined;
}
