"use client";

import * as React from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

export type RouteCoordinate = {
  id?: string;
  name?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

export type LiveCoordinate = {
  latitude?: string | number | null;
  longitude?: string | number | null;
  updatedAt?: string | null;
};

type Coordinate = { latitude: number; longitude: number };

type DeliveryRouteMapProps = {
  pickupText: string;
  destinationText: string;
  pickupPoint?: RouteCoordinate | null;
  destinationPoint?: RouteCoordinate | null;
  runnerLocation?: LiveCoordinate | null;
  payerLocation?: LiveCoordinate | null;
  className?: string;
};

function validCoordinate(value: RouteCoordinate | LiveCoordinate | null | undefined): Coordinate | null {
  if (
    !value ||
    value.latitude === null ||
    value.latitude === undefined ||
    value.latitude === "" ||
    value.longitude === null ||
    value.longitude === undefined ||
    value.longitude === ""
  ) return null;
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) return null;
  return { latitude, longitude };
}

function isFresh(updatedAt?: string | null): boolean {
  if (!updatedAt) return false;
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return false;
  const age = Date.now() - timestamp;
  return age >= -30_000 && age <= 15 * 60 * 1000;
}

function elementForMarker(label: string, className: string): HTMLDivElement {
  const element = document.createElement("div");
  element.className = `delivery-map-marker ${className}`;
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", label);

  const dot = document.createElement("span");
  dot.className = "delivery-map-marker-dot";
  dot.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "delivery-map-marker-label";
  text.textContent = label;

  element.append(dot, text);
  return element;
}

export function DeliveryRouteMap({
  pickupText,
  destinationText,
  pickupPoint,
  destinationPoint,
  runnerLocation,
  payerLocation,
  className = "",
}: DeliveryRouteMapProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const markersRef = React.useRef<Map<string, MapLibreMarker>>(new Map());
  const [mapReady, setMapReady] = React.useState(false);
  const [mapError, setMapError] = React.useState("");

  const pickup = validCoordinate(pickupPoint);
  const destination = validCoordinate(destinationPoint);
  const runnerCandidate = validCoordinate(runnerLocation);
  const payerCandidate = validCoordinate(payerLocation);
  const runner = runnerCandidate && isFresh(runnerLocation?.updatedAt) ? runnerCandidate : null;
  const payer = payerCandidate && isFresh(payerLocation?.updatedAt) ? payerCandidate : null;

  const coordinatesKey = [
    pickup?.latitude, pickup?.longitude,
    destination?.latitude, destination?.longitude,
    runner?.latitude, runner?.longitude,
    payer?.latitude, payer?.longitude,
    runnerLocation?.updatedAt, payerLocation?.updatedAt,
  ].join("|");

  React.useEffect(() => {
    let disposed = false;
    let map: MapLibreMap | null = null;

    async function initialize() {
      if (!canvasRef.current) return;
      try {
        const maplibre = await import("maplibre-gl");
        if (disposed || !canvasRef.current) return;

        map = new maplibre.Map({
          container: canvasRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [8, 8],
          zoom: 5,
          attributionControl: true,
          pitchWithRotate: false,
          dragRotate: false,
          cooperativeGestures: true,
        });
        mapRef.current = map;

        map.on("load", () => {
          if (disposed || !map) return;
          map.addSource("carrygo-route", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "carrygo-route-line",
            type: "line",
            source: "carrygo-route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#8b67ff",
              "line-width": 4,
              "line-opacity": 0.9,
              "line-dasharray": [2, 1],
            },
          });
          setMapReady(true);
        });

        map.on("error", (event) => {
          if (!disposed && event.error) setMapError("The map could not load right now. The delivery details remain available below.");
        });
      } catch {
        if (!disposed) setMapError("Interactive map is unavailable on this device. You can still follow delivery status below.");
      }
    }

    void initialize();

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const entries: Array<{ key: string; label: string; point: Coordinate | null; className: string }> = [
      { key: "pickup", label: pickupPoint?.name || "Pickup", point: pickup, className: "pickup" },
      { key: "destination", label: destinationPoint?.name || "Drop-off", point: destination, className: "dropoff" },
      { key: "runner", label: "Runner · live", point: runner, className: "runner" },
      { key: "payer", label: "Other participant · live", point: payer, className: "payer" },
    ];

    for (const entry of entries) {
      const existing = markersRef.current.get(entry.key);
      if (!entry.point) {
        existing?.remove();
        markersRef.current.delete(entry.key);
        continue;
      }
      if (existing) {
        existing.setLngLat([entry.point.longitude, entry.point.latitude]);
        continue;
      }
      import("maplibre-gl").then((maplibre) => {
        const targetMap = mapRef.current;
        if (!targetMap || !mapReady || !entry.point || markersRef.current.has(entry.key)) return;
        const current = new maplibre.Marker({
          element: elementForMarker(entry.label, entry.className),
          anchor: "bottom",
        })
          .setLngLat([entry.point.longitude, entry.point.latitude])
          .addTo(targetMap);
        markersRef.current.set(entry.key, current);
      }).catch(() => setMapError("The map markers could not be loaded."));
    }

    const features = pickup && destination
      ? [{
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [pickup.longitude, pickup.latitude],
              [destination.longitude, destination.latitude],
            ],
          },
        }]
      : [];
    const source = map.getSource("carrygo-route") as import("maplibre-gl").GeoJSONSource | undefined;
    source?.setData({ type: "FeatureCollection", features });

    const points = entries.filter((entry) => entry.point).map((entry) => entry.point as Coordinate);
    if (points.length >= 2) {
      const west = Math.min(...points.map((point) => point.longitude));
      const east = Math.max(...points.map((point) => point.longitude));
      const south = Math.min(...points.map((point) => point.latitude));
      const north = Math.max(...points.map((point) => point.latitude));
      if (west === east && south === north) {
        map.easeTo({ center: [west, south], zoom: 15, duration: 450 });
      } else {
        map.fitBounds([[west, south], [east, north]], { padding: 64, maxZoom: 15, duration: 550 });
      }
    } else if (points.length === 1) {
      map.easeTo({
        center: [points[0].longitude, points[0].latitude],
        zoom: 15,
        duration: 450,
      });
    }
  // coordinatesKey intentionally represents the meaningful map input values instead of prop-object identities.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, coordinatesKey, pickupPoint?.name, destinationPoint?.name]);

  const knownRoute = Boolean(pickup && destination);
  const anyPosition = Boolean(pickup || destination || runner || payer);

  return (
    <div className={`tracking-map delivery-route-map ${className}`}>
      <div
        ref={canvasRef}
        className="delivery-map-canvas"
        role="img"
        aria-label={`Map for delivery from ${pickupText} to ${destinationText}`}
      />
      <div className="delivery-map-badge">
        <span className="delivery-map-live-dot" />
        {runner ? "RUNNER LOCATION AVAILABLE" : knownRoute ? "ROUTE LOCATIONS" : "DELIVERY MAP"}
      </div>
      <div className="delivery-map-note" aria-live="polite">
        {mapError || (knownRoute
          ? "Dashed line is a direct estimate, not turn-by-turn directions."
          : anyPosition
            ? "Showing available location signals. Add campus coordinates to enable pickup and drop-off pins."
            : "Map ready. Pickup and drop-off pins appear when campus coordinates are available or live sharing begins.")}
      </div>
      {!mapReady && !mapError && <div className="delivery-map-loading" role="status">Loading map…</div>}
    </div>
  );
}
