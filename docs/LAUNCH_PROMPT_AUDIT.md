# CarryGo Launch & Prompt Audit — 2026-10-08

## User instruction that governs this pass

Unless a change is explicitly requested, existing behavior and design should be upgraded rather than replaced.

## Requirement audit

| Requirement | Result | Evidence / implementation |
|---|---|---|
| Revert disliked typography | ✅ | Removed the recent Manrope/Space Grotesk font loading and restored the system UI stack. |
| Keep purple heading emphasis | ✅ | Heading em phrases consistently use #8B67FF. |
| Make purple emphasis consistent | ✅ | Global h1–h6 emphasis rule plus app-title coverage. |
| Improve loading screen without replacing it | ✅ | Existing wordmark + progress line retained; orbital mark, status copy, depth and reduced-motion behavior added. |
| Add micro-interactions | ✅ | Route transitions, button feedback, card lift, toasts, typing cue, swipe reply, progress motion, loading motion and desktop-only eyes. |
| Desktop-only mouse eyes | ✅ | Pointer/fine-input media rules hide the effect on touch/coarse devices. |
| Fix alignment and spacing | ✅ | Responsive shell gutters, page-header wrapping, mobile grid collapse, footer wrapping and mobile CTA alignment. |
| Fix product tour | ✅ | Home now renders the Tour component; tour has Escape handling and focus trapping. |
| Cookies once before sign-in | ✅ | Privacy consent appears only on / and /login until a choice is stored. |
| Optional analytics consent | ✅ | PostHog is no longer initialized automatically; it initializes only after analytics consent. |
| Keep analytics privacy-friendly | ✅ | Autocapture/pageviews/pageleave/session recording disabled; memory persistence and DNT retained. |
| PWA manifest | ✅ | Campus-neutral identity, stable scope/id, standalone display and explicit icon entries. |
| Protect private data from service-worker cache | ✅ | Only public shell/utility pages are cached; private app routes and /api remain network-only. |
| Accessibility | ✅ | Skip link, shell landmarks, focus states, labelled controls, dialog semantics, focus trap, Escape and reduced motion. |
| Security | ✅ | Existing RLS/auth/header/payment safeguards retained; academic RLS evaluation optimized without widening access. |
| Supabase RLS performance warning | ✅ | faculties and academic_departments policies now evaluate auth.uid() via a scalar subquery. |
| Research top sector apps | ✅ | TaskRabbit/Glovo/Jiji patterns incorporated into UX rationale and product surfaces. |
| Design breakdown | ✅ | docs/DESIGN_BREAKDOWN.md |
| 200 production PWA checklist | ✅ | docs/PRODUCTION_PWA_200.md |

## Deliberate non-changes

- Footer wording remains: CarryGo · Your campus, your network.
- The visual language remains black/green/purple with the existing campus-network character.
- The desktop eyes were not generalized to mobile.
- The loading screen was not replaced with a different splash concept.
- Existing task, tracking, funding, streak, referral, merchant and security mechanics were preserved and refined.

## Known external release gates

- Supabase Auth leaked-password protection still requires dashboard configuration.
- Vercel team access remains blocked by the connected workspace's 403 scope error; production alias/live smoke testing cannot be truthfully certified until that access is restored.
- Final visual QA still benefits from real-device testing at narrow phone, tablet and desktop widths after the release branch is deployed.