# CarryGo design breakdown

## 1. Design thesis

CarryGo is not designed as a delivery-company clone or a SaaS dashboard. It is a **campus execution network**: the interface should feel quick, local, trustworthy and useful when a student is busy, moving between locations or operating on a constrained connection.

The visual language is intentionally restrained:

- **Paper** canvas: warm off-white rather than sterile white.
- **Ink**: black/near-black for primary actions and strong hierarchy.
- **Electric green**: operational signal — active, available, progressing, successful.
- **Purple**: editorial emphasis — important words in headings, selected secondary states and lightweight conversational accents.
- Rounded surfaces, thin borders and wide soft shadows provide structure without turning the product into glassmorphism.
- Motion communicates state rather than decorating every element.

## 2. Typography decision

The rejected October 8 font change introduced Manrope and Space Grotesk as global font variables. That changed the visual character more than the requested consistency pass warranted.

The restored direction uses the earlier system grotesk stack:

'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

The important part is consistency:

- display headings use the same family;
- body copy uses the same family;
- prices and compact labels use the same family;
- no screen invents a new display font;
- heading emphasis uses **purple** consistently with <em>;
- primary CTAs remain black rather than purple;
- green remains the operational signal.

This keeps the earlier CarryGo personality while making the hierarchy predictable.

## 3. Landing page

The landing page is deliberately an **app surface first**, not a conventional marketing page.

The hierarchy is:

1. local context / campus state;
2. one large human sentence explaining what CarryGo does;
3. two clear jobs: **I need something** and **I want to earn**;
4. a compact three-step mental model;
5. authenticated users get their current campus and next task instead of marketing filler;
6. unauthenticated users get a restrained invitation to start.

The footer line — “CarryGo · Your campus, your network.” — works because it states the product's identity without pretending every user belongs to one university.

## 4. Spatial system

Stress-test complaints about “things being in weird places” usually come from inconsistent spatial rules rather than one isolated bad margin.

The launch polish therefore establishes:

- a shared shell width;
- predictable mobile gutters;
- a consistent page-top rhythm;
- common card/control heights;
- safe-area-aware bottom navigation;
- footer clearance for fixed mobile navigation;
- minimum practical touch targets;
- fewer nested margins;
- aligned section labels and card edges;
- mobile stacking instead of compressed desktop grids.

The goal is that unrelated screens still feel like they belong to the same application.

## 5. Interaction language

CarryGo uses small, purposeful interactions:

- buttons lift slightly on hover and settle on press;
- active navigation uses a moving green indicator;
- pages enter with a short vertical fade;
- route suggestions reveal themselves rather than appearing abruptly;
- message replies can be invoked through the reply affordance or swipe interaction;
- task parsing has an explicit “use this route” decision;
- toasts provide immediate confirmation without interrupting the flow;
- loading has motion, but it is not a full-screen animation spectacle;
- reduced-motion users receive the same state changes without decorative movement.

A micro-interaction is only justified when it answers one of three questions:

**What changed? What can I do now? Did my action work?**

## 6. Loading experience

The existing CarryGo loading identity was retained: logo + progress line.

It is upgraded rather than replaced:

- the wordmark remains the focal point;
- the original green loading line remains;
- a subtle purple/green orbit gives the empty space life;
- a short status caption gives the user context;
- aria-busy and a progress label improve assistive-technology communication;
- reduced motion disables the orbit.

This is deliberately lightweight because loading is part of the critical path.

## 7. PWA model

The PWA should behave like a product, not like a webpage wearing an install icon.

The manifest now includes:

- standalone display;
- portrait preference;
- maskable icon purpose;
- productivity/lifestyle categories;
- shortcuts for Post task, Earn and Orders.

The service worker:

- caches the shell;
- uses network-first navigation;
- falls back to the offline page;
- cleans old cache versions;
- does not cache API responses;
- tolerates registration failure without blocking the app.

This follows the modern PWA model in which the web app remains the foundation and service workers add reliability and installability.

## 8. Privacy model

The first-visit privacy surface is deliberately small.

Before sign-in, the user gets one choice:

- **Allow analytics**
- **Essential only**

The preference is stored locally. Product analytics is not initialized until the user grants optional analytics consent. Session recording and automatic click capture remain disabled.

This is intentionally different from a giant cookie wall: the product only asks for a decision that changes its behaviour.

## 9. Marketplace UX model

The strongest marketplace pattern observed in Taskrabbit is not a particular card style; it is the reduction of uncertainty:

- what is needed;
- where it happens;
- who will execute it;
- what they charge;
- when it will happen;
- what happens if something changes.

CarryGo therefore emphasizes task state, offer comparison, funding breakdowns, handoff protection and next actions.

DoorDash's design material similarly emphasizes the complexity of coordinating multiple actors and the need for consistent navigation, immediate feedback and accessible tracking. CarryGo applies that lesson to a campus-scale network rather than copying a food-delivery UI.

## 10. Accessibility model

The baseline is WCAG 2.2-oriented rather than “screen-reader labels added at the end”.

The implementation focuses on:

- visible focus;
- focus not being hidden under sticky UI;
- keyboard operation;
- labelled controls;
- accessible authentication;
- sufficiently large touch targets;
- reduced motion;
- status/error communication;
- colour never being the sole state signal;
- mobile ergonomics.

## 11. Security model

Security is part of the product architecture:

- Supabase RLS protects data boundaries;
- campus context is derived from authenticated identity;
- financial state is server/database authoritative;
- private API routes authenticate;
- service-worker caching excludes API responses;
- auth redirects use a canonical origin;
- open redirects are rejected;
- security headers are applied at the framework boundary;
- MFA is available;
- optional passwords have strength requirements.

The remaining hosted-provider gates are intentionally not hidden behind “looks secure”: Supabase leaked-password protection and production Vercel deployment/alias verification still require provider-side evidence.

## 12. What makes CarryGo different

The opportunity is not “Uber for campus”.

Useful product differentiation comes from **campus context**:

- a location directory that understands real campus places;
- natural-language task parsing that turns “get this from there and bring it here” into an editable route;
- repeated campus tasks becoming faster without copying sensitive payment state;
- temporary delivery status rather than permanent location exposure;
- execution checkpoints rather than noisy continuous tracking;
- utility-based streaks instead of generic gamification;
- transparent money states;
- route intelligence that becomes useful only from aggregate completed-task evidence.

The design should make those ideas feel obvious without making the user learn the underlying system.

## 13. Research basis

The research pass used current public guidance and product material:

- web.dev's PWA curriculum emphasizes responsive foundations, service workers, caching, installability, manifests, shortcuts and update strategy.
- W3C WCAG 2.2 guidance emphasizes visible/focus-safe interaction, target size and accessible authentication.
- Taskrabbit emphasizes clear task/location selection, comparable taskers, upfront rates, reviews, chat, payment protection and dispute resolution.
- DoorDash emphasizes multi-sided marketplace coordination, consistent navigation, performance, accessibility and immediate loading/error feedback.

The design principle taken from those products is **not visual imitation**. It is reducing uncertainty at the exact moment a user needs to make a decision.
