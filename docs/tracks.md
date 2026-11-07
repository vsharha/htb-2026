# Sponsor tracks

The same project can be entered into any number of these tracks, and can win more than one. Track titles come from the sponsor table, `reference/tracks/sponsor-table.png`. Prizes come from the same table, with detail added where the sponsor's own material gives more. Each section has these fields:

- Source: the sponsor's own material in `reference/tracks/`, when there is any.
- Brief: what the sponsor asks for.
- Deliverables and Rules: what must be handed in, and constraints on how, when the sponsor states them.
- Judging notes: what the sponsor says it judges on.

## HRT: Best Use of Data for Predictions & Decision Making

- Prizes: 1st PlayStation 5s; 2nd keyboards.
- Source: `reference/tracks/hrt/challenge-track.png`
- Brief: the slide describes HRT's own work rather than a task. It names three themes:
  - Massive scale: ingesting streams of market data across global exchanges.
  - Diverse inputs: combining orderbook feeds, market data and alternative datasets into predictive features.
  - Real-time ML: statistical models that turn raw data signals into automated decisions.
- Judging notes: none given. The track title implies judging on how well the project uses data to predict and decide.

## G-Research: Make the invisible visible

- Prizes: 1st Nintendo Switch 2s. No other places listed.
- Source: `reference/tracks/g-research/` (challenge and stand slides)
- Brief: choose something that's hard to observe and show what data about it is hidden, how to find it, and what can be done with it. Teams can build tools to collect their own data or dig into public data. Examples given: your own sleep or study habits, how a music genre changes over time, a market's mood.
- Judging notes: none given beyond the brief's three questions: what is hidden, how it is found, and what it enables. The slides point teams to the G-Research stand for more detail.

## JetBrains: Help the Developer

- Prizes: 1st €350 each; 2nd €150 each.
- Source: `reference/tracks/jetbrains/` (case description, judging criteria, OpenAI access and resources slides)
- Brief: build something that simplifies developers' lives. Suggested starting points are a routine test creator that uses repository context and conventions, a codebase-aware refactor suggester, or the team's own idea.
  - AI: the OpenAI API, JetBrains' Koog agent framework, or a custom model.
  - JetBrains tools: an IDE plugin, or an Agent Client Protocol (ACP) agent run through JetBrains Air.
- Deliverables: an ACP agent, web app, plugin, desktop app or mobile app.
- Rules: JetBrains can provide OpenAI API access for the project on request, but it must not be used for writing the project's code.
- Resources slide: links to Air and the Air plugin, Junie (free Junie Lite option), the ACP specification, ACP Kotlin SDK, ACP Registry, the Koog ACP guide (Kotlin, JVM only, beta) with an example agent in the Koog repository, and the IDE Plugin Generator (IntelliJ IDEA 2026.1+ with Plugin DevKit: File | New | Project | IDE Plugin). The links are only in the slide image.
- Judging notes, in priority order:
  1. Implementation and proof of concept.
  2. User experience and interface.
  3. Innovation and creativity.
  4. Agentic development process.
  5. Presentation.

## Bank of Scotland: Smart Cost of Living

- Prizes: 1st £150 Amazon gift card per person; runners-up £75 Amazon gift card per person. The slides are branded Lloyds Banking Group, Bank of Scotland's parent company.
- Source: `reference/tracks/bank-of-scotland/` (challenge and prizes slides)
- Brief: everyday financial decisions involve trade-offs between cost, time, convenience and sustainability. Build something that helps customers navigate these trade-offs and make better decisions about their money and everyday lives.
  - The approach is open. Suggested options are AI, optimisation, behavioural nudges, personalised recommendations, challenges or rewards, gamification and data visualisation.
  - Teams define what "better" means: spending less, saving towards a goal, more sustainable choices, freeing up time, or balancing several priorities.
- Judging notes: none given beyond the slide's tagline, "Build boldly. Solve something real."

## Wordsmith: Make the most complicated end-to-end agentic AI browser-use workflow

- Prizes: 1st AirPods Max for each team member; 2nd and 3rd Wordsmith goodie bags.
- Source: `reference/tracks/wordsmith/slides.pdf`
- Brief: build the most complicated end-to-end agentic AI workflow that uses a browser. Wordsmith is an AI platform for in-house legal teams. A legal focus is preferred but not required; creativity is.
- Judging notes:
  - Main criterion: workflow complexity, meaning how complex a workflow the team managed to make.
  - Also considered: tokens used, model used, and time to complete the task.

## InstaLily: Build a coding agent that adapts to whoever's using it

- Prizes: 1st a fast-track interview at InstaLily and Sony WH-1000XM5 headphones for each team member; 2nd a Logitech MX Master 3S mouse for each team member. Every team gets feedback from four InstaLily engineers.
- Source: `reference/tracks/instalily/challenge-brief.pdf` and `agent-contract.pdf`
- Brief: build an agentic IDE, an AI agent inside an editor that helps people debug, refactor and build real software. It adapts to whoever is using it: what it says, how much it explains, whether it acts or asks first, and how it teaches. InstaLily looks for an agent that:
  - Works on real code: finds the actual cause, makes fixes that hold up, and is honest about what it did.
  - Reads people: works out who it's helping and adapts without being told.
  - Is built for someone: besides a beginner and an engineer, the team picks one more persona and explains who, why and how.
  - Is the team's own: start from an open-source project or the team's own code, for both the editor and the agent. Only what the team adds is scored.
