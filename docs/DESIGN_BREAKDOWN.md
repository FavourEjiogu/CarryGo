# CarryGo Design Breakdown

## 1. Design intent

CarryGo is designed as a campus execution network, not as a generic food-delivery clone. The interface should feel useful, calm and slightly alive: strong hierarchy, compact information, direct actions, and motion that explains state rather than decorates it.

The refinement rule is additive: preserve working surfaces and upgrade clarity, rhythm, accessibility, security and delight without replacing the product's visual identity.

## 2. Visual language

| Token | Value | Role |
|---|---|---|
| Ink | #0B0D0C | primary text, primary actions, navigation emphasis |
| Paper | #F3F3ED | application canvas |
| Surface | #FFFEF9 | cards, fields, elevated content |
| Line | #D9D9D0 | quiet boundaries |
| Muted | #6D7069 | secondary text and metadata |
| Green | #B9FF35 | action energy, success emphasis, active movement |
| Purple | #8B67FF | expressive accent used for deliberate heading words |

The green is operational; the purple is editorial. Purple is deliberately concentrated in emphasized heading phrases rather than scattered through controls.

## 3. Typography

The recent custom Google-font treatment was intentionally removed. CarryGo returns to a system UI stack so the product keeps the earlier compact, familiar feel across browsers and devices.

The hierarchy is:

- Body: system UI, 14px base, approximately 1.55 line-height.
- Lead copy: approximately 17px with a relaxed 1.65 line-height.
- Headings: heavy system UI weight, restrained negative tracking.
- Emphasis: heading em phrases render in CarryGo purple.
- Labels/eyebrows: compact uppercase metadata with increased letter spacing.

The important consistency rule is simple: one type family, one weight language, one accent treatment.

## 4. Spatial system

The shell is capped at 1180px and uses responsive gutters rather than fixed desktop offsets.

The layout uses an 8px-ish rhythm:

- 8px: micro gaps, badges, icon spacing.
- 12–16px: controls and card internals.
- 18–26px: card padding and small section separation.
- 28–42px: major section spacing.
- larger responsive clamp values only for hero composition.

At narrow widths, columns collapse intentionally instead of squeezing text or controls. Page headers wrap rather than forcing buttons off-screen. Footer links wrap into multiple lines instead of creating horizontal scroll.

## 5. Navigation

The primary app shell is task-first:

Home → Do → Earn → Orders → You

The active state is visible, keyboard navigation is supported, and mobile navigation is persistent enough for one-handed use without obscuring the page. A skip-to-content control is available for keyboard and assistive-technology users.

The footer wording remains:

CarryGo · Your campus, your network.

That sentence anchors the product around network utility rather than delivery logistics.

## 6. Landing page

The landing page keeps the existing visual direction but improves its rhythm:

1. Campus context / product eyebrow.
2. Large promise with one purple-emphasized phrase.
3. Plain-language explanation.
4. Two primary jobs: request help or earn by executing.
5. A compact trust strip that explains the commercial flow.
6. The existing visual Post / Agree / Move motif.
7. The existing task/process explanation.
8. Contextual campus and next-action surfaces for signed-in users.
9. A reassuring first-time section for unsigned users.

The landing page should feel like the front door to the actual app, not a marketing microsite.

## 7. Loading experience

The loader was upgraded rather than replaced.

The existing centered CarryGo wordmark and moving progress line remain. The refinement adds:

- a small orbital brand mark,
- green/purple motion consistent with the main palette,
- a lightweight loading status sentence,
- a soft surface and depth treatment,
- reduced-motion behavior.

This means the loading screen feels intentional without becoming a splash animation that delays the application.

## 8. Micro-interactions

CarryGo uses motion to communicate action:

- route enter transitions,
- button press feedback,
- card hover lift on pointer devices,
- animated progress bars,
- animated typing indicators,
- swipe-to-reply message behavior,
- copy-success states,
- animated toast entry/exit,
- route suggestion appearance,
- loading motion,
- the desktop-only cursor-eye detail.

