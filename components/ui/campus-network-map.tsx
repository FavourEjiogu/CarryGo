"use client";

import * as React from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

export type CampusMapLocation = {
  id: string;
  name: string;
  location_type: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

type Point = CampusMapLocation & { latitude: number; longitude: number };

function georeferenced(locations: CampusMapLocation[]): Point[] {
  return locations.flatMap((location) => {
    if (
      location.latitude === null || location.latitude === undefined || location.latitude === "" ||
      location.longitude === null || location.longitude === undefined || location.longitude === ""
    ) return [];
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
    ) return [];
    return [{ ...location, latitude, longitude }];
  });
}

function markerElement(point: Point): HTMLDivElement {
  const root = document.createElement("div");
  const type = point.location_type.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  root.className = "campus-location-marker campus-location-marker-" + type;
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", point.name);

  const pin = document.createElement("span");
  pin.className = "campus-location-pin";
  pin.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "campus-location-label";
  label.textContent = point.name;

  root.append(pin, label);
  return root;
}

/** An accessible, open-map view of campus places with verified coordinates. */
export function CampusNetworkMap({ locations }: { locations: CampusMapLocation[] }) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const markerRefs = React.useRef<Map<string, MapLibreMarker>>(new Map());
  const maplibreRef = React.useRef<typeof import("maplibre-gl") | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapError, setMapError] = React.useState("");

  const points = React.useMemo(() => georeferenced(locations), [locations]);
  const coordinatesKey = points
    .map((point) => [point.id, point.latitude, point.longitude, point.name].join(":"))
    .join("|");

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
          if (!disposed) setMapReady(true);
        });
        map.on("error", (event) => {
          if (!disposed && event.error) {
            setMapError("The map tiles could not load right now. The place list remains available below.");
          }
        });
      } catch {
        if (!disposed) setMapError("Interactive maps are unavailable right now. The named campus places remain available below.");
      }
    }

    void initialize();
    return () => {
      disposed = true;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current.clear();
      map?.remove();
      mapRef.current = null;
      maplibreRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    const maplibre = maplibreRef.current;
    if (!map || !mapReady || !maplibre) return;

    const nextIds = new Set(points.map((point) => point.id));
    markerRefs.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.remove();
        markerRefs.current.delete(id);
      }
    });

    for (const point of points) {
      const existing = markerRefs.current.get(point.id);
      if (existing) {
        existing.setLngLat([point.longitude, point.latitude]);
        continue;
      }
      const marker = new maplibre.Marker({
        element: markerElement(point),
        anchor: "bottom",
      })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);
      markerRefs.current.set(point.id, marker);
    }

    if (points.length >= 2) {
      const west = Math.min(...points.map((point) => point.longitude));
      const east = Math.max(...points.map((point) => point.longitude));
      const south = Math.min(...points.map((point) => point.latitude));
      const north = Math.max(...points.map((point) => point.latitude));
      map.fitBounds([[west, south], [east, north]], {
        padding: { top: 72, right: 48, bottom: 72, left: 48 },
        maxZoom: 16,
        duration: 500,
      });
    } else if (points.length === 1) {
      map.easeTo({ center: [points[0].longitude, points[0].latitude], zoom: 16, duration: 400 });
    }
  }, [mapReady, coordinatesKey, points]);

  return (
    <section className="campus-network-map card" aria-label="Interactive campus location map">
      <div
        ref={canvasRef}
        className="campus-network-map-canvas"
        role="region"
        aria-label="OpenStreetMap-based interactive map of Bingham University places"
      />
      <div className="campus-network-map-badge">
        <span className="campus-network-map-live-dot" />
        BINGHAM CAMPUS · OPEN MAP
      </div>
      <div className="campus-network-map-note" aria-live="polite">
        {mapError || (
          points.length
            ? points.length + " named place" + (points.length === 1 ? "" : "s") + " with coordinates. Select a marker to see its name; zoom and drag to explore."
            : "Place pins will appear when verified coordinates are available."
        )}
      </div>
      {!mapReady && !mapError && <div className="campus-network-map-loading" role="status">Loading campus map…</div>}
    </section>
  );
}
