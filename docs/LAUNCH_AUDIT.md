| Campus directory map | Replaced the static decorative campus diagram with an interactive MapLibre/OpenFreeMap map. Coordinate-bearing places render as tappable markers with name popups; labels appear at closer zooms to avoid overlap. | Eight coordinate-bearing Bingham places verified in Supabase. Browser visual validation remains pending. |\n# CarryGo implementation verification audit

**Last reviewed:** 2026-10-11  
**Repository:** `FavourEjiogu/CarryGo`  
**Reviewed main commit:** `79bba630b0dbdf00e8356c8bba2b5e2fcb633244`

This document distinguishes code that exists from behavior that has been proven in the hosted production environment. A green build or a Vercel `READY` state is not an end-to-end production smoke test.

## Verified in the repository

| Concern | Finding | Status |
|---|---|---|
| Mobile hero's black visual panel | It was still rendered below the home CTA at mobile widths. This change hides it at widths below 800px. | Fixed in this change; visual device check still recommended |
| Mouse-following eyes | The UI was hidden by a late global CSS rule even on desktop, while the component still attached a global mouse listener on touch devices. This change restores desktop visibility, hides the entire black hero visual on mobile, and only attaches the mouse listener when `(hover: hover) and (pointer: fine)` matches. | Fixed in this change; verify in a browser |
| Purple heading emphasis | The shared CSS styles emphasized heading text with `--purple: #8B67FF`. | Implemented |
| Brand colours | Ink `#0B0D0C`, paper `#F3F3ED`, surface `#FFFEF9`, line `#D9D9D0`, green `#B9FF35`, purple `#8B67FF`. | Implemented |
| Typeface | Current code uses a system sans-serif stack; it does not bundle a named custom font. | Documented accurately |
| Icons | Shared icons are hand-authored inline SVGs; feature pages also use Lucide and Tabler icons. | Implemented, with more than one source |
| Rotating green CTA/card edge | `.energy-border` uses a conic-gradient and `energySpin`; the home primary CTA uses it. | Implemented on selected elements, not every CTA |
| Optional password | Sign-in supports password mode; Security and reset-password pages support password creation/update and strength validation. OTP remains available. | Implemented in code |
| Message reply | The task page has swipe-to-reply, a reply preview/quote, and the API stores `reply_to_message_id`. The live Supabase schema has that column. | Implemented in code/schema |
| Typing indicator | The task page polls participant presence and displays “They’re replying…”; the API restricts access to task participants and expires stale presence after six seconds. | Implemented in code/schema |
| Mobile low-network marketing copy | The home page does not mention 2G/3G/4G or advertise internal low-network implementation details. | Verified in home source |
| Campus neutrality | The home source does not hard-code Bingham/Karu; `docs/design.md` specifies campus selection during onboarding. | Verified in source/docs |
| PWA privacy | The service worker does not cache navigations, API responses, or arbitrary GET/RSC payloads. It caches the offline fallback and selected same-origin static assets. | Implemented in code |
| SEO and error recovery | App Router error UI, robots metadata and sitemap metadata exist. | Implemented in code |
| Runner task filters | All / Room eligible / Lower capital update the displayed task list. | Implemented in code |
| Analytics consent | PostHog initialization and event capture are gated on stored opt-in; Privacy allows changing the choice. | Implemented in code; hosted events not proven |

## Not yet proven / still needs an external check

