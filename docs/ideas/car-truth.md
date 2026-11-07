# Car Truth: check a used car before you buy it

Status: proposed, 7 November 2026.

## Idea

A buyer pastes a used-car listing, from AutoTrader, Gumtree or a dealer's own site. An agent checks the car and the seller against public records most buyers never look at. It spots mileage that has been wound back, faults flagged at past MOTs, open safety recalls, and whether the car may enter Edinburgh's Low Emission Zone. It predicts what the car will cost to keep running and to repair, and tells the buyer what to ask the seller. If the car turns out faulty after purchase, it drafts a rejection letter under the Consumer Rights Act. It is for anyone buying a used car, often a first car on a tight budget.

## Origin

Raised by an AI agent on 7 November 2026, in a brainstorm at macmac's request. macmac asked for an idea as strong as [Flat Truth](flat-truth.md) but not about finding homes, because a similar housing project won at last year's event. It keeps Flat Truth's pattern: before someone commits money, check the other side against public records, flag what breaks the rules, and show the true cost. Its web facts are unchecked.

## How it works

1. Read the listing: registration number, price, advertised mileage, seller and whether finance is offered.
2. Look up the car's full MOT history by registration. Compare the mileage at each test. A drop between tests, or an advertised mileage below the last test, flags possible clocking.
3. Collect the faults and advisories from past MOTs, and check the DVSA recall checker and the vehicle's tax and emissions details.
4. Check whether the car meets the Low Emission Zone standard for Edinburgh and other Scottish cities.
5. If the seller is a dealer, check it on Companies House. If it offers finance, check it on the FCA register.
6. Predict the chance of failing the next MOT and the likely repair cost. A model trained on bulk MOT results would learn from cars of the same make, model, age and mileage, and from the faults already flagged on this car.
7. Work out the true yearly cost of ownership: price spread over expected life, fuel, road tax, insurance group and predicted repairs.
8. Output a report: red flags with their sources, the true cost, questions to ask the seller, and a fair price compared with similar listings. After purchase, draft a Consumer Rights Act rejection or repair request if a fault appears within the legal windows.

## Existing products

Not checked on the web yet.

- Paid check services such as HPI and carVertical already report outstanding finance, write-offs and mileage problems, and the government's MOT history page is free. The difference has to be the prediction of future costs from MOT data, the true cost of ownership, the emission-zone check and the legal follow-up in one flow, not the lookup alone.
- Outstanding finance and insurance write-offs come from private databases, so this idea probably can't check them for free.

## Tracks it could serve

- HRT: strong. Bulk MOT results give real data at scale, which HRT's slide talks about. A model turns it into a prediction (failure chance and repair cost) and a decision (buy, negotiate or walk away). It is the strongest HRT dataset of any idea, if the bulk data is as large and open as expected.
- G-Research: strong. The hidden thing is a car's real history: wound-back mileage and faults the seller doesn't mention. It is found by cross-checking public records, and it lets a buyer avoid a bad car or negotiate the price down.
- Bank of Scotland: strong. A car is one of the biggest purchases most people make, and the true cost of ownership weighs cost, time (reliability), convenience and sustainability (emissions and the emission zone).
- Wordsmith: moderate to strong. The workflow is long and runs across several government sites, ending in a Consumer Rights Act letter. The legal content is lighter than tenancy law.

## Challenges it could use

- Gemini API: reading listings and MOT advisory text, and drafting letters.
- Tiger Data: MOT results and car-price time series.
- Auth0: saving the cars a buyer has checked.

## Open problems

Nobody has checked these on the web yet.

- Whether DVSA's bulk MOT data is still published openly, how large it is, and whether it includes mileage and advisories. The HRT case depends on this.
- Whether the MOT history API needs an application and how long approval takes. The public MOT history web page may have to be used by browser instead.
- Whether the Low Emission Zone checker for Scottish cities can be queried automatically.
- Outstanding finance and write-off status are in private databases, so the report can't promise a full history check, and must say so.
- Students buy cars less often than they rent flats, so the problem may feel less urgent to student judges, although most judges have bought a car.
- The Consumer Rights Act windows and remedies for used cars need checking before any letter cites them.

## Scope

Paste one real used-car listing. Live panes open the MOT history, recall checker and emission-zone checker. The mileage chart shows a drop between two MOTs, flagged as possible clocking. The faults flagged at past MOTs turn into a predicted repair bill, and the report shows the true yearly cost against the asking price. End on the buyer's questions for the seller and a drafted rejection letter for a fault found after purchase.

## Alternatives

- [Flat Truth](flat-truth.md): the same pattern for rentals, with stronger legal content, but a similar housing project won last year.
- [Fine Print](fine-print.md): also strong on HRT, but with no Bank of Scotland fit and a less relatable demo.
- [Shelf Truth](shelf-truth.md): also catches hidden changes to what people buy, but depends on supermarket sites that block bots.
