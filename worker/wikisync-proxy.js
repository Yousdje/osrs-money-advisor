/**
 * CORS relay for the OSRS + RS3 Money Advisor dashboards.
 *
 * Neither upstream allows cross-origin browser requests (WikiSync 403s
 * non-wiki Origins, RuneMetrics sends no CORS headers), so GitHub Pages
 * can't call them directly. This Worker fetches server-side and returns
 * the payload with CORS open, edge-cached for 5 minutes.
 *
 * Routes:
 *   GET /player/<rsn>  →  sync.runescape.wiki/runelite/player/<rsn>/STANDARD   (OSRS)
 *   GET /rs3/<rsn>     →  { profile, quests } merged from the two RuneMetrics
 *                         endpoints (apps.runescape.com/runemetrics/...)       (RS3)
 */
const UPSTREAM = "https://sync.runescape.wiki/runelite/player/";
const RM_PROFILE = "https://apps.runescape.com/runemetrics/profile/profile?activities=0&user=";
const RM_QUESTS = "https://apps.runescape.com/runemetrics/quests?user=";
const UA = { "User-Agent": "rs-money-advisor dashboard proxy (contact: yousdje@gmail.com)" };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
  "Cache-Control": "public, max-age=300",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") return new Response("method not allowed", { status: 405, headers: CORS });

    const m = new URL(request.url).pathname.match(/^\/(player|rs3)\/([^/]{1,20})$/);
    if (!m) return new Response("not found", { status: 404, headers: CORS });
    const rsn = decodeURIComponent(m[2]);
    // RuneScape names (both games): 1-12 chars, letters/digits/spaces/hyphens/underscores
    if (!/^[\w\- ]{1,12}$/.test(rsn)) return new Response("bad rsn", { status: 400, headers: CORS });

    if (m[1] === "player") {
      const upstream = await fetch(UPSTREAM + encodeURIComponent(rsn) + "/STANDARD", {
        headers: UA, cf: { cacheTtl: 300, cacheEverything: true },
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    // RS3: merge the two RuneMetrics endpoints into one payload
    const enc = encodeURIComponent(rsn);
    const [pRes, qRes] = await Promise.all([
      fetch(RM_PROFILE + enc, { headers: UA, cf: { cacheTtl: 300, cacheEverything: true } }),
      fetch(RM_QUESTS + enc, { headers: UA, cf: { cacheTtl: 300, cacheEverything: true } }),
    ]);
    if (!pRes.ok || !qRes.ok) {
      return new Response(JSON.stringify({ error: "UPSTREAM_" + (pRes.ok ? qRes.status : pRes.status) }),
        { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
    }
    const profile = await pRes.json();   // may itself carry {error: NO_PROFILE|PROFILE_PRIVATE}
    const quests = await qRes.json();
    return new Response(JSON.stringify({ profile, quests: quests.quests || [] }), {
      headers: { "Content-Type": "application/json", ...CORS },
    });
  },
};
