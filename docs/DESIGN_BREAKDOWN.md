# CarryGo — Design Breakdown

## Release rule

**Upgrade, don't replace.** Approved visual direction remains intact unless a requirement explicitly asks for a new direction. The current branch restores the previously approved system typography and upgrades hierarchy, spacing, motion, loading, PWA behavior, and accessibility around it.

## Brand system

- Ink: `#0B0D0C`
- Paper: `#F3F3ED`
- Surface: `#FFFEF9`
- Line: `#D9D9D0`
- Green signal: `#B9FF35`
- Purple emphasis: `#8B67FF`

Black carries primary actions. Green communicates movement, availability, and positive state. Purple is intentionally reserved for a word or short phrase in a key heading. That restraint is what gives the emphasis its identity.

## Typography

The release is back on the **system UI typography direction** used before the recent font change. No new font family was introduced here.

Hierarchy comes from weight, scale, tracking, and line length. Important headings use a selected `<em>` word/phrase in CarryGo purple so the visual language repeats across Home, Do, Earn, Orders, Security, Privacy, Terms, Notifications, and shared status.

## Layout

CarryGo behaves like an app canvas rather than a marketing site:

- constrained desktop measure;
- compact mobile gutters;
- predictable card and section rhythm;
- primary actions close to the information they affect;
- 44px+ interaction targets and 48px form controls;
- safe-area padding around fixed mobile navigation;
- scroll padding so sticky/fixed UI does not hide focused content;
- consistent empty, loading, error, and success states.

## Interaction language

The interface uses motion to clarify state rather than decorate it:

- tactile button press;
- restrained hover sheen;
- page-entry motion;
- active mobile-navigation movement;
- product-tour spotlight;
- keyboard-safe offer sheet;
- swipe-to-reply messaging;
- desktop-only mouse-following eyes;
- branded loading pulse/orbits and progress sweep;
- online/offline status;
- install and update surfaces;
- reduced-motion fallbacks.

The eyes remain decorative and desktop-only. They are not part of the mobile interaction model.

## Navigation model

**Home · Do · Earn · Orders · You**

That maps directly to the two-sided campus network:
**create demand → satisfy demand → monitor execution → manage identity/money/security.**

The footer keeps the approved product language: **CarryGo · Your campus, your network.**

## Sector patterns deliberately borrowed

Taskrabbit emphasizes choosing the job and location, comparing people by rate/skills/reviews, chatting before booking, transparent pricing, and confidence mechanisms. Thumbtack similarly makes search, chat, price and reputation part of the hiring flow. Uber and Roadie emphasize delivery visibility, updates and communication; Roadie also uses proof-of-delivery and chain-of-custody concepts.

CarryGo applies the useful parts without copying the surface:
**post → agree → fund → move → handoff → close.**

## CarryGo-specific ideas

- **Route comprehension:** turn normal-language task descriptions into structured pickup/destination data before submission.
- **Route swap:** reverse pickup and destination without retyping.
- **Route suggestions:** recommend a fee/ETA using campus task history.
- **Handoff confidence:** the payer controls a private completion code.
- **Temporary shared status:** a single delivery can be shared without exposing account history.
- **Campus context:** school, academic units, landmarks and operational rules stay scoped to the selected campus.
- **Repeat task:** completed work becomes a quick starting point for another run.
- **Movement-based earning:** runners can select work that fits routes they already take.

## Accessibility

The current baseline includes visible focus, skip navigation, generous target sizing, labelled fields, dialog semantics, Escape behavior, focus looping in the offer sheet, reduced-motion handling, and scroll offsets for fixed navigation.

## Security and privacy

The visual layer follows the security model: server-backed auth, RLS, campus scoping, private handoff secrets, server-verified payments, privacy-scoped location, minimal analytics, no session recording, explicit analytics consent, and security response headers.

## Product feeling

The intended experience is a **real campus utility** rather than a delivery clone or a landing page pretending to be an app:

**orient quickly → act immediately → understand progress → regain control easily.**
