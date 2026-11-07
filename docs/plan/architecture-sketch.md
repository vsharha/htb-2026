# Architecture sketch

Status: decided, 7 November 2026, except the open questions at the end. The decisions are recorded in [product.md](../product.md). This file describes the pipeline for [the ad channel mispricing finder](../ideas/ad-channel-mispricing.md), with research on existing AI media planners behind the form.

## Pipeline

```
1. Form ──> 2. Crowded ──> 3. Candidates ──> 4. Gap filter ──> 5. Verification ──> 6. Pricing ──> 7. Report and
 (input)     channels       (orchestrator     (reject/keep)     (per-medium         (CPM vs         outreach
             (competitors   proposes                            agents find         attention)      (draft/send)
             + our own      placements)                         rate card)
             history)
```

Step 1 is the startup's input; steps 2 to 7 are the six steps the orchestrator agent runs. Each step takes the previous step's output as typed data, so steps can be built and demoed one at a time.

The unit throughout is a placement, such as "Hamburg Airport jet bridges, €33,000 a month for 16 bridges", not a medium such as "airports". Per impression, airports as a medium are no cheaper than Meta, so any underpricing is in individual placements.

## Step 1: Form (input)

Existing AI media planners ask for a short brief, so ours does too. Common inputs:

- Ant10 (The Media Ant): brand and category, objective, budget, target geography, target audience, duration, preferences or constraints.
- Basis Compass: uploaded documents and plain-language instructions; no fixed fields found.
- Akkio: budget, what to optimise, goals, uploaded reach curves. Needs measurement data a startup won't have, so we skip it.

Our form is short, with two free-text fields:

| Field | Why we need it |
|---|---|
| Industry (multiple choice) | Finds competitors for the crowded-channel check |
| Startup in one sentence (free text) | Proposes candidate placements |
| Target customer in one sentence (free text) | Decides whose attention to find |
| What a customer pays, per month or per purchase | Weights audience value in step 6. Easier to answer than lifetime value; planners don't ask for either |
| Monthly advertising budget | Filters out placements with minimum spends or long terms (BER's jet bridges have a 2-year minimum; Hamburg's cost €33,000 a month) |
| Markets | Narrows to the places the startup wants customers, such as the UK |

Output of step 1: a structured brief object passed to step 2.

## Where we differ from existing planners

Surveyed 7 November 2026 from vendors' own pages; no product was tried. Basis, Akkio, ad:personam, The Media Ant and The Trade Desk all split a budget across channels they can already buy or plan within their own platform. None returns a rate card, a vendor contact or a cost per attentive second.

| | Existing planners | Ours |
|---|---|---|
| Channel set | Fixed catalogue | Specific placements discovered per brief, excluding crowded ones |
| Price | Estimates inside the platform | Published rate card, or an estimate labelled as one and confirmed by enquiry |
| Metric | Reach, impressions, efficiency | Cost per thousand attentive seconds, weighted by audience value |
| Output | Budget split with rationale | Ranked placements, each with a reason its gap survives, a contact and a way to measure it |
| Action | Activates inside own platform | Drafts or sends vendor outreach |

Nearest rivals for the pitch: Ant10 (plans offline channels, but India-focused and from its own inventory), Stroby (newsletter matching), AdQuick (out-of-home marketplace). Detail in the idea file under Existing products.

## Steps 2 to 7

Full reasoning and sources are in the idea file.

- Step 2, crowded channels: an agent finds the startup's competitors from its industry and description, and searches the web and press for their airport advertising. Meta's Ad Library and Google's Ads Transparency Center cover only online ads, so they don't show airport placements. Placements we have already recommended to other clients in the same category also count as crowded.
- Step 3, candidates: the orchestrator proposes specific airport placements where the target customer's attention sits, such as jet bridges, baggage reclaim, security trays, lounges and Wi-Fi login pages. It leaves out crowded placements and anything over budget, and ranks airports by how well their route and airline mix matches the target customer.
- Step 4, gap filter: each candidate must name a reason its low price lasts (information, constraints, behaviour or transformation), or it is rejected with the reason shown. It runs before verification so that browser time goes only to survivors.
- Step 5, verification: the orchestrator sends each survivor to the agent for its medium, such as the airport agent or the student union agent. Each agent knows how its medium is sold. Airports often sell through their own media team or a large contractor, students' unions publish media packs, and newsletters sell through marketplaces such as Paved or directly. Only the airport agent is built for now. The agent finds a rate card, media kit or contact. Where the price is "on request", the placement gets an estimate, labelled as one, from Hamburg Airport's jet-bridge rate per passenger scaled by the airport's passengers and route mix.
- Step 6, pricing: cost per thousand impressions beside cost per thousand attentive seconds, weighted by audience value, both against a Meta baseline. Impressions come from published passenger counts (CAA for UK airports, Eurostat for EU airports, airport media kits), and the audience weight from the airport's route and airline mix in flight data. Attention seconds and the Meta baseline are sliders, with the breakeven point marked.
- Step 7, report and outreach: the orchestrator ranks the placements, adds a way to measure each one (a QR code, promo code or landing page), and drafts the enquiry or fills the vendor's quote form. For an estimated price, the enquiry is how a real quote is obtained.

## Where the data comes from

Airport data is gathered ahead of time with scripts in `tools/`: passenger counts, flight routes and airlines per airport, and published rate cards, and the live agents add to it. Hamburg Airport's published jet-bridge sheet is the worked example for the pricing step. A recorded run of the full pipeline is kept as a fallback for the demo, because live browser agents fail on cookie banners, PDFs and slow sites.

## Data passed between steps

Proposed shapes, to be refined when building:

- `Brief`: the form fields above.
- `CrowdedChannel`: channel, why it counts as crowded (a named competitor advertises there, or we recommended it to another client in the category), and the evidence link.
- `Candidate`: placement name, medium, why the audience is there, gap reason.
- `VerifiedPlacement`: candidate plus price, price source link, contact, audience size, price status (published or estimated).
- `PricedPlacement`: verified placement plus CPM, weighted cost per attentive second, breakeven seconds.
- `Recommendation`: priced placement plus measurement method.
- `Outreach`: placement, draft message, status (drafted or sent).

A stored list of past recommendations, by client category, feeds step 2.

## Open questions for this sketch

- Which flight data source gives each airport's route and airline mix, and can gate data be gathered for volume per jet bridge?
- Does the demo send real vendor enquiries, or stop at a draft? Also open in the idea file.
- Does the demo run two clients in the same category, to show the second getting different placements?
