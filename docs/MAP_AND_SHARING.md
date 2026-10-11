# Delivery maps and branded sharing

## Map stack

CarryGo uses MapLibre GL JS with OpenFreeMap's public vector-tile style:

`https://tiles.openfreemap.org/styles/liberty`

MapLibre is the open-source renderer; OpenFreeMap hosts the map style and tiles. For a campus-sized pilot, this removes the need to create a Mapbox account or ship a map API key. Keep the built-in map attribution visible. The service is convenient but externally hosted, so evaluate its current terms and operational needs before high-volume production use.

Official quick start: https://openfreemap.org/quick_start/

## Important coordinate prerequisite

The production schema has latitude/longitude fields for campus locations, but the latest read-only inspection found 45 Bingham University locations and **0 with coordinates**. The delivery map therefore only shows pickup/drop-off pins when real coordinates exist; when the runner or payer shares location, it can show recent live coordinates. The UI deliberately does not invent point locations from names or draw a fake route.

The dashed line between two geocoded points is a straight-line visual estimate only. It is not road routing or an ETA engine. If street-level navigation becomes necessary, add a routing provider separately and evaluate its licensing, coverage, limits, and privacy requirements.

## Branded share image

On a task screen, **Share live status** creates a short-lived two-hour link, and **Download branded image** creates a PNG status card with CarryGo branding and the share URL. Public share pages also show CarryGo branding and link back to the app. Exact pickup and drop-off details are intentionally not embedded in the public page or exported image.

A web app cannot reliably intercept the operating system's screenshot function and add a watermark to every screenshot a user takes. The downloadable branded card is the controlled, repeatable option; ordinary screenshots of other app screens are not automatically rewritten.

## Why the supplied Remotion snippet was not copied verbatim

The `mg-food-delivery-route.tsx` snippet imports project-specific kit files and types (`../../kit/spec`, `../types`, and `SceneSpec`) that are not part of CarryGo. It is a Remotion scene-definition helper, not a drop-in map component. CarryGo adopts the route-focused visual hierarchy while rendering real coordinate data in MapLibre, without adding a video-rendering runtime to the web app.

## Tile policy note

Do not treat the OpenStreetMap Foundation's `tile.openstreetmap.org` server as an unlimited free tile CDN. Its usage policy says the service has limited capacity and best-effort availability. Use an appropriate map-tile provider and retain attribution: https://operations.osmfoundation.org/policies/tiles/
