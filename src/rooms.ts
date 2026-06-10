// Configurazione delle camere Divo Apartments.
// Il codice della camera viene svelato solo dopo l'orario di check-in (15:00).
// Per aggiungere/aggiornare una camera basta modificare questo file.

export interface Room {
  /** Chiave usata nell'URL, es. /codice?room=blu oppure /blu */
  slug: string;
  /** Nome mostrato all'ospite */
  name: string;
  emoji: string;
  /** Codice della porta dell'appartamento. null = non ancora configurato */
  code: string | null;
  /** Codice della porta del piano / ingresso (condiviso nello stabile) */
  floorCode: string;
  /** Indirizzo mostrato in pagina */
  address: string;
  /** Colore tema (CSS): accent forte e sfondo tenue */
  theme: {
    accent: string;
    accentDark: string;
    soft: string;
    text: string;
  };
}

// Telefono aziendale mostrato all'ospite quando arriva prima delle 15:00.
export const CONTACT = {
  // Gianluca + Donatella (telefono aziendale).
  gianluca: "+39 328 619 0889",
  // TODO: sostituire con il numero di Donatella (telefono aziendale).
  donatella: "",
};

// Orario dal quale il codice diventa visibile (ora locale di Roma).
export const CHECKIN_HOUR = 15;
export const TIMEZONE = "Europe/Rome";

const FRATTINA_FLOOR_CODE = "2789";

export const ROOMS: Record<string, Room> = {
  blu: {
    slug: "blu",
    name: "Divo Apartments BLU",
    emoji: "🔵",
    code: "6834",
    floorCode: FRATTINA_FLOOR_CODE,
    address: "Via Frattina 89, 00187 Roma — Scala sinistra, 1° piano",
    theme: {
      accent: "#2563eb",
      accentDark: "#1e3a8a",
      soft: "#eff6ff",
      text: "#1e3a8a",
    },
  },
  rosso: {
    slug: "rosso",
    name: "Divo Apartments ROSSO",
    emoji: "🔴",
    // TODO: inserire il codice reale della camera ROSSO.
    code: null,
    floorCode: FRATTINA_FLOOR_CODE,
    address: "Via Frattina 89, 00187 Roma — Scala sinistra, 1° piano",
    theme: {
      accent: "#dc2626",
      accentDark: "#7f1d1d",
      soft: "#fef2f2",
      text: "#7f1d1d",
    },
  },
  oro: {
    slug: "oro",
    name: "Divo Apartments ORO",
    emoji: "🟡",
    // TODO: inserire il codice reale della camera ORO (in ZAK = GIALLO).
    code: null,
    floorCode: FRATTINA_FLOOR_CODE,
    address: "Via Frattina 89, 00187 Roma — Scala sinistra, 1° piano",
    theme: {
      accent: "#d97706",
      accentDark: "#92400e",
      soft: "#fffbeb",
      text: "#92400e",
    },
  },
};

export function getRoom(slug: string | null): Room | null {
  if (!slug) return null;
  return ROOMS[slug.toLowerCase()] ?? null;
}

/** True se l'ora locale di Roma è >= CHECKIN_HOUR (codice visibile). */
export function isCodeAvailable(now: Date = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  return hour >= CHECKIN_HOUR;
}
