# 2G & Near-Zero-Cost Deployment Contract

## First screen

The critical first screen must not require:
- web fonts from third parties;
- Google Maps;
- video;
- analytics scripts;
- large image downloads.

Use local/system typography, CSS/SVG illustration and the internal campus graph.

## Maps

Use the internal schematic graph for the core product. Add MapLibre/OpenStreetMap when real tile rendering materially improves outcomes, and keep an adapter so the provider can be changed later.

Google Maps is a paid option, not a dependency. Current Google subscriptions start at $100/month for 50,000 included combined calls, so it should not be used as the MVP default.

## Hosting

Vercel's Hobby tier is for personal/non-commercial use. CarryGo can use it for private/demo work, but a commercial operation needs a commercial-compatible hosting plan.

## Backend

Supabase's Free tier currently includes 500 MB database, 50,000 monthly active users, 5 GB egress, 1 GB file storage, 500,000 Edge Function invocations and 2 million Realtime messages. This makes it suitable for the early prototype; production scale and backup requirements should trigger a plan review.

## Bandwidth behavior

Prefer:
- tiny JSON payloads;
- server-rendered HTML where possible;
- cacheable GETs;
- optimistic updates;
- local draft state;
- explicit pending/synced states;
- paginated feeds;
- compressed evidence;
- no map tiles on the transaction-critical path.
