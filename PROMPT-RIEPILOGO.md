# Prompt di riepilogo — Sistema Staff AI (n8n) Roma Centro Relais

> Copia-incolla il blocco qui sotto all'inizio di una nuova sessione (Claude Code / chat)
> per ripartire con tutto il contesto. Aggiornato: 2026-06-24.

---

Sto lavorando al mio sistema di assistenti AI su WhatsApp per Roma Centro Relais
(B&B/appartamenti a Roma: Divo Apartments, Relais Colonna, Vatican Escape).
NON è nel repo Git `memoryclaude` (quello è solo un template Cloudflare): il sistema
vive su **n8n** (`n8n.srv1051452.hstgr.cloud`), che gestisci via gli strumenti MCP n8n,
con **Notion** come memoria/knowledge base e Claude/OpenRouter come modelli.

Pezzi chiave:
- **AI | Direttore (WhatsApp) v2** (id `7xHjYLRw1iDyF100`): agente principale. Memoria =
  `memoryBufferWindow` (ultimi 25 messaggi, chiave = numero mittente, in RAM). Logga gli
  scambi nel Notion **Diario Conversazioni** (`ae3d190946e04d9c8a05f863e67dddf2`:
  Messaggio=title, Mittente, Risposta, Data). Modello attivo: OpenRouter.
- **Concierge "Sofia"** (Twilio, id `5rYkTncxQK4MUoAm`): bot ospiti.
- **Notifica Lacuna** (id `kpQa8eSs3wm2TZIZ`): quando Sofia non sa rispondere, avvisa
  Gianluca su WhatsApp e salva la lacuna. Tool **Cerca Conversazioni** (`KGXkuDwIwZyUD6Hv`)
  rilegge il Diario.

Cosa è già stato fatto (2026-06-24, fix LIVE/pubblicati):
1. Diagnosticato: il Direttore "non ricordava" gli avvisi di Sofia perché arrivavano da
   Notifica Lacuna bypassando memoria e Diario. NON era un problema di memoria corta.
2. Fix A: Notifica Lacuna ora scrive la lacuna anche nel Diario (nodo `Log Diario`, ramo
   parallelo, credenziale **Notion account 7** `AVDjTF5dnUkwQjIq`).
3. Fix B: estesa la descrizione del tool `Cerca Conversazioni` del Direttore perché lo
   usi quando ci si riferisce a Sofia/ospite/lacuna.
4. Fix bug separato: `Notion | Roma Oggi v2` (`ADKJRqO11ZQnUdgL`) andava in errore (400)
   perché un blocco superava i 2000 caratteri Notion → ora il testo viene spezzato in
   segmenti rich_text ≤1900.

Note importanti:
- Le credenziali Notion in n8n sono redatte in lettura ma visibili nei dati di
  un'esecuzione in ERRORE. Diverse hanno token morti (401). Valida: **Notion account 7**
  (`AVDjTF5dnUkwQjIq`). Token confermati morti: `Notion account` (`7CRvzvb2ki7KYCxP`),
  `Notion account 2` (`NP2fAEkzP5s1ri04`).
- `update_workflow` salva in BOZZA → serve `publish_workflow` per andare live.
- Esecuzioni n8n grandi sfondano il limite token: usa `jq` sul file salvato dal tool.

COSA RESTA DA FARE (da gestire in questa nuova chat):
1. **Schedule Roma Oggi v2** (`ADKJRqO11ZQnUdgL`): gira **ogni ora** invece che solo
   alle 8:00. Il nodo trigger "Ogni mattina alle 8:00" ha `rule.interval = [{field:"hours",
   triggerAtHour:8}]`: con `field:"hours"` n8n fa "ogni N ore" e ignora `triggerAtHour`.
   Fix: usare un intervallo giornaliero (field "days") con ora 8, oppure un cron `0 8 * * *`.
   Ricordarsi `publish_workflow` dopo la modifica.
2. **Memoria persistente del Direttore** (`7xHjYLRw1iDyF100`): oggi usa `memoryBufferWindow`
   (in RAM, si azzera ai riavvii n8n, solo ultimi 25). Valutare una memoria persistente
   (es. Postgres/Redis chat memory) se serve continuità tra riavvii/sessioni.
3. **Pulizia Notion**: (a) eliminare la riga di test nel Diario
   (id `389321d7-8ccd-817f-9e53-d1dcd4c569ee`, titolo "— (riga di prova Claude, eliminabile)");
   (b) rimuovere le credenziali Notion con token morto, tenendo `Notion account 7`.

Nuovo obiettivo per questa sessione: [scrivi qui].
