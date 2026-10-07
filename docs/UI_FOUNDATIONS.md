# CarryGo UI foundations

CarryGo uses Next.js, TypeScript and the App Router. The project now supports the current shadcn/ui structure with Tailwind CSS v4.

- Global styles: `app/globals.css`
- shadcn components: `components/ui`
- Shared utility helper: `lib/utils.ts`
- shadcn config: `components.json`

The existing CarryGo visual system remains the source of truth for product screens. shadcn components should be introduced where they improve interaction quality, not to replace the existing visual language wholesale.

The current Tailwind v4 setup follows the official PostCSS integration. The shadcn CLI can add future components into `components/ui`.
