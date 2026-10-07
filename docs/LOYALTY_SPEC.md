# CarryGo Loyalty & Challenges

## Discount bank

Every qualifying week adds **5 percentage points** to the user's discount bank. Maximum bank: **100%** after 20 weeks.

A user may spend any amount of their available bank at any checkout.

Example:
- Bank = 35%.
- User applies 10%.
- New bank = 25%.
- The remaining 25% remains available.
- The current streak itself does not reset because a discount was used.

The discount applies to **CarryGo's own service fee only**. Item capital and runner compensation are never discounted.

## 20-week reward

At 20 qualifying weeks, unlock one CarryGo-sponsored eligible errand. CarryGo sets the sponsor cap and eligibility rules.

The 20-week reward is distinct from the discount bank.

## Streak rescue

Rescue tokens are earned through sustained consistency. The current implementation target is one token for every four demonstrated best-streak weeks, capped at two.

A rescue token preserves a user's current streak after a missed week when redeemed within the allowed rescue window.

## Birthday boost

Once per year during the user's configured birthday window, add a configurable +5 percentage points to the discount bank.

## Semester boost

During a configured semester kickoff window, add a configurable +5 percentage points to the bank.

## Merchant-sponsored streak week

A participating merchant can sponsor a +5 percentage point campaign. The sponsor is clearly disclosed. CarryGo caps total campaign liability.

## NACOS / association challenge

Student associations can publish shared goals such as:
- 100 completed CarryGo tasks in seven days;
- 50 first-time runners;
- 25 completed hostel deliveries.

Rewards can be rescue tokens, service-fee credits or merchant-funded offers.

Challenges are transparent shared goals, not randomized gambling-like rewards.

## Abuse controls

- One qualifying week per rolling calendar week.
- Duplicate/combat events must be idempotent.
- Reward issuance is server-side.
- Campaigns have start/end timestamps and optional redemption caps.
- Referral, challenge and boost rewards must not be applied twice for the same qualifying event.
