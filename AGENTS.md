# Agent Contract — CarryGo

## Mission
Build a reliable, campus-first execution marketplace. The core object is a Task Contract: what must be done, by whom, for how much, by when, with what proof, and what happens if either side fails.

## Non-negotiables
- Never mutate balances directly. Financial state moves only through an auditable double-entry ledger.
- Never trust the browser for authorization, money state, or lifecycle transitions.
- Never treat `authenticated` as authorization. Scope access to the resource, campus, and role.
- Never store raw handoff secrets; store hashes and bound attempts.
- Never permanently confiscate collateral from a complaint alone. Dispute, evidence, decision, then settlement.
- Never use user-editable auth metadata for authorization decisions.
- Never expose payment provider secrets to the client.
- Preserve an event trail for money, state, proof, disputes, moderation, and sanctions.

## Product principles
1. Make posting an errand take less than a minute.
2. Show price, ETA, trust and capital requirements before acceptance.
3. Let the market negotiate instead of hiding tradeoffs behind opaque pricing.
4. Make both payer and runner accountable.
5. Optimize for campus density before geographic expansion.
6. Use repeat tasks, templates, route bundling, and earned privileges as habit loops.
7. Prefer simple, explainable mechanisms.
8. Default to low-data UX and landmark/zone locations.

## Engineering defaults
- Next.js App Router on Node runtime.
- Supabase/PostgreSQL for durable state; Realtime is not authoritative for money.
- Money is integer kobo (`BIGINT`), never floating point.
- Every external webhook is authenticated and idempotent.
- Critical transitions run in database transactions or a narrow transaction-safe service layer.
- RLS is enabled on exposed tables and tested as an application boundary.
- Sensitive evidence is minimized and access-controlled.

## Change discipline
Before adding a feature, answer:
- Which user problem does it solve?
- Does it increase liquidity, trust, repeat usage, or contribution margin?
- Does it add a new money movement or regulatory surface?
- Can it be explained in one sentence?
- Can it fail safely?

Challenge requests that fail these tests instead of adding complexity.
