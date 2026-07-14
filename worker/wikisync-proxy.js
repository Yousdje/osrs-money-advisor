/**
 * WikiSync CORS relay for the OSRS Money Advisor dashboard.
 *
 * sync.runescape.wiki 403s any browser request whose Origin isn't the wiki
 * itself, so GitHub Pages can't call it directly. This Worker fetches the
 * profile server-side (no Origin header) and returns it with CORS open.
 * Responses are edge-cached for 5 minutes — WikiSync only updates when the
 * player logs in with RuneLite anyway.
 *
 * Route: GET /player/<rsn>   →   sync.runescape.wiki/runelite/player/<rsn>/STANDARD
 */
const UPSTREAM = "https://sync.runescape.wiki/runelite/player/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Cache-Control": "public, max-age=300",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") return new Response("method not allowed", { status: 405, headers: CORS });

    const m = new URL(request.url).pathname.match(/^\/player\/([^/]{1,20})$/);
    if (!m) return new Response("not found", { status: 404, headers: CORS });
    const rsn = decodeURIComponent(m[1]);
    // OSRS names: 1-12 chars, letters/digits/spaces/hyphens/underscores
    if (!/^[\w\- ]{1,12}$/.test(rsn)) return new Response("bad rsn", { status: 400, headers: CORS });

    const upstream = await fetch(UPSTREAM + encodeURIComponent(rsn) + "/STANDARD", {
      headers: { "User-Agent": "osrs-money-advisor dashboard proxy (contact: yousdje@gmail.com)" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  },
};
