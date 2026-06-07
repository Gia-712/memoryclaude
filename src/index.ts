// Worker "ponte" ZAK -> Notion per la dashboard PRENOTAZIONI.
import { renderHtml } from "./renderHtml";
import { runSync, type SyncEnv } from "./sync";
import { fetchTodayReservations, ZAK_BASE } from "./zak";

interface Env extends SyncEnv {
  SYNC_SECRET?: string;
}

function authorized(url: URL, env: Env): boolean {
  if (!env.SYNC_SECRET) return true;
  return url.searchParams.get("key") === env.SYNC_SECRET;
}

async function tryCustomer(apiKey: string, id: number) {
  try {
    const res = await fetch(`${ZAK_BASE}/customers/fetch_customer`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const text = await res.text();
    return { id, status: res.status, body: text.slice(0, 500) };
  } catch (e: any) {
    return { id, error: e?.message };
  }
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
      const summary = raw.map(r => ({
        id_human:     r.id_human ?? r.id,
        channel:      r.origin?.channel,
        booker:       r.booker,
        room_type_id: r.rooms?.[0]?.id_zak_room_type,
        dfrom:        r.rooms?.[0]?.dfrom,
        dto:          r.rooms?.[0]?.dto,
      }));
      // Prova booker + primo customer da rooms[0] per trovare quale porta il nome.
      const first = raw[0];
      const booker = first?.booker;
      const firstRoomCustomer = first?.rooms?.[0]?.customers?.[0]?.id;
      const customerTests = await Promise.all([
        booker ? tryCustomer(env.ZAK_API_KEY, booker) : null,
        firstRoomCustomer && firstRoomCustomer !== booker
          ? tryCustomer(env.ZAK_API_KEY, firstRoomCustomer)
          : null,
      ]);
      return Response.json({ count: raw.length, summary, customerTests });
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
        else console.log(`Sync ok: ${out.total} prenotazioni, ${out.skipped} saltate`);
      }),
    );
  },
};
