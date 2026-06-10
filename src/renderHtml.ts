import { CHECKIN_HOUR, CONTACT, Room } from "./rooms";

const META = `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />`;

const FONT = `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`;

function whatsappLink(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function shell(room: Room, body: string): string {
  const t = room.theme;
  return `<!DOCTYPE html>
<html lang="it">
  <head>
    ${META}
    <title>${room.emoji} ${room.name} — Codice</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        ${FONT}
        background: linear-gradient(160deg, ${t.soft} 0%, #ffffff 60%);
        color: #111827;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.10);
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.04);
      }
      .head {
        background: linear-gradient(135deg, ${t.accent} 0%, ${t.accentDark} 100%);
        color: #fff;
        padding: 28px 24px;
        text-align: center;
      }
      .head .emoji { font-size: 40px; line-height: 1; }
      .head h1 { margin: 10px 0 0; font-size: 20px; font-weight: 700; }
      .head p { margin: 6px 0 0; opacity: 0.9; font-size: 13px; }
      .body { padding: 24px; }
      .code-box {
        text-align: center;
        background: ${t.soft};
        border: 2px dashed ${t.accent};
        border-radius: 18px;
        padding: 22px 16px;
        margin-bottom: 14px;
      }
      .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${t.text}; font-weight: 600; }
      .code-value { font-size: 44px; font-weight: 800; letter-spacing: 6px; color: ${t.accentDark}; margin-top: 6px; }
      .row { display: flex; gap: 12px; }
      .row .code-box { flex: 1; }
      .row .code-value { font-size: 34px; letter-spacing: 4px; }
      .wait {
        text-align: center;
        background: ${t.soft};
        border-radius: 18px;
        padding: 26px 18px;
        margin-bottom: 16px;
      }
      .wait .clock { font-size: 44px; }
      .wait h2 { margin: 10px 0 4px; font-size: 18px; color: ${t.accentDark}; }
      .wait p { margin: 0; font-size: 14px; color: #4b5563; }
      .meta { font-size: 13px; color: #6b7280; text-align: center; margin: 4px 0 18px; line-height: 1.5; }
      .btn {
        display: block;
        text-align: center;
        text-decoration: none;
        padding: 15px 18px;
        border-radius: 14px;
        font-weight: 700;
        font-size: 15px;
        margin-top: 10px;
      }
      .btn-primary { background: ${t.accent}; color: #fff; }
      .btn-wa { background: #25D366; color: #fff; }
      .btn-ghost { background: #f3f4f6; color: #111827; }
      .foot { text-align: center; font-size: 12px; color: #9ca3af; padding: 0 24px 22px; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="head">
        <div class="emoji">${room.emoji}</div>
        <h1>${room.name}</h1>
        <p>${room.address}</p>
      </div>
      <div class="body">
        ${body}
      </div>
      <div class="foot">Divo Apartments • Roma</div>
    </div>
  </body>
</html>`;
}

/** Pagina mostrata quando il codice è disponibile (dopo le 15:00). */
export function renderCodeAvailable(room: Room): string {
  const body = `
    <div class="row">
      <div class="code-box">
        <div class="code-label">Porta ingresso</div>
        <div class="code-value">${room.floorCode}</div>
      </div>
      <div class="code-box">
        <div class="code-label">${room.emoji} Appartamento</div>
        <div class="code-value">${room.code}</div>
      </div>
    </div>
    <p class="meta">Digita prima il codice della porta d'ingresso, poi quello dell'appartamento.<br>Buon soggiorno! ✨</p>
    <a class="btn btn-wa" href="${whatsappLink(CONTACT.gianluca)}">💬 Scrivici su WhatsApp</a>
  `;
  return shell(room, body);
}

/** Pagina mostrata prima delle 15:00: codice non ancora disponibile. */
export function renderCodeNotYet(room: Room): string {
  const phone = CONTACT.donatella || CONTACT.gianluca;
  const body = `
    <div class="wait">
      <div class="clock">⏰</div>
      <h2>Codice disponibile dalle ${CHECKIN_HOUR}:00</h2>
      <p>Il check-in è dalle ${CHECKIN_HOUR}:00. Torna su questa pagina dopo quell'ora e il tuo codice apparirà qui.</p>
    </div>
    <p class="meta">Arrivi prima e hai bisogno di noi? Siamo a un messaggio di distanza.</p>
    <a class="btn btn-wa" href="${whatsappLink(phone)}">💬 Scrivici su WhatsApp</a>
    <a class="btn btn-ghost" href="tel:${phone.replace(/\s/g, "")}">📞 Chiamaci</a>
  `;
  return shell(room, body);
}

/** Camera esistente ma codice non ancora configurato nel sistema. */
export function renderCodeMissing(room: Room): string {
  const phone = CONTACT.donatella || CONTACT.gianluca;
  const body = `
    <div class="wait">
      <div class="clock">🔑</div>
      <h2>Ci siamo quasi</h2>
      <p>Contattaci e ti inviamo subito il codice del tuo appartamento.</p>
    </div>
    <a class="btn btn-wa" href="${whatsappLink(phone)}">💬 Scrivici su WhatsApp</a>
    <a class="btn btn-ghost" href="tel:${phone.replace(/\s/g, "")}">📞 Chiamaci</a>
  `;
  return shell(room, body);
}

/** Landing quando manca/è errato il parametro room. */
export function renderNotFound(): string {
  return `<!DOCTYPE html>
<html lang="it">
  <head>
    ${META}
    <title>Divo Apartments</title>
    <style>
      body { margin:0; ${FONT} background:#f9fafb; color:#111827; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; text-align:center; }
      .box { max-width: 360px; }
      h1 { font-size: 20px; }
      p { color:#6b7280; }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>🏠 Divo Apartments</h1>
      <p>Apri il link che ti abbiamo inviato per la tua camera per vedere il codice d'accesso.</p>
    </div>
  </body>
</html>`;
}
