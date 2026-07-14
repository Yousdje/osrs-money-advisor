# OSRS Money Advisor

A live dashboard of Old School RuneScape gold-making opportunities: GE flips,
potion decanting, set-exchange arbitrage, high-alchemy targets, money makers
and combat methods — hosted on GitHub Pages.

**Every figure is conservative by construction:**

- All sell legs are priced **after the 2% GE tax**.
- Buy at instant-buy, sell at instant-sell — patient offers only do better.
- Throughput is capped at 10% of real daily volume, never the raw buy limit.
- "Processing" money makers (GE-to-GE conversions) are **re-derived from live
  prices** rather than trusting the wiki's optimistic gp/hr; anything that
  can't be verified is dropped instead of shown.

Prices come from the [OSRS Wiki real-time price API](https://prices.runescape.wiki).
`data.json` is regenerated and pushed automatically every ~4 hours (the GE
buy-limit window) by a self-hosted advisor pipeline; the page refetches it
every 10 minutes.

**Filter to your own account:** enter your RSN and the Money Makers / Combat
sections narrow to what *your* stats and quest log allow. This uses the
[RuneLite WikiSync plugin](https://runelite.net/plugin-hub/show/wiki-sync)'s
public endpoint (install the plugin, log in once) — levels and quest states
in one call, no passwords, nothing stored. Because WikiSync only answers
wiki-origin browsers, `worker/` contains a small Cloudflare Worker CORS relay
the page calls instead (5-minute edge cache).

Rates are estimates, not guarantees — the GE moves. Old School RuneScape is a
trademark of Jagex Ltd; this project is unaffiliated.
