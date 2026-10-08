# CarryGo design breakdown

CarryGo uses a campus-native execution-network visual language: practical enough for a task marketplace, expressive enough to feel like a real product rather than an admin dashboard.

## 1. Design premise
The product is built around one mental model: Post → Agree → Move.
The interface should reduce cognitive load at the exact moment a user is trying to do something. Screens lead with the next useful action, keep secondary details nearby, and avoid decorative UI that competes with the task.

## 2. Typography
The latest production polish restores the earlier typography feel: the product uses **Manrope for body/UI text and Space Grotesk for display headings**, exactly as in the pre-regression revision. This is a restoration, not a new typography system.
Headings use heavy weight and tight tracking. Intentional emphasis uses the same purple treatment everywhere: h1/h2/h3/h4 em → purple.
The rule is emphasis, not decoration: only the meaningful word or phrase is purple. Body copy remains neutral and readable.

## 3. Colour grammar
- Paper: warm off-white canvas.
- Ink: near-black for primary actions and high-contrast surfaces.
- Green: CarryGo's action/accent colour, currently #B9FF35.
- Purple: #8B67FF, reserved for heading emphasis and selected expressive moments.
- Red/orange: reserved for errors, danger and irreversible warnings.
The system avoids turning every surface into a coloured component. Colour has meaning.

## 4. Spatial system
CarryGo uses a compact 4px-based spacing rhythm: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48.
Cards, forms, navigation and sections align to this rhythm. Mobile pages reserve additional bottom space because the navigation is fixed and touch targets must not be obscured.

## 5. Layout hierarchy
A normal product page follows: context label → heading → supporting explanation → primary action → task content → secondary information.
The landing page follows the same hierarchy, but adds one expressive visual panel and a compact proof strip.

## 6. Landing page
The landing page has four jobs: explain what CarryGo does; give a first-time user one obvious way to start; explain the loop without a wall of copy; demonstrate why it is different from a generic delivery marketplace.
The proof strip highlights three product truths: campus-aware places, agreement before funding, and delivery status in one place.
The visual panel retains the desktop-only moving eyes. A route example was added without turning the screen into a fake live map.

## 7. Loading experience
The loading screen keeps the existing CarryGo identity and upgrades it instead of replacing it. It retains the wordmark and loading rail, while adding a calmer brand pulse, explanatory copy and a small animated dot cue.
The animation collapses to a static state under prefers-reduced-motion.

## 8. Micro-interactions
Micro-interactions are short and functional: page entrance, button press feedback, CTA icon travel, mobile active indicator motion, restrained energy-border motion, loading pulse, skeleton loading, typing indicator, swipe-to-reply messaging, route suggestion reveal, PWA installation reveal and toast entrance/exit.
The rule is feedback, not theatre. Motion tells the user that the interface noticed their action.

## 9. Mobile/PWA behaviour
Mobile is the primary interaction model. Fixed navigation is safe-area aware and uses touch-sized targets. Forms become single-column where necessary. Sticky primary task actions remain reachable without covering the mobile navigation.
The manifest now includes 192px and 512px PNG icons, a maskable icon, start_url, scope, shortcuts, theme/background colours and a campus-independent description.
For Chromium browsers the app offers an in-page install affordance through beforeinstallprompt; iOS receives a platform-specific Home Screen instruction because that event is not supported there.

## 10. Offline and caching
The original service worker could cache authenticated page HTML such as wallet, profile and orders. That was a privacy risk on shared devices.
The new service worker caches public navigation pages and static assets only. API responses, RSC/fetch payloads and authenticated page HTML are network-only. A private navigation that loses the network falls back to the public offline screen rather than returning stale personal data.

## 11. Accessibility
The product uses semantic headings, a single main landmark, aria-current navigation state, labelled dialogs, keyboard focus management for the offer sheet, live status messaging, visible focus styling and reduced-motion support.
Fixed navigation and notification surfaces are treated as part of the focus and target-size problem. This follows WCAG 2.2 focus and target-size guidance.

## 12. Sector research translated into CarryGo
Taskrabbit's current flow is a useful benchmark: choose a task and location, compare providers using price and trust signals, chat, schedule and confirm. CarryGo adapts the useful pattern to a bid-based campus runner model instead of copying Taskrabbit's hourly marketplace.
Delivery products teach another strong pattern: once an order is active, tracking and next actions should become the centre of the interface. CarryGo reflects this through the order screen's Do this now action, explicit status flow, live telemetry and temporary delivery-only sharing.

## 13. CarryGo-specific differentiators
- Campus-scoped location intelligence rather than a generic map-first experience.
- Route-aware fee/ETA suggestions from completed campus routes.
- Trust-aware runner offer ranking.
- Explicit agreement before funding.
- Protected item-price adjustments with evidence and approval.
- Same-gender room delivery rules.
- Temporary delivery-only status links.
- Handoff-code verification.
- Repeatable task flows.
- Reliability, streak and reward loops.

## 14. Interaction rules
Primary actions are black unless the green edge treatment has a clear purpose. Purple is not a second primary CTA colour.
Buttons are touch-sized, icon-only controls need accessible labels, and financially meaningful operations explain the consequence before execution.

## 15. Production content resilience
The design must survive long campus names, long task descriptions, empty states, failed network requests, small screens, keyboard navigation, reduced motion, browser zoom and slow connections.
Stable layout primitives and natural text wrapping are preferred to hard-coded visual positioning.

## 16. Governing change rule
Unless the user explicitly asks to change an existing visual or interaction, the design should be upgraded rather than replaced.
This release restores the previous typography baseline, standardises purple heading emphasis, upgrades the loading screen, fixes the page-landmark structure, tightens spacing, makes runner filters functional, protects private HTML from service-worker caching, adds cookie/install surfaces and improves the landing hierarchy without replacing the product language.