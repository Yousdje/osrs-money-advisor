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
every 10 minutes. The Money Makers and Combat sections are filtered to what a
mid-level member account can actually do.

Rates are estimates, not guarantees — the GE moves. Old School RuneScape is a
trademark of Jagex Ltd; this project is unaffiliated.
