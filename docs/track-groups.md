# Track groups

Which sponsor tracks one project can enter together, and which MLH challenges fit any project. This is analysis, not a decision: the chosen tracks and challenges are recorded in the root `AGENTS.md`. Track briefs and rules are summarised in `event/tracks.md` and `event/challenges.md`.

The tracks fall into three groups that do not combine well with each other. Four challenges fit whichever group is chosen, and so does Metaview's overall prize.

## Group A: data, predictions and personal finance

Bank of Scotland, G-Research and HRT, with Wordsmith as a possible fourth.

- One personal-finance product can serve all three. It collects spending or price data and shows patterns people cannot normally see (G-Research), predicts what happens next, such as bills, price changes or time to a savings goal (HRT), and recommends a choice that balances cost, time and sustainability (Bank of Scotland).
- Wordsmith joins if a browser agent collects the data, for example by comparing supermarket baskets or energy tariffs across several sites. G-Research's brief allows teams to build their own data-collection tools. Wordsmith judges workflow complexity, so the agent needs many steps, not a single page scrape.
- Challenges that fit: Tiger Data, because prices and spending are time-series data, which also strengthens HRT; Auth0, because a finance app needs user accounts; Gemini, for the browser agent and recommendations; ElevenLabs, optionally, for spoken savings nudges.
- Solana is a weak fit, through savings rewards.

## Group B: developer tools

InstaLily and JetBrains.

- Both want an AI coding agent. One agent core could run headless under InstaLily's contract and also be wrapped as an Agent Client Protocol (ACP) agent for JetBrains Air. JetBrains also judges "agentic development process".
- InstaLily's code must live in InstaLily's team repository, not this one.
- InstaLily has a minimum bar: on an unseen project the agent must fix every one of a set of simple bugs, or the team is not ranked.
- At judging, InstaLily's models come only from its Gemini gateway. JetBrains lists the OpenAI API, Koog or a custom model; whether Gemini is acceptable there is unconfirmed.
- InstaLily requires the editor to be open source or the team's own. JetBrains Air is probably neither, so the InstaLily entry would need a separate editor.
- Wordsmith is a weak fit. InstaLily's sandbox blocks outbound traffic except to the gateway and listed sites, so a browser agent would only work in the JetBrains version.
- Challenges that fit: Entire, strongly. Gemini is borderline, because InstaLily's Gemini models come through an OpenAI-compatible gateway rather than the Gemini API directly.

## Viridien on its own

Viridien wants a computer-vision pipeline that extracts lithological intervals from scanned geological reports, using a fixed dataset of 50 images. It overlaps with no other track; G-Research, framed as hidden data in PDFs, is a stretch.

Viridien judges correctness, efficiency and simplicity, so adding technology for challenge prizes is likely to cost marks. It suits one teammate working in parallel as a separate module. Vultr GPUs are the only challenge that would help.

## Metaview's overall prize fits any group

Metaview's prize goes to the best project of the event, with no theme, so any project can compete for it. No judging criteria are given. A broadly impressive, polished demo is the safest bet, which favours Group A's consumer-facing product over Viridien's narrow pipeline. Metaview's own product is AI for hiring, but nothing suggests a hiring theme earns extra marks.

## Challenges that fit any group

| Challenge | Why it fits any group | Caveat |
|---|---|---|
| Entire | It judges how the team works, not what it builds, and the team already works with several coding agents. | Its setup goes in the root `AGENTS.md`, which needs approval to change. |
| Gemini | Every group except Viridien uses a language model. Free key from Google AI Studio. | Borderline for InstaLily, as above. |
| Vultr | Hosts the backend or demo, or runs Viridien on GPUs. Free credits on sign-up. | Does not apply to InstaLily's agent, which runs in InstaLily's sandbox. |
| Auth0 | Login is cheap to add to any web app. | No use for a command-line agent or the Viridien pipeline. |

Tiger Data and ElevenLabs fit only Group A. Solana fits no group well.

## Reach of each group

Every group can also compete for Metaview's overall prize. Group A with Wordsmith reaches four sponsor tracks plus Entire, Gemini, Vultr, Auth0 and Tiger Data, with no conflicting rules. Group B reaches two tracks, and InstaLily's contract alone is a large amount of work. Viridien reaches one track.
