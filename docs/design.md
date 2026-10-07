# CarryGo Design System & Product UI Direction

## North star

CarryGo should feel like a real, trusted mobile product, not a student project and not a generic SaaS dashboard.

The visual idea is **utility with energy**: bold typography, high-contrast actions, a restrained paper/ink canvas, one electric green signal, and a purple secondary accent. Motion should communicate state and life rather than decorate empty space.

CarryGo is a **campus execution network for Nigeria**. The interface must never hard-code one university into the global brand. Campus-specific identity, locations, merchants, rules and operating hours are selected after authentication and are data-driven.

## Brand language
- Product name: **CarryGo**
- Voice: direct, youthful, confident, useful.
- Avoid corporate filler.
- Avoid emojis.
- Prefer short action language: **Post it. Agree. Fund it. Move.**
- Never shame a user for an error.
- Explain money, privacy and delivery state plainly.

## Colour system
| Token | Value | Use |
|---|---|---|
| Ink | #0B0D0C | primary text, primary CTAs, dark surfaces |
| Paper | #F3F3ED | page canvas |
| Surface | #FFFEF9 | cards, sheets, forms |
| Line | #D9D9D0 | borders/dividers |
| Muted | #6D7069 | secondary copy |
| Green | #B9FF35 | active state, progress, success signal, brand energy |
| Purple | #8B67FF | emphasis, selected secondary state |

Green and purple are accents, not body-copy colours. Primary actions stay black.

## Typography
- Use the project's bold grotesk direction consistently.
- Display text is heavy, tight and very large.
- UI labels are compact, uppercase and strongly weighted.
- Body copy is readable; muted copy is reserved for secondary information.
- Numbers are heavy and tight for prices, streaks and ETAs.

## Shape and depth
- Large containers: 20–30px radius.
- Controls: 12–16px radius.
- Pills are for status/filter metadata, not every control.
- Borders are subtle; shadows are soft and wide.
- Dark surfaces may use green glow/rings sparingly.
- Do not turn the whole app into glassmorphism.

## Motion
Motion is part of the product language, not decoration.
Use Motion/CSS for page entrance, step transitions, sheets, optimistic state changes, progress and lightweight status cards. Do not animate every card or ship large effects that punish low-end devices. Respect prefers-reduced-motion. Short UI transitions are generally 150–280ms; larger moments may be 350–600ms.

## Interaction model
Primary navigation: Home, Do, Earn, Orders, You. Mobile uses fixed bottom navigation; desktop uses the same information architecture in top navigation.

Every screen has one obvious primary action. Secondary actions are visually quieter.

Bottom sheets are appropriate for runner offers, confirmation, compact filters and mobile contextual actions. Sheets need a semantic dialog role, a close/cancel path, Escape handling on desktop, keyboard focus management and safe-area padding.

## Onboarding
1. Verify email.
2. Name + phone.
3. Choose school/campus.
4. Optional faculty/department.
5. Optional gender for same-gender room delivery.

Campus is required because it determines the marketplace. Academic fields should not be forced when they do not improve the product.

Never show Bingham University · Karu as a global brand statement. It belongs only in the campus-specific experience when the user's selected campus is Bingham.

## Authentication
CarryGo uses passwordless email authentication. The sign-in screen separates Sign in and Create account, explains that no password is required, provides **Keep me signed in**, confirms when the link is sent, and recovers from expired/invalid links.

Email redirects must use the canonical production URL, never an accidental localhost origin. Persistent sessions are opt-in by the user and explained in one sentence.

## Home
The home screen is an app dashboard, not a marketing landing page.

Unauthenticated: explain the product quickly, show **I need something** and **I want to earn**, show the three-step mental model and demonstrate personality through restrained motion/state cards.

Authenticated: greet the user, surface current tasks, show streak/earned discount, and show useful local context without exposing implementation details.

Do not hard-code a campus name in the global home.

## Task UX
Core loop: **Post → Offers → Agree → Fund → Move → Handoff → Settle**.

Always expose current state, agreed price, agreed time, who owns the next action and what the user should do next. Do not make users infer state from colour alone.

## Money UX
Prices use Nigerian naira formatting. Always distinguish item capital, runner fee, room premium, CarryGo service fee, streak discount, total funded amount and withdrawable runner earnings.

Never let the client be the source of truth for balances or settlement.

## Low-network UX (internal)
Keep core screens light. Avoid map tiles for core execution. Prefer typed locations and campus suggestions. Cache the shell, queue safe writes such as location samples, show honest retry/offline states, and never cache private financial/API responses in a public service-worker cache. These are engineering constraints, not marketing claims; do not surface them as product features on the home screen.

## Accessibility
Minimum bar: semantic headings and landmarks; visible focus states; keyboard navigation; labelled inputs; role=alert for recoverable errors; dialog focus management; roughly 44px touch targets; reduced-motion support; colour never being the only state indicator; readable errors adjacent to the affected control.

## Responsive behaviour
Mobile is the primary design target. Desktop expands the same product rather than becoming a different application. Preserve one-thumb actions, bottom sheets, compact cards, short labels and safe-area-aware navigation.

## Content rules
Good: “Fund task”, “Request price change”, “Share my location”, “Check your email”, “You have 8 minutes left”.

Bad: corporate filler, vague success messages, or errors without recovery.

## Reference philosophy
CarryGo may take interaction inspiration from 21st.dev, Aceternity UI, Magic UI and Motion, but it must not become a component collage. Borrow interaction principles; keep CarryGo's own visual grammar.

## Engineering guardrails
- No global campus-specific copy.
- No client-trusted financial state.
- No private data in public caches.
- No animation that blocks interaction.
- No UI feature without a user job it improves.
- No large dependency for a small effect.
- No decorative map dependency in the critical path.

## Implementation delta · October 2026

The global home and footer are campus-neutral. The onboarding flow asks for the user's school or campus after authentication, using live campus data with search and a clear selected state. Academic details remain optional.

Task location suggestions are now fetched for the signed-in user's selected campus from the campus_locations directory. The client still allows free-text locations when a place is not in the directory.

The dashboard derives all market counts and task context from the authenticated user's campus_id. No application-level global campus identifier is used for marketplace data.

Authentication callbacks resolve through NEXT_PUBLIC_SITE_URL, reject non-HTTPS canonical origins in production, and require a campus as part of onboarding completion. Keep me signed in remains explicit and is stored in the existing session-cookie strategy.

Security response headers are applied at the framework boundary. The service worker continues to avoid caching API responses. The campus_locations RLS policy now enforces same-campus reads instead of the previous tautological campus comparison.

The visual implementation intentionally keeps the existing CarryGo grammar: paper/ink canvas, black primary actions, electric green state signals, purple emphasis, bold grotesk type, rounded cards, restrained Motion, and thumb-friendly mobile controls.

Reference libraries such as 21st.dev, Aceternity UI, Magic UI and Motion are treated as interaction references rather than a component dependency list. Every borrowed pattern must improve a real user job.

## Release gate

A release is not considered complete merely because the UI looks finished. The evidence gate is:

- production build passes;
- automated tests pass;
- TypeScript and lint checks pass;
- Supabase security and performance advisories are reviewed;
- protected financial mutations are server/database authoritative;
- RLS policies are reviewed for cross-user and cross-campus access;
- auth redirect configuration is verified in the Supabase dashboard;
- production runtime errors are reviewed after deployment;
- any unverified external setting is recorded as a launch blocker rather than assumed away.
