# Attivazione sync ZAK → Notion (dashboard PRENOTAZIONI)

Il Worker in `src/` legge le prenotazioni da ZAK (WuBook kapi) e le scrive nel
database Notion **📅 PRENOTAZIONI**. Notion resta l'interfaccia (anche da mobile).

> ⚠️ Il sync gira **solo da Cloudflare deployato**: l'ambiente di sviluppo Claude
> non può raggiungere WuBook (network policy). Niente segreti nel repo.

## 1. Integrazione Notion
1. Vai su https://www.notion.so/my-integrations → **New integration** (interna).
2. Copia il **Internal Integration Token**.
3. Apri il database **📅 PRENOTAZIONI** in Notion → menù `•••` → **Connections** →
   aggiungi l'integrazione appena creata. (Senza questo, il Worker non può scrivere.)

## 2. Secret del Worker
```bash
wrangler secret put ZAK_API_KEY     # la chiave kapi "wb_..." di ZAK/WuBook
wrangler secret put NOTION_TOKEN    # il token dell'integrazione Notion (passo 1)
wrangler secret put SYNC_SECRET     # una password a piacere (protegge /sync e /debug)
```

## 3. Deploy
```bash
npm install
npm run deploy
```
Il cron in `wrangler.json` (`*/15 * * * *`) eseguirà il sync ogni 15 minuti.

## 4. Verifica + rifinitura mappatura campi
Apri nel browser:
```
https://<tuo-worker>.workers.dev/debug?key=LA_TUA_SYNC_SECRET
```
Mostra la struttura GREZZA di una prenotazione ZAK. Con quella si confermano i nomi
esatti dei campi e si rifinisce `src/config.ts` / `src/zak.ts` (mappa camere, canale,
importo, occupazione). Poi `/sync?key=...` per una sincronizzazione immediata.

## Note
- **Scope**: se la chiave kapi vede anche Relais/Vatican, va aggiunto un filtro per
  importare **solo Divo** (pilota). Si decide dopo aver visto `/debug`.
- **Campi manuali preservati**: il sync aggiorna solo i dati da ZAK e non tocca
  `Modalità Booking`, `Stato ricevuta`, `▶️ Emetti ricevuta`.
- **Sicurezza**: rigenera la chiave WuBook se è stata condivisa in chiaro, poi
  reimposta il secret `ZAK_API_KEY`.
