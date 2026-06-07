// Configurazione del sync ZAK -> Notion PRENOTAZIONI.
// Nessun segreto qui: le credenziali stanno nei secret del Worker.

export const NOTION_DB_ID = "8a4031151e134b79b10a795c936b2c6c";

export const ZAK_BASE = "https://kapi.wubook.net/kp";

export type Struttura = "Divo Apartments" | "Relais Colonna" | "Vatican Escape";

export interface UnitInfo {
  struttura: Struttura;
  sistemazione: string; // etichetta leggibile mostrata nella dashboard
  cameraDivo?: "BLU" | "ROSSO" | "GIALLO" | "BORGO"; // valorizzato solo per Divo
}

// Mappa id_zak_room_type (numerico, come stringa) -> struttura + sistemazione.
// Valori reali confermati dal Planner ZAK (giugno 2026).
export const UNIT_MAP: Record<string, UnitInfo> = {
  // Divo Apartments (VivaWallet / Villaggio Turchese)
  "63470": { struttura: "Divo Apartments", sistemazione: "BLU",   cameraDivo: "BLU" },
  "63620": { struttura: "Divo Apartments", sistemazione: "ROSSA", cameraDivo: "ROSSO" },
  "63621": { struttura: "Divo Apartments", sistemazione: "ORO",   cameraDivo: "GIALLO" },
  "63471": { struttura: "Divo Apartments", sistemazione: "BORGO", cameraDivo: "BORGO" },
  // Relais Colonna (Stripe / Roma Centro Relais)
  "63466": { struttura: "Relais Colonna", sistemazione: "Suite Vasca (A)" },
  "63469": { struttura: "Relais Colonna", sistemazione: "Suite (D)" },
  "63468": { struttura: "Relais Colonna", sistemazione: "Standard (B/C)" },
  // Vatican Escape (Stripe / Roma Centro Relais)
  "88625": { struttura: "Vatican Escape", sistemazione: "Vatican Escape" },
};

export const GUIDEBOOK_URL: Record<string, string> = {
  BLU:    "https://app.notion.com/p/376321d78ccd8151a6fff2f796902192",
  ROSSO:  "https://app.notion.com/p/376321d78ccd81d9bdfdf3a9156d85fb",
  GIALLO: "https://app.notion.com/p/376321d78ccd81dc9422cb4189215e26",
  BORGO:  "https://app.notion.com/p/376321d78ccd81ecb9b0daefca44056a",
};

export const CHANNEL_MAP: Array<{ match: string; value: "Airbnb" | "Booking.com" | "Diretto" | "Expedia" }> = [
  { match: "airbnb",  value: "Airbnb" },
  { match: "booking", value: "Booking.com" },
  { match: "expedia", value: "Expedia" },
  { match: "direct",  value: "Diretto" },
  { match: "diret",   value: "Diretto" },
  { match: "web",     value: "Diretto" },
];

export function mapUnit(roomTypeId: string | undefined): UnitInfo | undefined {
  if (!roomTypeId) return undefined;
  return UNIT_MAP[roomTypeId];
}

export function mapChannel(zakChannel: string | undefined): string | undefined {
  if (!zakChannel) return undefined;
  const n = zakChannel.toLowerCase();
  for (const c of CHANNEL_MAP) if (n.includes(c.match)) return c.value;
  return undefined;
}
