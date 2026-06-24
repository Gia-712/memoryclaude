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
  un'esecuzione in ERRORE. Diverse hanno token morti (401). Valida: **Notion account 7**.
- `update_workflow` salva in BOZZA → serve `publish_workflow` per andare live.
- Schedule di "Roma Oggi v2" sembra girare ogni ora invece che solo alle 8:00
  (rule field "hours" + triggerAtHour incoerenti) — da verificare se voglio limitarlo.

Cosa potrei volerti chiedere ora: [scrivi qui il nuovo obiettivo].
