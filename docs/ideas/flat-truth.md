# Flat Truth: rental checks with tribunal record

Status: proposed, 7 November 2026.

## Idea

A renter pastes an Edinburgh rental listing. A browser agent checks the flat and the landlord against public records that renters almost never look at: the Scottish Landlord Register, the Edinburgh HMO licence register, the Scottish EPC register, the Scottish Assessors' council tax bands, and every published tribunal decision about unprotected deposits.

It returns three things. First, problems: illegal fees, since an "admin fee" is illegal in Scotland, and whether the landlord is registered. Second, the true monthly cost: rent plus council tax, energy estimated from the EPC rating, and commute time. Third, the landlord's tribunal record, such as "2 deposit findings", each linked to its decision. It is for students and other renters deciding whether to sign.

## Origin

Raised by AI agents in a brainstorm on 7 November 2026, at macmac's request. Three of four agents generating ideas independently proposed a version of it. An advocate agent fact-checked it on the web, and a judge agent ranked it first of all the ideas in `docs/ideas/` (see [idea-ranking.md](../idea-ranking.md)).

## Evidence and data

This comes from agents' web checks on 7 November 2026 and has not been re-checked by a person.

- Confirmed: premiums are an offence under the Rent (Scotland) Act 1984, section 82. Section 90(1) has covered admin fees since 2012, and section 88 lets tenants recover them.

## Tracks it could serve

- Wordsmith: strong. It is legal by nature, which Wordsmith prefers, and the workflow is long, with each step feeding the next: read the listing, check fees against statute, search several government sites with different forms, match tribunal decisions, write the report. Tokens, model and time should be shown, since Wordsmith also judges those.
- G-Research: strong. The hidden thing is whether the landlord is registered and has broken the rules. It is found by cross-checking public registers. It enables a renter to avoid a bad landlord or claim money back.
- Bank of Scotland: strong. Rent is the biggest cost of living, and the true monthly cost weighs cost (rent, council tax, energy), time (commute) and sustainability (EPC rating).
- HRT: weak. A model trained on about 1,000 tribunal decisions could predict a likely award range, but that is neither market data nor real-time.

## Challenges it could use

- Gemini API: reading listings, statutes and decision PDFs, and driving the browser agent.
- Auth0: saving a renter's checked flats.

## Open problems

These come from agents' web checks on 7 November 2026 and have not been re-checked by a person.

- Deposit checks need the tenant's details. All three Scottish deposit schemes ask for the tenant's surname, deposit amount, postcode and start date, so a deposit can't be checked for a flat you are only viewing. Either drop the deposit check or add a mode for sitting tenants, using a teammate's tenancy with their consent.
- Tribunal names may be redacted. The decision lists name the respondent, but at least one late-2025 decision PDF is redacted. If recent decisions hide the landlord, the tribunal record doesn't work.
- Defamation. Calling named landlords "rogue" is risky in front of a legal sponsor. Show only facts linked to decisions, match on exact address or registration number and never on similar names, show no individual's home address, and say it is not legal advice.
- Bot protection on the registers is untested. Plain fetches showed no captcha, but JavaScript protection only shows in a real browser.
- Awards are often small; one recent award was £50 for a slightly late deposit. Show a range from similar cases, never "up to 3× your deposit".
- Rent data is coarse. Scottish Government rent statistics cover 18 areas, and all of Edinburgh falls in Lothian.
- Other teams in Edinburgh will likely build renting apps, mostly rent calculators. Cross-checking registers and tribunal decisions is what sets this apart.

## Scope

Paste one real Edinburgh listing. Live browser panes check the registers, fees are flagged with the statute cited, the true monthly cost appears, and the tribunal record shows a real finding for this landlord. End on a map of deposit findings across Edinburgh. Keep a recorded run as a fallback.

Check in the first two hours that recent tribunal decisions still name the landlord, that at least 4 of 6 registers load in an automated browser, and that one current listing links to a landlord with a tribunal decision. If the first or last check fails, switch to [Fine Print](fine-print.md).

## Alternatives

- [Fine Print](fine-print.md): better data and stronger on HRT, but no Bank of Scotland fit and a less relatable demo.
- [Room Radar](room-radar.md): the same tracks and easier to build, but a much smaller problem.
- [Overpaid](overpaid.md): merges this idea with household bills, so it is wider but shallower.
