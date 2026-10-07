# CarryGo — Bingham Karu Product Specification

## Product thesis

CarryGo is a campus execution network, not a generic delivery clone. Customers describe work in their own words; runners negotiate both price and time; the platform coordinates task funding, evidence, tracking and settlement.

## Campus source of truth

Operational behavior supplied by the founder/user is authoritative for CarryGo's Bingham implementation. University handbook material is reference context, not a replacement for observed campus practice.

Launch campus: Bingham University, Karu.

Operating hours:
- 05:00–22:00: marketplace active.
- After 22:00: CarryGo sleeps.
- A delivery already in progress may finish inside a hostel-only completion flow; no new ordinary marketplace jobs begin after 22:00.

Known residential locations:
- Old Boys: Abel, Abraham, Daniel, Enoch, Moses, Noah, Samson, Barak, Emmanuel, Gideon.
- New Boys: Chief Seth Oshatoba Hostel, Portfolio Hostel.
- Newest Boys Hostel.
- Old Girls: Shera-Agwai, Abigail, Dorcas, Deborah, Esther, Hannah, Keturah, Lois, Naomi, Rehab, Ruth, G.R.A.
- New Girls: Mama Tuman Nkut (Rebecca, Mary), Margaret Gowans, Stephen Panya Baba.
- Newest Girls Hostel.

Known food/merchant locations:
Student Central Cafeteria, Echo-Fresh, Ngozika, Omega, Nabiss, S.S Mawato, Munch Box, Ultimate, JustEat, Melons Pack, Green Plaza.

Students are expected to know their campus. CarryGo therefore uses lightweight free-text location fields first; runners can clarify by chat. The internal Campus Graph exists for analytics, matching, ETA and visual context rather than forcing students through a map.

## Delivery modes

### Meet-up
Payer specifies a place/landmark in their own words. Any eligible runner may execute.

### Hostel delivery
Payer specifies the hostel and optional block/detail. Any eligible runner may execute.

### Room delivery
Room delivery is **always same-gender** and is priced above normal hostel delivery. A runner/customer gender mismatch cannot be accepted for a room task. The extra room premium belongs in the runner's payout economics.

## Task lifecycle

Post → offers → price/ETA negotiation → agreement → funding → start → vendor/pickup checkpoints → en route → handoff → proof → completion → settlement → reputation/streak.

## Tracking

During an active delivery, the payer and runner can see the delivery participants' latest location. Tracking is session-scoped, not continuous marketplace surveillance.

The client uses adaptive location sampling, compact payloads, local buffering and sync on reconnect. Core task execution does not depend on map tiles.

Raw location retention target: 30 days, then delete or aggregate for route statistics.

## Analytics

Capture timestamped lifecycle events to calculate:
- time to first offer;
- time to agreement;
- order-placement time;
- funding time;
- vendor preparation/pickup time;
- route travel time by origin/destination label;
- handoff time;
- full task-loop duration;
- p50/p90 route timing;
- runner route efficiency;
- supply/demand by campus zone.

Use aggregated/coarsened metrics for product analytics; do not expose an individual's historical movement pattern.

## 2G contract

A user must still be able to:
1. open CarryGo;
2. post a task;
3. receive the current task state;
4. negotiate;
5. track an active job;
6. confirm completion,

without downloading a heavy map, a video, a large image bundle or a third-party analytics SDK.

The service worker caches the shell. Offline drafts and tracking updates can queue locally. Realtime is an acceleration layer, not the source of truth.

## Runner economics

A runner sees item capital requirement, runner fee, ETA and any room premium before acceptance. Runner float is explicit. CarryGo never silently finances an unapproved price increase.

## Trust

Identity, reliability and economic eligibility are separate. Trust increases through completed behavior, not through paid status.

## Safety/product boundaries

No illegal goods, drugs, weapons, fraud, impersonation, academic cheating, account credential delivery or other prohibited work.

