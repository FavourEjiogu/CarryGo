"use client";

import * as React from "react";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";

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
  deliveryStatus?: string;
  runnerLabel?: string;
  payerLabel?: string;
  className?: string;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

function validCoordinate(
  value: RouteCoordinate | LiveCoordinate | null | undefined,
): Coordinate | null {
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
  return age >= -30_000 && age <= 3 * 60 * 1000;
}

function relativeAge(updatedAt?: string | null): string | null {
  if (!updatedAt) return null;
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return null;
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  return Math.floor(minutes / 60) + "h ago";
}

function createRunnerFigure(): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 28 30");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "30");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const head = document.createElementNS(ns, "circle");
  head.setAttribute("cx", "16");
  head.setAttribute("cy", "5");
  head.setAttribute("r", "3");
  head.setAttribute("class", "runner-figure-head");
  svg.append(head);

  const parts: Array<[string, string]> = [
    ["runner-figure-torso", "M14 9 L11 16"],
    ["runner-figure-arm-back", "M13.5 10 L8 13"],
    ["runner-figure-arm-front", "M13.5 10 L20 8"],
    ["runner-figure-leg-back", "M11 16 L5 22 L3 27"],
    ["runner-figure-leg-front", "M11 16 L17 20 L22 25"],
  ];

  for (const [className, d] of parts) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", className);
    svg.append(path);
  }

  return svg;
}

function elementForMarker(label: string, markerType: string): HTMLDivElement {
  const element = document.createElement("div");
  element.className = "delivery-map-marker " + markerType;
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", label);
  element.title = label;

  if (markerType.startsWith("runner")) {
    const figure = document.createElement("span");
    figure.className = "delivery-runner-avatar";
    figure.setAttribute("aria-hidden", "true");
    figure.append(createRunnerFigure());

    const trail = document.createElement("span");
    trail.className = "delivery-runner-trail";
    trail.setAttribute("aria-hidden", "true");

    element.append(trail, figure);
  } else {
    const dot = document.createElement("span");
    dot.className = "delivery-map-marker-dot";
    dot.setAttribute("aria-hidden", "true");
    element.append(dot);
  }

  const text = document.createElement("span");
  text.className = "delivery-map-marker-label";
  text.textContent = label;
  element.append(text);
  return element;
}