1. **Supabase OTP email template — BLOCKING.** The app's OTP code path is present, but the hosted email template is a Supabase dashboard setting. Ensure the production Magic Link email template contains both `{{ .ConfirmationURL }}` and `{{ .Token }}`. Then request a real production OTP email and verify the six-digit code. Until that test passes, do not claim the OTP issue is fully resolved.
2. **Supabase redirect allowlist.** Vercel production has `NEXT_PUBLIC_SITE_URL=https://carrygo-chi.vercel.app`, and the code has the same canonical fallback. The hosted Supabase Site URL and redirect allowlist still need confirmation in the Supabase dashboard.
3. **Production auth smoke test.** Test sign-up, OTP sign-in, magic-link sign-in, callback, password reset/update and MFA against the production domain using a test account.
4. **PostHog delivery.** Vercel has production PostHog environment-variable entries, but consent gating, token validity and actual production events have not been confirmed with a live event.
5. **Production HTTP/browser checks.** The latest Vercel deployment for the reviewed main commit is reported `READY` with `carrygo-chi.vercel.app` assigned. The connected Vercel URL/runtime tools denied access during this review, so homepage, login, robots/sitemap, install and runtime logs were not independently smoke-tested here.
6. **PWA device checks.** The manifest currently uses one SVG icon with `any maskable` purpose. Verify installation icons and the install/update/offline flow on current Android and iOS devices.
7. **Reproducible installs.** The repository currently has no npm lockfile, and CI runs `npm install`, not `npm ci`. Generate and commit a real lockfile from a clean install before treating dependency resolution as fully reproducible.
8. **Data/schema change discipline.** Do not apply the deferred academic RLS migration from an old audit branch without comparing it to the current production policies/schema first.

## Other product requirements checked in source/database

These features have implementation surfaces; their presence is not a substitute for full end-to-end acceptance testing.

| Request | Evidence found | Status |
|---|---|---|
| FAQ and footer | `app/faq/page.tsx`; `src/components/AppShell.tsx` includes a footer with FAQ, leaderboard, referrals, reviews, security, privacy and terms. | Implemented |
| Loading screen and toasts | `app/loading.tsx`; `src/components/ToastProvider.tsx`. | Implemented |
| Tooltips | `components/ui/tooltip.tsx`; desktop/mobile navigation uses Radix tooltip wrappers. | Implemented |
| Optional 2FA | `app/security/page.tsx` enrolls, challenges, verifies and unenrolls Supabase TOTP factors. | Implemented in source; production account flow not smoke-tested |
| Weekly top-20 leaderboard | UI calls `get_weekly_leaderboard`; live database function scopes to the viewer's campus, uses Africa/Lagos Monday-week boundaries and returns ranks 1–20. | Verified in source and live DB function |
| Referral rewards | Live database trigger qualifies referrals on a referred user's completed errand and grants a free-errand credit for each fifth qualifying referral. | Verified in live DB function |
| Real testimonials | API accepts reviews from users who completed a task, inserts them as `PENDING`, and only displays `APPROVED` reviews. No fake review copy is hard-coded in the page. | Implemented; current review volume may be zero |
| Password strength / optional password | `components/ui/password-strength.tsx`, `app/security/page.tsx`, `app/reset-password/update/page.tsx`. | Implemented in source |
| Upload component | `components/ui/file-upload-05.tsx` exists. | Component exists; do not infer every flow uses it |
| Natural-language task parsing and place resolution | `src/lib/task-parser.ts`, `src/lib/place-resolution.ts` and their tests exist. | Implemented/tested at unit level; production accuracy needs real campus inputs |
| Runner comparison, task next action, repeat task, shared status and route intelligence | Task detail page contains runner scoring/sorting, status-specific next actions and repeat flow; shared status route exists; live database includes route intelligence functions/tables. | Implemented in source/schema; end-to-end flow not independently tested |
| At least 20 micro-interactions | Multiple CSS/Motion transitions, status cues, swipe replies, typing indicators, toasts, loading animations and CTA energy borders exist. There is no maintained inventory or automated count proving the exact `20+` acceptance threshold. | Partially verified; do not claim a measured count |
| Home feel and campus neutrality | Home source is campus-neutral and omits 2G/3G/4G marketing copy; internal low-network details are documented as engineering constraints. | Verified in source/docs |

## Production dependency failure

The reported `ETARGET` came from stale commit `c83e9ded...` on `fix/final-launch-polish`, which requested `@radix-ui/react-slider@1.3.7`. Current main declares the published `1.4.7`, and the production deployment was created from the merged main commit above.

## Release rule