The desktop eyes are explicitly pointer/fine-input behavior. They are hidden on touch/coarse devices because a phone should not pretend it has a mouse.

Every motion system includes reduced-motion handling.

## 9. Task marketplace patterns

CarryGo borrows proven mechanics from adjacent products, but adapts them to campus execution.

TaskRabbit demonstrates the value of asking for task + location, presenting trusted workers with visible rates/reviews, and letting users clarify details before booking. CarryGo uses the same trust sequence but adds campus-aware locations and a negotiation/agreement stage.

Glovo demonstrates that an execution product feels more trustworthy when the active state is visible and tracking is treated as part of the transaction rather than as a separate map feature.

Jiji demonstrates the value of fast posting, chat, notifications, verification and user-controlled marketplace interactions. CarryGo keeps those patterns lightweight and campus-scoped.

## 10. CarryGo-specific interaction ideas

### Natural-language route understanding
Users can say what needs doing in one sentence. CarryGo conservatively detects pickup and destination, then shows the suggestion before applying it.

### Route swap
The pickup/destination swap control prevents users from having to clear and re-enter a task when they simply reversed the direction.

### Agreement before funding
The user sees runner, fee and ETA before money is locked. This makes negotiation explicit instead of hiding it inside checkout.

### Handoff PIN
The payer chooses a private handoff code and only releases it at physical handoff. The code is part of the execution state, not a chat secret.

### Temporary delivery-only sharing
A shared-status link exposes the minimum context required to follow one task without exposing the user's account history.

### Repeat
A completed task can be recreated rather than rebuilt manually. This is particularly valuable for recurring campus errands.

### Campus-aware places
Known locations are canonical when confidence is high, while ambiguous or unknown names remain editable. The system assists without pretending certainty.

## 11. Privacy UX

A first-visit consent surface appears only on entry surfaces before sign-in.

The baseline is:

Only essential — session functionality continues.

Allow analytics — optional product analytics can begin.

The product analytics client is only initialized after that choice. CarryGo keeps PostHog persistence in memory, disables autocapture, disables automatic pageviews/pageleaves, disables session recording and respects Do Not Track.

Essential auth/session cookies remain functional.

## 12. PWA architecture

The manifest now declares:

- stable app identity,
- campus-neutral description,
- / start URL and scope,
- standalone display,
- explicit 192px and 512px icon entries,
- theme/background colors.

The service worker caches the public shell only. It does not cache API responses and does not cache private account routes such as Orders, Wallet, Profile or You. This avoids a class of stale/private-content leakage problems when different users share a device.

The offline page remains a first-party CarryGo experience instead of falling back to a browser error page.

## 13. Accessibility

CarryGo's baseline includes:

- semantic landmarks,
- keyboard navigation,
- visible focus indication,
- skip navigation,
- labelled icon controls,
- expanded/collapsed state,
- inline error announcements,
- dialog semantics for the tour,
- focus trapping and Escape handling,
- large navigation targets,
- reduced-motion support,
- colour-independent task state communication.

## 14. Security posture

Security is treated as a product property:

- public database tables use RLS,
- academic data is campus-scoped,
- sensitive account data is fetched in authenticated contexts,
- internal redirects are constrained,
- production uses HTTPS,
- security headers are set at the edge,
- API responses are not placed in the service-worker cache,
- service-role credentials are not placed in browser code,
- payment state is confirmed server-side,
- price changes require explicit approval.

The Supabase security advisor currently has one remaining dashboard-level warning: leaked-password protection must be enabled for Auth.

## 15. Production visual checklist

Before final launch, visually inspect at minimum:

- 320px phone,
- 360px phone,
- 390–430px phone,
- tablet width,
- 1024px desktop,
- 1280px desktop,
- keyboard-only navigation,
- reduced motion,
- long names,
- long location names,
- long error messages,
- empty states,
- slow loading,
- offline navigation,
- installed standalone mode.

The most important rule is that the UI should never solve a spacing problem by shrinking the type until it becomes hard to read.