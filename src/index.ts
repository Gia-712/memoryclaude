// Worker "ponte" ZAK -> Notion per la dashboard PRENOTAZIONI.
//
// Rotte HTTP:
//   GET /      -> pagina di stato
//   GET /sync  -> esegue il sync ora (protetta da ?key=SYNC_SECRET)
//   GET /debug -> mostra summary di tutte le prenotazioni ZAK (per trovare i room_type_id Divo)
import { renderHtml } from "./renderHtml";
import { runSync, type SyncEnv } from "./sync";
import { fetchTodayReservations } from "./zak";

interface Env extends SyncEnv {
  SYNC_SECRET?: string;
}

function authorized(url: URL, env: Env): boolean {
  if (!env.SYNC_SECRET) return true;
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
      const raw = await fetchTodayReservations(env.ZAK_API_KEY);
      // Summary compatto: utile per identificare i room_type_id delle camere Divo.
      const summary = raw.map(r => ({
        id_human:     r.id_human ?? r.id,
        channel:      r.origin?.channel,
        room_type_id: r.rooms?.[0]?.id_zak_room_type,
        room_id:      r.rooms?.[0]?.id_zak_room,
        dfrom:        r.rooms?.[0]?.dfrom,
        dto:          r.rooms?.[0]?.dto,
      }));
      return Response.json({ count: raw.length, summary, full_first_sample: raw[0] ?? null });
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

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runSync(env).then((out) => {
        if (!out.ok) console.error("Sync errors:", out.errors);
        else console.log(`Sync ok: ${out.total} Divo, ${out.skipped} saltate (altre strutture)`);
      }),
    );
  },
};
