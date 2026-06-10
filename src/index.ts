import {
  renderCodeAvailable,
  renderCodeMissing,
  renderCodeNotYet,
  renderNotFound,
} from "./renderHtml";
import { getRoom, isCodeAvailable } from "./rooms";

const HTML_HEADERS = {
  "content-type": "text/html; charset=UTF-8",
  // Sempre fresco: la disponibilità del codice dipende dall'ora.
  "cache-control": "no-store",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // La camera può arrivare come path (/blu) o come query (?room=blu).
    const pathSlug = url.pathname.replace(/^\/+|\/+$/g, "");
    const slug = url.searchParams.get("room") || pathSlug || null;
    const room = getRoom(slug);

    if (!room) {
      return new Response(renderNotFound(), { status: 404, headers: HTML_HEADERS });
    }

    let html: string;
    if (room.code === null) {
      html = renderCodeMissing(room);
    } else if (isCodeAvailable()) {
      html = renderCodeAvailable(room);
    } else {
      html = renderCodeNotYet(room);
    }

    return new Response(html, { headers: HTML_HEADERS });
  },
} satisfies ExportedHandler<Env>;
