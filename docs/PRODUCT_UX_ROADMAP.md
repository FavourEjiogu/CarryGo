# CarryGo next product & UX roadmap

CarryGo should win on reduced friction and trusted execution, not feature count. The following priorities are intentionally ordered by user value.

## P0 — Make the first task feel almost automatic

### Natural-language task composer
Users write a request in normal language. CarryGo extracts pickup, destination, quantity, obvious timing and task intent into editable fields.

Examples:
- “Get 2 bottles of water from Green Plaza and bring them to Portfolio 214.” → Green Plaza → Portfolio 214
- “Please collect my documents at Senate and take them to New Hostel.” → Senate → New Hostel

Never silently invent a location. Show the detected route and make it one tap to accept or edit.

### Smart place matching
When extracted text resembles a known campus place, resolve it against the campus location catalog and show the canonical label.

Example:
“green plz” → “Green Plaza”.

Keep the original text available when confidence is low.

### Route swap
One tap to reverse pickup and destination. This is particularly useful for runners reusing a task pattern.

### Task presets
Remember non-sensitive choices such as the last delivery mode, typical ETA range and common task category. Do not persist private task content automatically.

## P1 — Remove repeated work

### Repeat a previous task
Orders should have “Do this again” and “Edit & repost” actions that clone the safe structural fields without copying sensitive payment or handoff state.

### Saved places
Let a user name frequent places:
- Home
- Room
- Favorite shop
- Lecture hall

Saved places are private to the account and filtered by campus.

### Smart defaults
Use campus context to preselect the most common delivery type and suggest likely destinations after the user starts typing.

### Better offer comparison
Runner cards should emphasize:
- agreed fee;
- ETA;
- completion count;
- verification level;
- recent reliability;
- relevant route history.

Do not over-rank users using a hidden score without explaining what matters.

## P1 — Make execution clearer

### State-aware task screen
Change the task screen based on what the user needs next:
- waiting for offers;
- choosing an offer;
- funding;
- runner is at pickup;
- price change needs approval;
- handoff ready;
- completed.

One dominant action per state.

### Shared live status
A task participant should be able to share a temporary, non-account-management status link that shows only the minimum information necessary for that delivery.

Never expose historic location.

### Delivery checkpoints
Instead of forcing continuous tracking, make milestone confirmations first-class:
picked up → on the way → near drop-off → handoff.

### Handoff confidence
Before revealing a handoff code, give the payer a clear “Only share this when the runner is physically here” instruction.

## P1 — Money UX

### Transparent funding breakdown
Keep item budget, runner fee, service fee and any premium visually distinct.

### Wallet guardrails
Show:
- available balance;
- amount needed;
- shortfall;
- exact action to resolve it.

Never make users calculate the difference.

### Price-change preview
When a runner requests a higher item price, compare old vs new in one view and show exactly how much extra funding is required.

## P2 — Better marketplace intelligence

### Price suggestions
Estimate a reasonable runner fee from historical completed tasks on the same campus and route class. Present it as guidance, never as a forced price.

### ETA suggestions
Suggest ETA based on route history, task type, time of day and current execution state.

### Merchant-aware tasks
When an input names a known merchant, offer structured options such as product search, pickup notes and opening-hour awareness.

### Route learning
Aggregate completed route observations into anonymous campus route estimates.

## P2 — Trust and growth

### Referral loop
Give users a simple referral link after their first successful task, not immediately during signup.

### Streaks with utility
Keep streak rewards tied to useful savings or better access, not gamification for its own sake.

### Reputation after completion
Ask for a lightweight post-delivery rating with optional structured reasons. Avoid forcing a long review form.

### Dispute assistant
Guide a user through the evidence needed for a dispute:
what happened → what was agreed → what changed → what evidence exists → what outcome is requested.

## UX principles behind the roadmap

- Ask for information only when it becomes useful.
- Convert free-form intent into structured state, but always let the user correct it.
- Never make users understand CarryGo’s internal architecture.
- Never make a destructive action one accidental tap away.
- Show the next action more prominently than the entire workflow.
- Explain money before asking for money.
- Explain privacy at the moment location, identity or payment information is requested.
- Preserve user-entered text when automation is uncertain.
- Make repeated campus actions faster over time without becoming creepy or opaque.
