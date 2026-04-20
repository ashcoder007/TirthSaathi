import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapsPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

  // Admin places (cities/places)
  const [places, setPlaces] = useState([]);

  // Base place (to center the map)
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  // Start/Dest modes
  const [startMode, setStartMode] = useState("admin"); // "admin" | "custom"
  const [destMode, setDestMode] = useState("admin"); // "admin" | "custom"

  // Admin selections
  const [startId, setStartId] = useState("");
  const [destId, setDestId] = useState("");

  // Custom text inputs
  const [startText, setStartText] = useState("");
  const [destText, setDestText] = useState("");

  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState("");

  const selectedPlace = useMemo(
    () => places.find((p) => p._id === selectedPlaceId),
    [places, selectedPlaceId]
  );

  const startPlace = useMemo(
    () => places.find((p) => p._id === startId),
    [places, startId]
  );

  const destPlace = useMemo(
    () => places.find((p) => p._id === destId),
    [places, destId]
  );

  // 1) Load admin-selected places for maps
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setError("");
        const res = await fetch(`${API_BASE}/api/places/maps`);
        if (!res.ok) throw new Error("Failed to fetch map places");
        const data = await res.json();
        setPlaces(data);
      } catch (e) {
        setError(e.message || "Failed to load places");
      }
    };
    loadPlaces();
  }, [API_BASE]);

  // 2) Init Map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.7866, 23.1765],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);

  // 3) When base place changes → center map and reset route + fields
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace?.coords) return;

    setRouteInfo(null);
    setError("");

    // reset start/dest selections (optional but cleaner UX)
    setStartId("");
    setDestId("");
    setStartText("");
    setDestText("");

    const { lng, lat } = selectedPlace.coords;
    map.flyTo({ center: [lng, lat], zoom: 13 });
  }, [selectedPlace]);

  const clearMarkersAndRoute = () => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");

    if (mapRef.current._startMarker) {
      mapRef.current._startMarker.remove();
      mapRef.current._startMarker = null;
    }
    if (mapRef.current._destMarker) {
      mapRef.current._destMarker.remove();
      mapRef.current._destMarker = null;
    }
  };

  const addMarker = (lng, lat, type) => {
    const map = mapRef.current;
    if (!map) return;

    const marker = new mapboxgl.Marker(
      type === "start" ? { color: "green" } : { color: "red" }
    )
      .setLngLat([lng, lat])
      .addTo(map);

    if (type === "start") mapRef.current._startMarker = marker;
    else mapRef.current._destMarker = marker;
  };

  // Geocode custom text to coordinates [lng, lat]
  const geocodeText = async (text) => {
    const q = text.trim();
    if (!q) return null;

    // Optional: bias results around selectedPlace coords
    const proximity =
      selectedPlace?.coords?.lng && selectedPlace?.coords?.lat
        ? `&proximity=${selectedPlace.coords.lng},${selectedPlace.coords.lat}`
        : "";

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      q
    )}.json?limit=1${proximity}&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();
    const center = data?.features?.[0]?.center; // [lng, lat]
    return Array.isArray(center) ? center : null;
  };

  // Resolve start/dest coords based on mode
  const resolveStartCoords = async () => {
    if (startMode === "admin") {
      if (!startPlace?.coords) return null;
      return [startPlace.coords.lng, startPlace.coords.lat];
    }
    return await geocodeText(startText);
  };

  const resolveDestCoords = async () => {
    if (destMode === "admin") {
      if (!destPlace?.coords) return null;
      return [destPlace.coords.lng, destPlace.coords.lat];
    }
    return await geocodeText(destText);
  };

  // Draw route button handler (more reliable than auto-useEffect)
  const handleShowRoute = async () => {
    const map = mapRef.current;
    if (!map) return;

    setError("");
    setRouteInfo(null);
    clearMarkersAndRoute();

    try {
      const start = await resolveStartCoords();
      const dest = await resolveDestCoords();

      if (!start) {
        throw new Error(
          startMode === "admin"
            ? "Please select a Start location from list."
            : "Please enter a valid Start location."
        );
      }
      if (!dest) {
        throw new Error(
          destMode === "admin"
            ? "Please select a Destination from list."
            : "Please enter a valid Destination."
        );
      }

      addMarker(start[0], start[1], "start");
      addMarker(dest[0], dest[1], "dest");

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || !data.routes.length) throw new Error("No route found");

      const route = data.routes[0];
      setRouteInfo({
        distanceKm: (route.distance / 1000).toFixed(2),
        durationMin: Math.round(route.duration / 60),
      });

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: route.geometry,
      };

      const coords = route.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60 });

      if (!map.isStyleLoaded()) {
        await new Promise((r) => map.once("load", r));
      }

      map.addSource("route", { type: "geojson", data: geojson });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-width": 5 },
      });
    } catch (e) {
      setError(e.message || "Failed to draw route");
    }
  };

  const optionsEnabled = !!selectedPlaceId;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Maps</h2>

      {error && <div style={{ marginBottom: 12, color: "crimson" }}>{error}</div>}

      {/* SECTION 1: Base Place */}
      <div style={{ maxWidth: 900, marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Select Place (Admin Added)
        </label>
        <select
          value={selectedPlaceId}
          onChange={(e) => setSelectedPlaceId(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8 }}
        >
          <option value="">Select a place...</option>
          {places.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {!optionsEnabled && (
        <div style={{ maxWidth: 900, marginBottom: 12, color: "#555" }}>
          Select a place first, then choose start & destination.
        </div>
      )}

      {/* SECTION 2: Start & Destination */}
      <div
        style={{
          maxWidth: 900,
          opacity: optionsEnabled ? 1 : 0.6,
          pointerEvents: optionsEnabled ? "auto" : "none",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* START */}
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Start</label>

            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  checked={startMode === "admin"}
                  onChange={() => setStartMode("admin")}
                />
                From admin list
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  checked={startMode === "custom"}
                  onChange={() => setStartMode("custom")}
                />
                Custom
              </label>
            </div>

            {startMode === "admin" ? (
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              >
                <option value="">Select start...</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                placeholder="Type start location (e.g. Ujjain Railway Station)"
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              />
            )}
          </div>

          {/* DESTINATION */}
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Destination</label>

            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  checked={destMode === "admin"}
                  onChange={() => setDestMode("admin")}
                />
                From admin list
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  checked={destMode === "custom"}
                  onChange={() => setDestMode("custom")}
                />
                Custom
              </label>
            </div>

            {destMode === "admin" ? (
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              >
                <option value="">Select destination...</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                placeholder="Type destination (e.g. Mahakaleshwar Mandir)"
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleShowRoute}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          Show Route
        </button>
      </div>

      {routeInfo && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            maxWidth: 900,
          }}
        >
          <strong>Route:</strong> {routeInfo.distanceKm} km • {routeInfo.durationMin} min
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "70vh",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #ddd",
        }}
      />
    </div>
  );
}