- What teams get: a private team repository with a starter agent, a Dockerfile, the manifest and a team kit; the judging environment to run locally; Gemini models through InstaLily's gateway, with a US$50 development key per team.
- Deliverables: everything must be on `main` in the InstaLily team repository by 12:00 on Sunday 8 November. The repository becomes read-only at 12:02. It needs a `hacktheburgh.yaml` manifest at the root naming the persona and every open-source project the agent is based on. The README must list those projects too.
- Rules from the agent contract:
  - The agent runs headless as one command, `agent`, once per user message. The message arrives on standard input, only the newest one. The reply is everything written to standard output, and the exit code must be 0. Clarifying questions go at the end of the reply.
  - Each message is a fresh process. Memory between messages goes in `STATE_DIR`. The project being worked on is a git repository in `WORKSPACE`, committed by the evaluator after each message.
  - Models come only through InstaLily's OpenAI-compatible gateway, read from environment variables at runtime, never hard-coded: `strong` (Gemini 4 "Argon"), `fast` (Gemini 3.8 Flash), and `embed` (Gemini Embedding 2). Effort is capped at medium. The development key allows 60 requests per minute with no top-ups. Development can use any provider, but judging always uses the gateway.
  - Each message may take up to 10 minutes and a session up to 60 minutes. Time to first byte on standard output is recorded, and responsiveness counts.
  - The sandbox is Debian 12 on linux/amd64 with 2 CPUs and 4 GB memory. Outbound traffic goes only to the gateway and listed sites, through `HTTP_PROXY` / `HTTPS_PROXY`. Package registries are blocked during a run, writes are limited to `WORKSPACE`, `STATE_DIR` and the temp folder, and no process may outlive the agent.
  - Test projects are private Python 3.12 codebases with dependencies installed, tested with `python -m pytest`.
  - A fix counts when the hidden tests pass, at most 30 lines change in Python files outside `tests/`, no lines are removed from existing tests, nothing is suppressed (`noqa`, `type: ignore`, skip or xfail markers, `except: pass`, removed asserts), and every changed file still parses with no new unused import.
  - The image builds from InstaLily's base image, for linux/amd64, within 10 minutes. Before judging it must answer two messages with no network and no model within 60 seconds, keeping `STATE_DIR` between them. The kit's `kit check` runs the same check.
- Judging notes:
  - Minimum bar: on an unseen project, the headless agent must cleanly fix every one of a set of simple bugs. Teams that miss it aren't ranked.
  - Automated tests: the same conversations on unseen projects with simulated users. Code checks what code can check, such as whether a bug is fixed. An AI judge assesses how the agent treated the user.
  - Reviewers: four InstaLily engineers visit each table at 12:30 on Sunday. That visit is the demo. They judge the experience, the chosen persona and how well it was served, the thought put into users, and engineering quality.
  - Final: the three strongest teams present at about 13:30. Results are at the 15:00 closing ceremony.

## Viridien: Automate lithological interval detection, depth mapping, pattern clustering, and legend classification

- Prizes: 1st AirPods 5 with wireless charging case for each team member, and £100 of fossils from Mr Wood's Fossil Shop in Edinburgh's Grassmarket. No other places listed.
- Source: `reference/tracks/viridien/presentation.pptx`
- Brief: lithology columns are diagrams in geological reports that show rock types at different depths using colours, symbols and patterns. They are mostly stored in PDFs and extracted by hand. Build an automated solution that, for each document image:
  - Identifies individual lithological intervals and their boundaries.
  - Groups intervals with the same or similar visual patterns.
  - Determines the top and base depth of each interval.
  - Maps each group to its legend entry to get the lithology name.
  - Bonus: locates the depth column, interpreted lithology column and legend without the supplied bounding boxes.
- The approach is open. The suggested one is to segment the column, cluster similar patterns, match them to the legend, and convert pixel positions to depths.
- Dataset: 50 document images with annotation files giving bounding boxes for the depth column, interpreted lithology column and legend. Manually annotating development images for training, tuning and validation is allowed. Held-out evaluation images are released near the end.
- Deliverables, per document:
  - A CSV with one row per interval: `top_y`, `bottom_y` (pixels), `cluster_id`, `lithology`, `top_depth`, `base_depth`.
  - An annotated image of the lithology column showing predicted boundaries, depth estimates, and cluster or lithology labels.
  - In the demo: explain the approach, show results and limitations, and report runtime and resource requirements.
- Rules: final predictions must be generated without manual correction.
- Judging notes: judged on correctness and efficiency. Viridien also asks teams to consider:
  - Correctness on challenging cases.
  - Generalisation to unseen documents.
  - Efficiency: processing time, memory, hardware and running costs.
  - Simplicity: complexity only where it improves results.
  - Automation.
