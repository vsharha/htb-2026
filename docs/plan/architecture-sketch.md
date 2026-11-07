# Architecture sketch

Status: proposal, 7 November 2026. Nothing here is decided. It sketches the pipeline in [the idea file](../ideas/ad-channel-mispricing.md) and fills in step 1 from research on existing AI media planners.

## Pipeline

```
1. Brief ──> 2. Candidates ──> 3. Gap filter ──> 4. Verification ──> 5. Pricing ──> 6. Outreach
 (input)     (LLM proposes)    (reject/keep)     (rate card?)        (CPM vs        (draft/send)
                                                                      attention)
```

Each step takes the previous step's output as typed data, so steps can be built and demoed one at a time.

## Step 1: Brief (input)

Existing AI media planners ask for a short brief, so ours should too. Common inputs:

- Ant10 (The Media Ant): brand and category, objective, budget, target geography, target audience, duration, preferences or constraints.
- Basis Compass: uploaded documents and plain-language instructions; no fixed fields found.
- Akkio: budget, what to optimise, goals, uploaded reach curves. Needs measurement data a startup won't have, so we skip it.

Proposed brief for us:

| Field | Why we need it |
|---|---|
| Product description | Proposes candidate channels |
| Target customer | Decides whose attention to find |
| Customer value (rough lifetime value) | Weights audience value in step 5. Planners don't ask for this |
| Geography | Narrows to one market, e.g. UK and EU |
| Budget and duration | Filters out channels with minimum spends or long terms (BER's jet bridges have a 2-year minimum) |
| Channels already used (optional) | Marks the crowded channels, so we look elsewhere |
| Vertical (optional) | Out-of-home, or newsletters and podcasts |

Output of step 1: a structured brief object passed to step 2.

## Where we differ from existing planners

Surveyed 7 November 2026 from vendors' own pages; no product was tried. Basis, Akkio, ad:personam, The Media Ant and The Trade Desk all split a budget across channels they can already buy or plan within their own platform. None returns a rate card, a vendor contact or a cost per attentive second.

| | Existing planners | Ours |
|---|---|---|
| Channel set | Fixed catalogue | Discovered per brief |
| Price | Estimates inside the platform | Real rate card or marked unverified |
| Metric | Reach, impressions, efficiency | Cost per thousand attentive seconds, weighted by audience value |
| Output | Budget split with rationale | Ranked channels, each with a reason its gap survives and a contact |
| Action | Activates inside own platform | Drafts or sends vendor outreach |

Nearest rivals for the pitch: Ant10 (plans offline channels, but India-focused and from its own inventory), Stroby (newsletter matching), AdQuick (out-of-home marketplace). Detail in the idea file under Existing products.

## Steps 2 to 6

Summarised from the idea file's candidate design. Full reasoning and sources are there.

- Step 2, candidates: an LLM proposes places where the audience's attention sits, within one vertical.
- Step 3, gap filter: each candidate must name a reason its gap survives (information, constraints, behaviour or transformation), or it is rejected with the reason shown.
- Step 4, verification: a browser agent looks for a real rate card, media kit or contact. No result means unverified.
- Step 5, pricing: CPM beside cost per thousand attentive seconds, weighted by audience value, against a Meta baseline. Attention seconds and the Meta baseline are adjustable, with breakeven marked.
- Step 6, outreach: draft the enquiry, or fill the vendor's quote form.

## Data passed between steps

Proposed shapes, to be refined when building:

- `Brief`: the fields above.
- `Candidate`: channel name, type, why the audience is there, gap reason.
- `VerifiedChannel`: candidate plus price, price source link, contact, audience size, status (verified or unverified).
- `PricedChannel`: verified channel plus CPM, weighted cost per attentive second, breakeven seconds.
- `Outreach`: channel, draft message, status (drafted or sent).

## Open questions for this sketch

- Does step 1 take free text only, or a form? A form is simpler to build; free text is closer to what Basis and Ant10 do.
- Is customer value required? Step 5 needs it, but asking for it adds friction.
- One vertical or two for the demo? The idea file suggests one.
- Does the demo send real vendor emails, or stop at a draft? Also open in the idea file.
