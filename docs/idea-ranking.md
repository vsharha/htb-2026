# Idea ranking

Ten project ideas, ranked, plus three added after the ranking. Each has its own file in `ideas/`. This is a recommendation, not a decision. The team decides what we build.

## How it was ranked

On 7 November 2026, macmac ran a brainstorm with AI agents:

1. **Ideas.** Four agents came up with ideas on their own, each from a different angle:
   - covering the most tracks
   - winning the biggest prizes
   - the most impressive demo
   - building on the team's existing ideas
2. **Debate.** Each strong idea got an advocate. The advocate checked its facts on the web, argued for it and attacked the others. Daniel's three ideas in `docs/ideas/` each got an advocate too.
3. **Judging.** A neutral judge agent scored every idea the same way and ranked them.

The rule throughout: we submit one project and enter it into every sponsor track it fits. Every idea can also compete for Metaview's overall prize.

Facts below come from the agents' web checks on 7 November 2026. Nobody has re-checked them by hand yet. Win chances are the judge's rough guesses.

## The ranking

| # | Idea | Sponsor tracks it fits | In one line |
|---|---|---|---|
| 1 | [Flat Truth](ideas/flat-truth.md) | Wordsmith, G-Research, Bank of Scotland (all strong); HRT (weak) | Check an Edinburgh rental against public records before you sign |
| 2 | [Fine Print](ideas/fine-print.md) | HRT, G-Research (strong); Wordsmith (moderate) | Two betting contracts that look the same often aren't, and an agent finds out why |
| 3 | [Room Radar](ideas/room-radar.md) | Wordsmith (strong); G-Research, Bank of Scotland (moderate) | Find the real cheapest room for a society's event |
| 4 | [Ad channel finder](ideas/ad-channel-mispricing.md) | G-Research (strong); Wordsmith, HRT (moderate) | Find cheap, overlooked places to advertise |
| 5 | [Overpaid](ideas/overpaid.md) | Bank of Scotland (strong); others moderate or weak | Not recommended: a weaker, wider version of #1 |
| 6 | [Glassbox](ideas/glassbox.md) | InstaLily (strong, if it passes); JetBrains (moderate) | Not recommended: fewest tracks, and one missed bug means unranked |
| 7 | [Terms Time Machine](ideas/terms-time-machine.md) | G-Research, Wordsmith (strong); Bank of Scotland (moderate) | See how a service's terms changed and how hard it is to cancel |
| 8 | [Small Print Tax](ideas/small-print-tax.md) | Bank of Scotland, G-Research (strong); HRT, Wordsmith (moderate) | The real 24-month cost of a broadband or mobile contract |
| 9 | [Cheap Hours](ideas/cheap-hours.md) | HRT, Bank of Scotland (strong); G-Research (moderate) | When electricity is cheapest and greenest, and what to run then |
| 10 | [Shelf Truth](ideas/shelf-truth.md) | Wordsmith, G-Research, Bank of Scotland (strong); HRT (moderate) | Catch shrinkflation and fake "was" prices in supermarkets |

Ideas 1 to 6 went through the debate and the judge. Ideas 7 to 10 came up in the first round but were not debated, so their ranking rests on the first-round notes and their facts are mostly unchecked. They rank below the debated ideas for these reasons:

- **7, Terms Time Machine:** its data is unchecked, it needs test accounts and its HRT fit is weak.
- **8, Small Print Tax:** comparison sites block bots, the overpayment is small and bill-saving apps are common.
- **9, Cheap Hours:** Octopus already publishes the next day's prices, energy apps are common and its Wordsmith fit is weak.
- **10, Shelf Truth:** it depends on supermarket sites that block bots.

No pair of ideas combines into one coherent project. Each pair turned out to be two products bolted together.

## 1. Flat Truth

**What it is.** A renter pastes an Edinburgh rental listing. A browser agent checks the flat and landlord against public records:

- the Scottish Landlord Register
- the HMO licence register
- the energy rating (EPC) register
- the council tax band
- every published tribunal decision about unprotected deposits

**What the renter gets:**

- **Problems:** illegal fees (an "admin fee" is illegal in Scotland) and whether the landlord is registered.
- **True monthly cost:** rent plus council tax, energy and commute time.
- **Tribunal record:** for example "this landlord has 2 deposit findings", each linked to the decision.

**Why it's first:**

- It's the only idea that is strong on three tracks.
- **Wordsmith** prefers legal work and judges how complex the workflow is. This one checks several government sites, and each step feeds the next.
- **G-Research:** it shows something hidden (rule-breaking landlords), how it's found (cross-checking registers) and what it enables (avoiding them or claiming money back).
- **Bank of Scotland:** rent is the biggest cost of living.
- Every judge has rented, so the demo lands.

**Facts checked:**

- The legal basis holds: admin fees are illegal under the Rent (Scotland) Act 1984, sections 82, 88 and 90.
- The Landlord Register can be searched by postcode or registration number.
- Roughly 1,000 to 1,500 deposit tribunal decisions are published. That figure is extrapolated from one page of the list, not counted.

**Risks:**

