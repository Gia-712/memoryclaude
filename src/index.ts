// Worker "ponte" ZAK -> Notion per la dashboard PRENOTAZIONI.
//
// Rotte HTTP:
//   GET /            -> pagina di stato
//   GET /sync        -> esegue il sync ora (protetta da ?key=SYNC_SECRET se impostata)
//   GET /debug       -> mostra la risposta GREZZA di ZAK (per confermare i nomi dei campi)
// Cron (vedi wrangler.json triggers.crons): esegue runSync periodicamente.
import { renderHtml } from "./renderHtml";
import { runSync, type SyncEnv } from "./sync";
import { fetchTodayReservations } from "./zak";

interface Env extends SyncEnv {
  // Secret opzionale per proteggere /sync e /debug da accessi esterni.
  SYNC_SECRET?: string;
}

function authorized(url: URL, env: Env): boolean {
  if (!env.SYNC_SECRET) return true; // se non impostato, lasciamo aperto (consigliato impostarlo)
  return url.searchParams.get("key") === env.SYNC_SECRET;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/sync") {
      if (!authorized(url, env)) return new Response("Unauthorized", { status: 401 });
      const out = await runSync(env);
      return Response.json(out);
    }

    if (url.pathname === "/debug") {
      if (!authorized(url, env)) return new Response("Unauthorized", { status: 401 });
      // Mostra la prima prenotazione grezza per ispezionare i nomi dei campi reali.
      const raw = await fetchTodayReservations(env.ZAK_API_KEY);
      return Response.json({ count: raw.length, sample: raw[0] ?? null });
    }

    return new Response(
      renderHtml(
        "Worker ponte ZAK → Notion attivo.\n" +
          "• /sync  → sincronizza ora\n" +
          "• /debug → ispeziona i dati grezzi ZAK",
      ),
      { headers: { "content-type": "text/html" } },
    );
  },

  // Cron trigger.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runSync(env).then((out) => {
        if (!out.ok) console.error("Sync errors:", out.errors);
        else console.log(`Sync ok: ${out.total} prenotazioni`);
      }),
    );
  },
};
