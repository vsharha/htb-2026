# Fine Print: contracts that look identical but aren't

Status: proposed, 7 November 2026.

## Idea

Polymarket and Kalshi often list the "same" question at different prices. An agent finds matching markets on both platforms and reads both sets of rules. That covers Kalshi's contract-terms PDF filed with the US regulator, the CFTC, Polymarket's dispute record and each named settlement source. It compares the rules clause by clause and writes out the scenario in which the two contracts would settle differently.

The output is a "true spread": the price gap minus fees, minus the risk that the contracts settle differently. Because past markets have known outcomes, the agent's accuracy can be measured. It is for analysts, journalists and regulators, not gamblers.

## Origin

A rework of Daniel's [prediction-market mispricing](prediction-market-mispricing.md) idea. It was made by the advocate agent for that idea in a brainstorm on 7 November 2026, at macmac's request. The angle of reading the rules first came from another agent in the same brainstorm. A judge agent ranked it second (see [idea-ranking.md](../idea-ranking.md)).

## Tracks it could serve

- HRT: strong. Real market data, meaning order books, bid and ask, and price history, plus alternative data (contract text and settlement sources), drive a tested decision. It is the best HRT fit of any idea.
- G-Research: strong. "A market's mood" is one of the brief's own examples. The hidden thing is whether two contracts really mean the same. It is found by reading the fine print, and it lets people tell real mispricing from rule differences.
- Wordsmith: moderate. Comparing contracts to see when they settle differently is contract interpretation, across several sites. The risk is that judges see API calls rather than browser work.
- Bank of Scotland: none.

## Challenges it could use

- Gemini API: reading and comparing contract rules.
- Tiger Data: price time series.

## Open problems

These come from agents' web checks on 7 November 2026.

- Confirmed with live calls from the UK: both platforms' data can be read without a key. That covers Polymarket's resolution text and price history, and Kalshi's settled markets, rules, price candles, contract-terms PDFs and settlement sources.
- Research papers (arXiv 2601.01706 and 2604.24147) report price gaps between the platforms that persist and blame different resolution rules. Known cases: the 2024 US government shutdown market, where Polymarket settled Yes and Kalshi No; the US Bitcoin reserve; and Fed rate markets.
- Only tens of past cases settled differently, so the accuracy test is small.
- Matching the same question across platforms is fiddly.
- Bots that trade on price gaps already exist, so the novelty has to come from reading the rules.
- kalshi.com rejected a script with HTTP 429 (too many requests). The APIs and PDFs worked.
- Both platforms restrict UK users, and the Gambling Commission treats UK-facing prediction markets as betting. The demo must be read-only, with no trading.

## Scope

Live browser panes open both markets and follow links to the CFTC PDF and the settlement source. A clause comparison highlights the line that differs. Replay the 2024 shutdown market, then end on the agent's accuracy across past markets.

## Alternatives

- [Flat Truth](flat-truth.md): ranked above it, with three strong tracks including Bank of Scotland and a more relatable demo.
- [Prediction-market mispricing](prediction-market-mispricing.md): Daniel's original idea, which this reworks around reading the rules.
