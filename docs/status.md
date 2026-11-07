# Status

Each feature is listed as built, mocked, planned or cut, with the tracks it serves.

- Built: records how it was verified, as the flow, the result, the date and the commit.
- Mocked: says what is faked and what the real version would need.
- Cut: keeps its line, with the reason.

- Cut: Revolut mispricing check with real data. Recomputes the source's airport figures from published prices, audience counts and attention studies, with attention seconds and the Meta price as sliders. Serves G-Research. Cut on 7 November 2026 by the pivot to the audience heatmap, which leaves out airports.
- Cut: airport placement ranking per startup. Ranks UK and EU airport placements by how well each airport's route and airline mix matches the startup's target customer, with published or estimated prices and a sent enquiry; two startups are compared side by side in the demo. Serves G-Research and Wordsmith. Cut on 7 November 2026 by the pivot to the audience heatmap, which leaves out airports.
- Mocked: onboarding form and results page, in `web/`, with stand-in server calls. The form is one fill-in-the-blank sentence plus borough toggles for markets. The results page lists the weighted tract columns, the 10 strongest tracts, the competitor agent's streamed steps and 12 placements to buy. Faked: Jev's column weights come from keyword matching on the target customer; the competitor agent replays a script with placeholder competitors "Competitor A" and "Competitor B", example.com source links and six real subway stations; placement costs, measurement methods and minimum spends are invented. Real: the tract scores are weighted sums of the real scaled tract columns, and the placements are real kiosks and shelters in the top 15 tracts. The map and the gap layer are not built yet, so placements come from the strongest audience tracts, not the gap. Swapping in the real backend means changing the exports in `web/src/lib/api.ts`, which match the types in `web/src/lib/contract.ts`. Serves G-Research, Wordsmith and HRT.
- Planned: New York audience gap map. Maps where a startup's target customers live, work and pass through, where competitors' outdoor campaigns already reach them, and the gap between the two, then lists placements to buy in the gap areas. Serves G-Research, Wordsmith (the competitor-campaign agent) and HRT.
