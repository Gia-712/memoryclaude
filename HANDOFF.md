# HANDOFF — Progetto "Ricevute & Dashboard" (Roma Centro Relais / Villaggio Turchese)

> Incolla questo intero documento come primo messaggio in una nuova chat per continuare il lavoro.

## CHI SONO E COSA STIAMO COSTRUENDO
Gestisco 3 strutture ricettive a Roma. Sto costruendo un sistema che:
1. mostra le prenotazioni in una **dashboard Notion** (usabile da mobile), alimentata da **ZAK** (PMS di WuBook);
2. su ogni scheda prenotazione genera **link di pagamento** e permette di **emettere la ricevuta** seguendo regole precise;
3. collega la dashboard Notion alla base **Airtable** che genera i PDF delle ricevute Divo.

**Pilota attuale = solo Divo Apartments.** Relais e Vatican verranno dopo.

## LE 3 STRUTTURE (due società distinte, due circuiti di pagamento — MAI incrociarli)
- **Divo Apartments** (appartamenti BLU, ROSSO/ROSSA, GIALLO=ORO, BORGO) → società **Villaggio Turchese** → pagamenti **VivaWallet** → ricevuta via **Airtable**.
- **Relais Colonna** → società **Roma Centro Relais srl** → **Stripe** → scontrino registratore di cassa.
- **Vatican Escape** → società **Roma Centro Relais srl** → **Stripe** → scontrino Roma Centro Relais.

## REGOLE RICEVUTE (la "Costituzione", già documentata in Notion)
- Tassa di soggiorno = **5€ × persone × notti**, sempre voce a parte; gli **esenti** non contano.
- **Link VivaWallet**: `https://pay.vivawallet.com/villaggio-turchese/{IMPORTO_IN_CENTESIMI}` (senza virgole né punti: 1205,90€ → 120590).
- **Booking ha 2 modalità** (flag manuale sulla scheda, campo `Modalità Booking`): *Virtual Card* oppure *Pagamento all'arrivo*.
- Numero ricevuta **progressivo** (ultimo reale = 101 → prossimo 102).
- **Sempre una prova di test prima del reale**; mai emettere senza aver incassato.
- Template campo `Indicazioni` (Airtable Divo):
  - Diretta: `{totale}€ compresa la tassa di soggiorno per {paganti} adulti e {esenti} esenti. Pagamento effettuato tramite {metodo} il {data}.`
  - Booking: `Soggiorno {x}€ incassato con VivaWallet + tassa di soggiorno {y}€ ({persone}×{notti}×5€). Totale {tot}€. Ricevuta unica con le 2 transazioni. Incassato il {data}.`
  - Airbnb: `{importo}€ per il soggiorno. Tassa di soggiorno gestita e versata da Airbnb. Incasso comunicato da Roberta il {data}.`

## COSA È GIÀ FATTO IN NOTION (workspace "Roma Centro Relais srl HQ")
- 📜 **Costituzione delle Ricevute**: https://app.notion.com/p/378321d78ccd81ba99c7d5cbc17c5bd6
- 🤖 **Regole Ricevute Divo**: https://app.notion.com/p/378321d78ccd81eb9049e5e70f72cc1d
- 📅 **Database PRENOTAZIONI**: https://app.notion.com/p/8a4031151e134b79b10a795c936b2c6c
  - Proprietà aggiunte: `Camera Divo`, `Guidebook camera`, `Importo (cents)`, `Link VivaWallet` (formula auto), `Link Stripe`, `Istruzioni incasso`, `Stato ricevuta`, `N. ricevuta`, `Link riga Airtable`, `Link Drive ricevuta`, `Modalità Booking`, `▶️ Emetti ricevuta`.
  - Viste: **🛬 Arrivi a breve**, **🏠 In casa ora**, **🧾 Ricevute da emettere**.
- Schede di prova rimaste: "TEST — Mario Rossi" e "Thetis Villa" (da ripulire/riconciliare).

## COSA È GIÀ FATTO IN AIRTABLE
- Base **Ricevute Divo Apartments** (`appTcxtAaMBs2V7sk`), tabella **Prenotazioni** (`tblRL7OwhaL4L7wpo`).
- Campi: Nome, Piattaforma (Airbnb/Booking/Diretta), Stato (Da fare/Generata/Su Drive), Suite (BLU/ORO/ROSSA/**BORGO** aggiunto), Cliente, Check-in, Check-out, Screenshot, Numero ricevuta, Link Drive, Notti (formula), Indicazioni.
- **Automazione**: impostando `Stato = Da fare` parte la generazione del PDF → tag Generata → caricamento su Drive.

## IL CODICE (repo già pronto)
- Repo: **github.com/Gia-712/memoryclaude**, branch **`claude/notion-airtable-receipts-c6f2o`**.
- Cloudflare Worker "ponte" ZAK→Notion: `src/zak.ts` (client kapi), `src/notion.ts` (upsert per `Codice ZAK`), `src/sync.ts`, `src/config.ts` (mappe camere/canali/guidebook), `src/index.ts` (rotte `/sync` e `/debug` + cron ogni 15 min). Vedi anche **SETUP.md**.
- ZAK = WuBook **kapi**: auth header `x-api-key: wb_...`, base `https://kapi.wubook.net/kp`, endpoint `/reservations/fetch_reservations` e `/reservations/fetch_today_reservations`.

## DOVE SIAMO ARRIVATI (stato deploy)
- Sono su **Mac**. Ho installato wrangler (via npx) e ho fatto **`wrangler login`** con successo (account gianlucasimoneschi1@gmail.com).
- Ho creato l'**integrazione Notion** "Sync ZAK" e l'ho **connessa al database PRENOTAZIONI**; ho il **NOTION_TOKEN** salvato.
- Ho la **chiave ZAK** `wb_...` (⚠️ è stata condivisa in chat: DA RIGENERARE su WuBook per sicurezza).

## PROSSIMI PASSI DA FARE (continua da qui)
1. Aprire il terminale ed entrare nella cartella del progetto:
   ```bash
   git clone https://github.com/Gia-712/memoryclaude.git   # se non l'ho già clonata
   cd memoryclaude
   git checkout claude/notion-airtable-receipts-c6f2o
   npm install
   ```
2. Impostare i 3 secret (NON scrivere le chiavi in chat):
   ```bash
   npx wrangler secret put ZAK_API_KEY     # chiave wb_... di ZAK
   npx wrangler secret put NOTION_TOKEN    # token integrazione Notion
   npx wrangler secret put SYNC_SECRET     # una password a piacere
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
4. Aprire `https://<mio-worker>.workers.dev/debug?key=LA_MIA_SYNC_SECRET` e incollare la struttura grezza di una prenotazione, per **rifinire la mappatura dei campi** in `src/config.ts` / `src/zak.ts` (nomi kapi esatti, etichette camere ZAK, importo, occupazione) e decidere se serve un **filtro solo-Divo** (se la chiave vede anche Relais/Vatican).
5. Poi `/sync?key=...` per la prima sincronizzazione; il cron poi gira da solo ogni 15 min.

## NOTE PER L'ASSISTENTE CHE RIPRENDE
- Le modifiche Notion/Airtable le ho fatte tramite connettori MCP. In una nuova chat potresti NON avere quelle connessioni: in tal caso guidami nei passi o chiedimi di collegarle.
- Non posso deployare dall'ambiente Claude (rete verso WuBook/Cloudflare bloccata): il deploy lo eseguo io sul mio Mac, tu mi guidi.
- Ricordami di **rigenerare la chiave WuBook** e reimpostare `ZAK_API_KEY` dopo il setup.
