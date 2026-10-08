# CarryGo launch traceability

This is the acceptance ledger for the latest product instructions.

| Request | Implementation state |
|---|---|
| Make typography more consistent, not replace it | Restored the earlier system UI typography baseline; purple emphasis is standardised instead of replaced. |
| Keep purple emphasis on headings | Primary headings now use the same purple em treatment; pages without emphasis were upgraded where useful. |
| Improve the loading screen rather than changing its concept | The original CarryGo wordmark + loading rail are retained and upgraded with explanatory copy, pulse and reduced-motion handling. |
| Add micro-interactions | Existing page/card/nav/typing/reply/route motion was retained and extended with CTA feedback, loading, install and toast interactions. |
| Fix alignment and spacing | A unified spacing rhythm, shell width, mobile bottom-space reserve, grid gaps, form rhythm and focus-safe sticky action treatment were added. |
| Make landing page better without making it a different product | The existing hero/eyes/CTA language remains; the route example and proof strip add hierarchy and differentiation. |
| Cookies only once before sign-in | Added a one-time pre-auth cookie/device-storage notice with persisted acknowledgement. |
| PWA production hardening | Added 192/512 PNG icons, maskable icon, manifest scope/start URL, shortcuts, install prompt and safer service-worker caching. |
| Accessibility | Removed nested main landmarks, preserved labelled dialogs/focus handling, strengthened target sizing and focus visibility, and kept reduced-motion behaviour. |
| Security | Existing RLS/security headers/auth controls remain; service-worker private HTML leakage is removed. The Supabase leaked-password setting remains an operator action. |
| Sector research | Taskrabbit-style compare/trust flow was adapted to CarryGo's bid marketplace; active-order tracking principles were incorporated into task detail. |
| 200-item production PWA inventory | Added docs/PRODUCTION_PWA_200.md and mapped the relevant product/runtime gates; platform-dependent items are explicitly marked. |
| Design breakdown | Added docs/DESIGN_BREAKDOWN.md covering typography, colour, spacing, hierarchy, interactions, PWA, accessibility and research decisions. |
| Operator release state | GitHub branch is ready for review. Vercel is still scope-blocked; Supabase password-breach protection remains manual. |