Close a concern only when there is evidence at the right layer:
- source change for code behavior;
- passing CI for build/type/lint/test behavior;
- database inspection for schema claims;
- dashboard inspection for hosted settings;
- real browser/email/device smoke test for user-visible production behavior.

Do not use “deployed” as a synonym for “end-to-end verified.”


## Follow-on work: guided onboarding, maps, sharing and Brevo

This section tracks the current feature branch; do not interpret it as production-verified until CI, deployment, and live-flow checks pass.

| Area | Change | Remaining evidence |
|---|---|---|
| Product tour | Home first-run tour is now actually rendered, explains requesting a task, earning as a runner, and the Post → Agree → Move lifecycle; includes replay and skip/finish persistence. The previous home page created tour state but did not render the tour component. | Verify first-run, replay, mobile layout, keyboard and reduced-motion behavior in a browser. |
| Delivery map | Replaces the CSS-only route illustration with MapLibre GL JS and OpenFreeMap's keyless vector style; shows only real saved coordinates or recently shared GPS, and labels the dashed route as an approximation rather than navigation. | MapLibre tile loading, markers, attribution and location-sharing behavior still need a browser test. |
| Coordinate data | Current live query returned 45 Bingham campus-location rows and 0 with latitude/longitude. | Populate/verify place coordinates before expecting pickup and drop-off markers; do not invent them. |
| Branded share image | Task participants can generate a PNG status card bearing CarryGo branding and the short-lived status URL. Public status page has a visible CarryGo link and omits exact route labels and free-text task title. | Verify image download and public status link expiry in a browser. Normal OS screenshots are not automatically rewritten by a web app. |
| Brevo SMTP | Added `docs/BREVO_SETUP.md` with the intended Brevo-to-Supabase Auth configuration and test plan. No SMTP credentials were added to source. | Domain SPF/DKIM, Supabase custom SMTP, OTP template and real delivery must be configured/tested in provider dashboards. |
| Map/sharing handoff | Added `docs/MAP_AND_SHARING.md`. | Routing directions, ETA calculations and coordinate seeding are explicitly outside this lightweight map integration. |


## Shared status privacy change (PR #16)

The public status API now whitelists only status, update time, and expiry. Migration `20261011150000_reduce_shared_status_payload.sql` narrows the Supabase RPC response so token holders cannot fetch a task title or exact route text from that RPC. **The migration is included in this PR but has not been applied to production yet. Apply it after merge; until then, the live RPC still has its previous wider response.**


## Campus coordinates, route map, and motion polish — 2026-10-11

| Concern | Change | Verification |
|---|---|---|
| Bingham location coordinates | Seeded the user-supplied coordinates for Omega, Chief Seth Hostel, Portfolio, Newest Boys/Girls hostels, and three Girls New Hostels. | Live database query confirmed all eight names have coordinates; three Girls New Hostel rows were created, five existing rows updated. |
| Task route map | Default map view now opens around Bingham campus. Pickup/drop-off points come from `campus_locations`; the route stroke has a restrained pulse. | The map component and DB data are updated. The map still draws a straight-line estimate, not a road route or ETA. |
| Block wordmark | Added a Remotion block-deck wordmark for the CarryGo header. It lazy-loads, plays once per session, then uses a static fallback. | Repository code added; a successful hosted build and browser visual test are still required. |
| Purple emphasis | Purple emphasis now receives a left-to-right translucent highlighter sweep under the text. Reduced-motion preferences disable the sweep. | CSS added; visual check in production remains pending. |
| Supplied `mg-food-delivery-route` snippet | The supplied excerpt contains gallery metadata (`defFor`) and a demo importing an implementation file that was not included. It is not a standalone delivery-route React component, so the app continues using the existing production MapLibre component instead of copying unresolved imports. | Route map adapted in-place; no unrelated gallery-only Remotion composition was added. |

The two supplied labels **Girls New Hostel 3** and **Portfolio** are less than a few metres apart based on the coordinates provided. Both are retained as separate named places, but confirm those positions if they should represent distinct physical entrances.
