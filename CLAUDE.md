# CLAUDE.md — Memoria di progetto

> Nota: questo repo Git (`memoryclaude`) nasce dal template Cloudflare "Worker + D1"
> e **non contiene** il codice dei bot. Il sistema reale degli assistenti AI vive
> su **n8n** (istanza `n8n.srv1051452.hstgr.cloud`), gestita via MCP. Questo file
> serve da memoria di lavoro su quel sistema.

## Sistema "Staff AI" (Roma Centro Relais) — architettura su n8n

Gruppo di B&B/appartamenti a Roma (Divo Apartments, Relais Colonna, Vatican Escape).
Assistenti AI su WhatsApp orchestrati da n8n + Claude/OpenRouter + Notion come "memoria".

Attori principali:
- **AI | Direttore (WhatsApp) v2** (`7xHjYLRw1iDyF100`, attivo) — agente principale.
  Riceve i messaggi WhatsApp (webhook Meta), capisce la richiesta e instrada a
  decine di tool/sub-workflow. Modello attivo: **OpenRouter** (il nodo "Claude Sonnet"
  è uno spare scollegato). Smista per numero: Direttore / Concierge / Personale.
- **Concierge Test (Twilio)** (`5rYkTncxQK4MUoAm`) — "Sofia", concierge multilingua per gli ospiti.
- Tanti tool del Direttore: Receptionist, Contabile, Cassiere, KB|Cerca, ZAK|Prenotazione,
  Gmail|Cerca Ospite, Email|Invia/Rispondi, Task, Turni, Promemoria, Ricercatore Internet, ecc.

### Come funziona la "memoria" del Direttore
1. **Memoria conversazionale** — nodo `memoryBufferWindow`:
   `contextWindowLength: 25` (ultimi 25 scambi), chiave di sessione = **numero mittente**.
   ⚠️ È in RAM: si azzera ai riavvii di n8n.
2. **Diario Conversazioni** (Notion DB `ae3d190946e04d9c8a05f863e67dddf2`) — schema:
   `Messaggio` (title), `Mittente` (text), `Risposta` (text), `Data` (created_time).
   Ci scrivono i nodi `Log Chat Testo`/`Log Chat Foto` del Direttore (solo scambi
   Gianluca↔Direttore passati dall'agente).
3. **Cerca Conversazioni** (`KGXkuDwIwZyUD6Hv`) — tool che rilegge il Diario e filtra per parole chiave.

## Sessione 2026-06-24 — Bug "il Direttore non ricorda l'avviso di Sofia"

### Sintomo
Sofia non sa rispondere a un ospite → arriva l'alert sul WhatsApp del Direttore →
Gianluca risponde "dille a Sofia…" → il Direttore: *"Non trovo in cronologia il contesto…
non ho Sofia tra i messaggi recenti"*.

### Diagnosi (verificata)
Il Direttore **non** dimentica: ha memoria 25 + Diario + ricerca. Il problema è che
l'alert di Sofia è inviato dal workflow separato **Notifica Lacuna** (`kpQa8eSs3wm2TZIZ`),
che manda un WhatsApp diretto e salva la lacuna nella **KB lacune** (`7f392d7d23b848589dbe226c7755f41e`),
**bypassando** sia il buffer di memoria sia il Diario Conversazioni. Quindi per l'agente
quell'avviso non è mai esistito. (Il prompt del Direttore già documenta questo limite per
ricevute/email automatiche, ma la lacuna di Sofia non era coperta.)

### Fix applicati (entrambi LIVE / pubblicati)
- **A — Notifica Lacuna** (`kpQa8eSs3wm2TZIZ`): aggiunto nodo **`Log Diario`** (Notion create)
  come **ramo parallelo** di `Prepara Testo` (non blocca l'avviso a Gianluca). Scrive la lacuna
  nel **Diario Conversazioni** con numero ospite + domanda, così `Cerca Conversazioni` la trova.
- **B — Direttore** (`7xHjYLRw1iDyF100`): estesa la **descrizione del tool `Cerca Conversazioni`**
  (no riscrittura del system prompt da 18KB) per dirgli di chiamarlo SUBITO quando Gianluca si
  riferisce a Sofia / a un ospite / a una lacuna e non trova il riferimento in memoria.

### Note operative / credenziali Notion (IMPORTANTE)
- Le credenziali Notion in n8n NON sono leggibili via `get_workflow_details` (redatte),
  ma **sono visibili nei dati di un'esecuzione in errore**.
- Su 7 credenziali `notionApi`, diverse hanno **token morti (401)**.
  ✅ **`Notion account 7` (`AVDjTF5dnUkwQjIq`) è valida** e ha accesso al Diario —
  usata su `Log Diario`. Token confermati 401: `Notion account` (`7CRvzvb2ki7KYCxP`),
  `Notion account 2` (`NP2fAEkzP5s1ri04`).
- `update_workflow` salva in **bozza**: serve `publish_workflow` per andare live.

### Fix C — Roma Oggi v2 (RISOLTO, pubblicato)
`Notion | Roma Oggi v2` (`ADKJRqO11ZQnUdgL`) andava in **errore** (400) perché il nodo
`Prepara Body PATCH` metteva tutto il testo in un solo `rich_text` e Notion limita a
**2000 caratteri per elemento** (es. eventi = 3498). Ora il testo viene **spezzato in
segmenti ≤1900** (più elementi rich_text nello stesso blocco). Testato: esecuzione `success`,
4/4 PATCH ok. ⚠️ Lo schedule sembra girare **ogni ora** anziché solo alle 8:00
(rule `field:"hours"` + `triggerAtHour:8` incoerenti) — da rivedere se si vuole limitarlo.

### Da fare / aperti
- 🧹 Cancellare in Notion la riga di test nel Diario (titolo "— (riga di prova Claude, eliminabile)",
  id `389321d7-8ccd-817f-9e53-d1dcd4c569ee`). Neutralizzata (non più ricercabile) ma non eliminata
  (il Notion MCP non espone l'eliminazione pagina; basta un click in Notion).
- (Opzionale) `memoryBufferWindow` è volatile: valutare una memoria persistente se serve continuità tra riavvii.
- (Opzionale) ripulire le credenziali Notion con token morto (401) in n8n; tenere `Notion account 7`.