- **Names may be redacted.** Recent tribunal decisions may hide the landlord's name. If they do, the tribunal record feature doesn't work.
- **Registers may block bots.** The registers may block automated browsers. Keep a recorded run as a backup for the demo.
- **Deposit checks need tenant details.** You can't check a deposit for a flat you're only viewing, because the deposit schemes ask for the tenant's details.
- **Defamation.** Calling named landlords "rogue" is risky. Show only facts linked to decisions, and match on exact address, never on similar names.
- **Awards are often small.** One was £50. Show a likely range from similar cases, not "up to 3× your deposit".
- **Crowding.** Other teams will probably build renting apps. Cross-checking records is what sets this one apart.

**Check in the first two hours.** If either of the first two checks fails, switch to #2.

1. Recent tribunal decisions still name the landlord.
2. One current listing links to a landlord with a tribunal decision.
3. At least 4 of 6 registers load in an automated browser.

## 2. Fine Print

Daniel's prediction-market idea, reworked by its advocate.

**What it is.** Polymarket and Kalshi often list the "same" question at different prices. An agent reads both platforms' rules and contract documents, and writes out the scenario where they would settle differently.

**Example.** In the 2024 US government shutdown market, Polymarket settled Yes and Kalshi settled No. Anyone who thought they had a safe bet across the two lost on both sides.

We can test the agent's accuracy on past markets that have already settled.

**Who it's for:** analysts, journalists and regulators. Not gamblers.

**Why it's second:**

- It has the best data of any idea. Both platforms' price and rules data can be read without a key, which was checked live.
- **HRT:** it's the best fit of any idea, with real market data feeding a tested decision.
- **G-Research:** names "a market's mood" as one of its own examples.
- It's the least likely to break during the demo.

**Risks:**

- **No Bank of Scotland fit.**
- **Few test cases.** Only tens of past cases settled differently, so the accuracy test is small.
- **Wordsmith may see API calls, not browser work.**
- **UK rules.** Regulators treat these markets as gambling. The demo must be read-only, with no trading.

## 3. Room Radar

Daniel's off-peak venue idea, reworked by its advocate.

**What it is.** A society describes its event ("60 people, Thursday evening, £200, step-free"). An agent then:

- searches Tagvenue (431 Edinburgh rooms with public prices), council rooms and university rooms
- reads each venue's terms for hidden costs such as VAT, staff and catering
- checks licensing
- fills the booking form, stopping before submit

**Best moment.** The University's community scheme gives local groups rooms for free, including the Nucleus Building at weekends. The room the judges are sitting in is free to hire.

**Why it's third.** It fits the same tracks as #1 and is easier to build, but the problem is much smaller and judges won't feel it as much.

**Risks:**

- **Hidden prices.** Many venues hide their prices.
- **No HRT fit.** There's no price history to model.
- **Feels trivial.** It may come across as small apart from that one moment.

## 4. Ad channel finder

Daniel's ad-channel mispricing idea.

**What it is.** A startup describes its product and audience. An agent finds overlooked places to advertise and prices them. It then ranks them by cost per second of real attention instead of cost per view. Revolut's airport ads are the example: dearer per view than Meta, but cheaper per second of attention.

**Why it's fourth.** The chart where the cheaper channel flips is a strong moment, but the data underneath is thin:

- **Source checks out.** The newsletter behind the idea, Mispriced #007, is real and matches every figure in Daniel's file.
- **Headline example can't be rebuilt.** Berlin airport's jet-bridge price is now "price on request". Other Berlin airport formats do publish prices.
- **Other prices are patchy.** Rail stations publish no prices. Newsletters and some student unions do.
- **Attention data is thin and disputed.** The four-second figure is an assumption.

## Not recommended

**Overpaid.**
- **Idea:** find every household bill where you pay more than you should, and draft a letter citing the rule that backs it.
- **Bills covered:** broadband, insurance, rent and energy.
- **Why not:**
  - The overpayments are small. The broadband loyalty penalty is about £108 a year.
  - Comparison sites block bots.
  - It spreads #1's sharp story across five thin rows.

**Glassbox.**
- **Idea:** a coding agent that fixes Python bugs and explains them differently for a beginner, an expert and a third persona.
- **Fits:** InstaLily and JetBrains.
- **Why not:**
  - It reaches only two tracks.
  - InstaLily leaves us unranked if we miss even one simple bug.
  - Debugging demos look alike.

## Added after the ranking

Three ideas were added on 7 November 2026, after the user ruled out career prizes and asked for ideas built around the sponsor tracks' judging notes rather than the first ten. They have not been through the debate or the judge, and their facts are unchecked, so they are unranked. In the agent's provisional view:

- [Unclaimed](ideas/unclaimed-money.md) is at least level with [Flat Truth](ideas/flat-truth.md). It serves the same three strong tracks, is the most direct Bank of Scotland fit of any idea, and has a deterministic demo instead of one that depends on a data coincidence.
- [Second-hand value radar](ideas/second-hand-value-radar.md) reaches all four Group A tracks, but marketplace access is the riskiest data source of any idea and one good listing has to exist at judging time.
- [Delay compensation](ideas/delay-compensation.md) is strong on Bank of Scotland and G-Research, but it is crowded and narrower than the other two.

None of the three combines with an existing idea into one product.
