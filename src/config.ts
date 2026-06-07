// Configurazione del sync ZAK -> Notion PRENOTAZIONI.
export const NOTION_DB_ID = "8a4031151e134b79b10a795c936b2c6c";

export const ZAK_BASE = "https://kapi.wubook.net/kp";

export type Struttura = "Divo Apartments" | "Relais Colonna" | "Vatican Escape";

export interface UnitInfo {
  struttura: Struttura;
  sistemazione: string;
  cameraDivo?: "BLU" | "ROSSO" | "GIALLO" | "BORGO";
  photoUrl?: string;
}

export const UNIT_MAP: Record<string, UnitInfo> = {
  // Divo Apartments (VivaWallet / Villaggio Turchese)
  "63470": { struttura: "Divo Apartments", sistemazione: "BLU",   cameraDivo: "BLU",    photoUrl: "https://divoapartments.com/wp-content/uploads/2019/07/DSC_1832.jpg" },
  "63620": { struttura: "Divo Apartments", sistemazione: "ROSSA", cameraDivo: "ROSSO",  photoUrl: "https://divoapartments.com/wp-content/uploads/2019/07/DSC_1935.jpg" },
  "63621": { struttura: "Divo Apartments", sistemazione: "ORO",   cameraDivo: "GIALLO", photoUrl: "https://divoapartments.com/wp-content/uploads/2019/07/DSC_1986.jpg" },
  "63471": { struttura: "Divo Apartments", sistemazione: "BORGO", cameraDivo: "BORGO",  photoUrl: "https://divoapartments.com/wp-content/uploads/2021/07/divo-apartments-roma_luxury_00006.jpg" },
  // Relais Colonna (Stripe / Roma Centro Relais)
  "63466": { struttura: "Relais Colonna", sistemazione: "Suite Vasca (A)", photoUrl: "https://www.relaiscolonna.it/images/rc/camere/suite-idro.jpg" },
  "63469": { struttura: "Relais Colonna", sistemazione: "Suite (D)",       photoUrl: "https://www.relaiscolonna.it/images/rc/camere/suite.jpg" },
  "63468": { struttura: "Relais Colonna", sistemazione: "Standard (B/C)",  photoUrl: "https://www.relaiscolonna.it/images/rc/camere/matri1_xl.jpg" },
  // Vatican Escape (Stripe / Roma Centro Relais)
  "88625": { struttura: "Vatican Escape", sistemazione: "Vatican Escape", photoUrl: "https://lh3.googleusercontent.com/d/1pgnrCmJIxDrNQZDRf7WaXH-SWvdpfHK3" },
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