export function DeliveryRouteMap({
  pickupText,
  destinationText,
  pickupPoint,
  destinationPoint,
  runnerLocation,
  payerLocation,
  deliveryStatus = "",
  runnerLabel = "Runner · GPS",
  payerLabel = "Requester · GPS",
  className = "",
}: DeliveryRouteMapProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const maplibreRef = React.useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = React.useRef<Map<string, MapLibreMarker>>(new Map());
  const animatedRunnerRef = React.useRef<MapLibreMarker | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapError, setMapError] = React.useState("");
  const [motionPaused, setMotionPaused] = React.useState(false);
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const animationsPaused = motionPaused || prefersReducedMotion;

  const pickup = validCoordinate(pickupPoint);
  const destination = validCoordinate(destinationPoint);
  const runnerCandidate = validCoordinate(runnerLocation);
  const payerCandidate = validCoordinate(payerLocation);
  const runner = runnerCandidate && isFresh(runnerLocation?.updatedAt) ? runnerCandidate : null;
  const payer = payerCandidate && isFresh(payerLocation?.updatedAt) ? payerCandidate : null;
  const runnerAge = relativeAge(runnerLocation?.updatedAt);
  const locationIsStale = Boolean(runnerCandidate && !runner);

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

        maplibreRef.current = maplibre;
        map = new maplibre.Map({
          container: canvasRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [7.704, 8.956],
          zoom: 14,
          attributionControl: {},
          pitchWithRotate: false,
          dragRotate: false,
          cooperativeGestures: true,
        });
        mapRef.current = map;

        map.on("load", () => {
          if (disposed || !map) return;
          if (!map.getSource("carrygo-route")) {
            map.addSource("carrygo-route", {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            });
          }
          if (!map.getLayer("carrygo-route-line")) {
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
          }
          setMapReady(true);
        });

        map.on("error", (event) => {
          if (!disposed && event.error) {
            setMapError("The map could not load right now. Delivery details remain available below.");
          }
        });
      } catch {
        if (!disposed) {
          setMapError("Interactive map is unavailable right now. You can still follow delivery status below.");
        }
      }
    }

    void initialize();

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      animatedRunnerRef.current?.remove();
      animatedRunnerRef.current = null;
      map?.remove();
      mapRef.current = null;
      maplibreRef.current = null;
    };
  }, []);

  // Keep decorative line motion quiet by default for users who prefer reduced
  // motion, and let everyone else pause it without losing map functionality.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || animationsPaused) return;

    let pulseStep = false;
    const timer = window.setInterval(() => {
      if (!map.getLayer("carrygo-route-line")) return;
      pulseStep = !pulseStep;
      map.setPaintProperty("carrygo-route-line", "line-width", pulseStep ? 4.8 : 3.6);
      map.setPaintProperty("carrygo-route-line", "line-opacity", pulseStep ? 0.98 : 0.74);
    }, 900);

    return () => window.clearInterval(timer);
  }, [mapReady, animationsPaused]);

  React.useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !mapReady || !maplibre) return;

    const entries: Array<{
      key: string;
      label: string;
      point: Coordinate | null;
      className: string;
    }> = [
      { key: "pickup", label: pickupPoint?.name || pickupText || "Pickup", point: pickup, className: "pickup" },
      { key: "destination", label: destinationPoint?.name || destinationText || "Drop-off", point: destination, className: "dropoff" },
      { key: "runner", label: runnerLabel, point: runner, className: "runner" },
      { key: "payer", label: payerLabel, point: payer, className: "payer" },
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

      const marker = new maplibre.Marker({
        element: elementForMarker(entry.label, entry.className),
        anchor: "bottom",
      })
        .setLngLat([entry.point.longitude, entry.point.latitude])
        .addTo(map);
      markersRef.current.set(entry.key, marker);
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
    const source = map.getSource("carrygo-route") as GeoJSONSource | undefined;
    source?.setData({ type: "FeatureCollection", features });

    const allPoints = entries
      .filter((entry) => entry.point)
      .map((entry) => entry.point as Coordinate);
    if (allPoints.length >= 2) {
      const west = Math.min(...allPoints.map((point) => point.longitude));
      const east = Math.max(...allPoints.map((point) => point.longitude));
      const south = Math.min(...allPoints.map((point) => point.latitude));
      const north = Math.max(...allPoints.map((point) => point.latitude));
      if (west === east && south === north) {
        map.easeTo({ center: [west, south], zoom: 15, duration: 450 });
      } else {
        map.fitBounds([[west, south], [east, north]], {
          padding: { top: 74, right: 40, bottom: 70, left: 40 },
          maxZoom: 15,
          duration: 450,
        });
      }
    } else if (allPoints.length === 1) {
      map.easeTo({
        center: [allPoints[0].longitude, allPoints[0].latitude],
        zoom: 15,
        duration: 450,
      });
    }
  // coordinatesKey is the meaningful map input signature, not object identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapReady, coordinatesKey, pickupPoint?.name, destinationPoint?.name,
    pickupText, destinationText, runnerLabel, payerLabel,
  ]);

  // An illustrated human courier traverses the straight-line estimate only
  // when a delivery is en route and no fresh GPS position is available. This
  // is explicitly labelled so nobody confuses illustration with live tracking.
  React.useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !mapReady || !maplibre || !pickup || !destination) {
      animatedRunnerRef.current?.remove();
      animatedRunnerRef.current = null;
      return;
    }

    const shouldAnimate = deliveryStatus === "EN_ROUTE" && !runner;
    if (!shouldAnimate) {
      animatedRunnerRef.current?.remove();
      animatedRunnerRef.current = null;
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    let marker = animatedRunnerRef.current;
    if (!marker) {
      marker = new maplibre.Marker({
        element: elementForMarker("Illustrative runner animation · not live GPS", "runner illustrative"),
        anchor: "bottom",
      });
      animatedRunnerRef.current = marker;
    }
    marker.setLngLat([pickup.longitude, pickup.latitude]).addTo(map);

    const duration = 18_000;
    const frame = (now: number) => {
      if (disposed || !marker) return;
      const progress = (now % duration) / duration;
      const fadeIn = Math.min(1, progress / 0.045);
      const fadeOut = Math.min(1, (1 - progress) / 0.075);
      const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      marker.getElement().style.opacity = String(animationsPaused ? 1 : opacity);
      marker.setLngLat([
        pickup.longitude + (destination.longitude - pickup.longitude) * progress,
        pickup.latitude + (destination.latitude - pickup.latitude) * progress,
      ]);
      if (!animationsPaused) animationFrame = window.requestAnimationFrame(frame);
    };

    if (animationsPaused) {
      marker.setLngLat([
        (pickup.longitude + destination.longitude) / 2,
        (pickup.latitude + destination.latitude) / 2,
      ]);
      marker.getElement().style.opacity = "1";
    } else {
      animationFrame = window.requestAnimationFrame(frame);
    }

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [
    mapReady, coordinatesKey, deliveryStatus, animationsPaused,
    pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude,
    runner?.latitude, runner?.longitude,
  ]);

  const knownRoute = Boolean(pickup && destination);
  const anyPosition = Boolean(pickup || destination || runner || payer);
  const animationIsIllustrative = deliveryStatus === "EN_ROUTE" && !runner && knownRoute;

  const mapPointsForCenter = React.useMemo(() => [
    pickup,
    destination,
    runner,
    payer,
  ].filter((point): point is Coordinate => Boolean(point)), [
    pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude,
    runner?.latitude, runner?.longitude, payer?.latitude, payer?.longitude,
  ]);

  const recenter = () => {
    const map = mapRef.current;
    if (!map || mapPointsForCenter.length === 0) return;
    if (mapPointsForCenter.length === 1) {
      const point = mapPointsForCenter[0];
      map.easeTo({ center: [point.longitude, point.latitude], zoom: 15, duration: 450 });
      return;
    }
    const west = Math.min(...mapPointsForCenter.map((point) => point.longitude));
    const east = Math.max(...mapPointsForCenter.map((point) => point.longitude));
    const south = Math.min(...mapPointsForCenter.map((point) => point.latitude));
    const north = Math.max(...mapPointsForCenter.map((point) => point.latitude));
    if (west === east && south === north) {
      map.easeTo({ center: [west, south], zoom: 15, duration: 450 });
      return;
    }
    map.fitBounds([[west, south], [east, north]], {
      padding: { top: 78, right: 44, bottom: 78, left: 44 },
      maxZoom: 15,
      duration: 450,
    });
  };

  const routeDescription = mapError
    ? mapError
    : animationIsIllustrative
      ? "Human runner animation follows the straight-line estimate; it is illustrative, not live GPS. The dashed line is not road navigation or an ETA."
      : runner
        ? "Runner location updated " + (runnerAge || "recently") + ". The dashed line is a straight-line estimate, not road navigation or an ETA."
        : locationIsStale
          ? "Runner location is stale (last update " + (runnerAge || "unknown") + "). Turn on location sharing for fresh GPS. The dashed line is not road navigation or an ETA."
          : knownRoute
            ? "Pickup and drop-off are mapped. Fresh runner GPS appears when location sharing is enabled. The dashed line is not road navigation or an ETA."
            : anyPosition
              ? "Showing available location signals. Add campus coordinates to enable pickup and drop-off pins."
              : "Map ready. Pickup and drop-off pins appear when campus coordinates are available or live sharing begins.";

  return (
    <section
      className={"tracking-map delivery-route-map " + className}
      data-motion-paused={animationsPaused ? "true" : "false"}
      aria-label={"Delivery route map from " + pickupText + " to " + destinationText}
    >
      <div
        ref={canvasRef}
        className="delivery-map-canvas"
        role="region"
        aria-label={"Interactive map for delivery from " + pickupText + " to " + destinationText}
      />
      <div className="delivery-map-badge">
        <span className="delivery-map-live-dot" />
        {runner
          ? "RUNNER GPS · " + (runnerAge || "RECENT")
          : animationIsIllustrative
            ? "RUNNER IN MOTION · ILLUSTRATION"
            : knownRoute
              ? "PICKUP + DROP-OFF"
              : "DELIVERY MAP"}
      </div>
      <div className="delivery-map-controls" aria-label="Map controls">
        <button type="button" className="delivery-map-control" onClick={recenter} disabled={!mapReady || mapPointsForCenter.length === 0}>
          Recenter map
        </button>
        <button
          type="button"
          className="delivery-map-control"
          onClick={() => setMotionPaused((paused) => !paused)}
          aria-pressed={animationsPaused}
          aria-label={animationsPaused ? "Resume decorative map animation" : "Pause decorative map animation"}
          title={prefersReducedMotion ? "Your device prefers reduced motion" : undefined}
        >
          {animationsPaused ? "Play map motion" : "Pause motion"}
        </button>
      </div>
      <div className="delivery-map-legend" aria-label="Map legend">
        <span><i className="legend-pickup" />Pickup</span>
        <span><i className="legend-dropoff" />Drop-off</span>
        <span><i className="legend-runner" />Runner</span>
      </div>
      <div className="delivery-map-note" aria-live="polite">{routeDescription}</div>
      {!mapReady && !mapError && <div className="delivery-map-loading" role="status">Loading map…</div>}
    </section>
  );
}
