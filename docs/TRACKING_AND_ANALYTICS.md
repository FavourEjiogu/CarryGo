# CarryGo Tracking & Analytics

## Active delivery visibility

Only participants in an active delivery session receive the latest delivery location. Users are not permanently visible to the marketplace.

The system stores:
- latitude;
- longitude;
- accuracy;
- captured timestamp;
- monotonically increasing client sequence.

## Sampling

Adaptive target:
- slow 2G: ~90 seconds;
- 2G: ~60 seconds;
- 3G: ~45 seconds;
- 4G: ~30 seconds;
- immediate send if movement exceeds ~20m.

These are starting parameters, not promises. Client reliability and battery impact must be measured during pilot.

## Offline

A location write that cannot reach the server is appended to a local queue. On reconnection, queued points are replayed in order with idempotent sequence keys.

If location permission is denied, the delivery remains usable through status/checkpoint/manual location flows.

## Campus route analytics

Every delivery records lifecycle milestones. When enough observations exist, aggregate them by human-readable route labels:
- from_label;
- to_label;
- sample_count;
- average;
- p50;
- p90.

This enables sensible ETA suggestions without requiring Google Routes API for every task.

## Full-loop analytics

At minimum:
- task draft opened;
- task submitted;
- first offer;
- agreement accepted;
- funding verified;
- execution started;
- vendor reached;
- item confirmed;
- en route;
- handoff started;
- completion confirmed.

This gives the team actual answers to “how long does CarryGo take?” rather than relying on anecdotes.

## Privacy

Raw location is operational telemetry, not a product to sell. Retain it only as long as justified, aggregate route data, and avoid exposing a user's historical route trail.
