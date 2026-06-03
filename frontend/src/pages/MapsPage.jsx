import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { API_BASE_URL, MAPBOX_TOKEN } from "../config";
import {
  buildOfflineDocument,
  downloadHtmlDocument,
  htmlEscape,
  openPrintableDocument
} from "../utils/downloadDocument";

mapboxgl.accessToken = MAPBOX_TOKEN;

const UJJAIN_BBOX = "75.70,23.10,75.86,23.25";

const UJJAIN_LANDMARKS = [
  {
    label: "Ram Ghat, Ujjain",
    coords: [75.7741, 23.185],
    aliases: ["ram ghat", "ramghat", "shipra ghat", "kshipra ghat"]
  },
  {
    label: "Shri Mahakaleshwar Mandir, Ujjain",
    coords: [75.7689, 23.1828],
    aliases: [
      "mahakaleshwar mandir",
      "mahakaleshwar temple",
      "mahakal mandir",
      "mahakal temple",
      "mahakaleshwar jyotirlinga",
      "mahakal"
    ]
  },
  {
    label: "Mahakal Lok, Ujjain",
    coords: [75.7706, 23.1831],
    aliases: ["mahakal lok", "mahakal corridor"]
  },
  {
    label: "Harsiddhi Mata Temple, Ujjain",
    coords: [75.7658, 23.1818],
    aliases: ["harsiddhi", "harsiddhi mata", "harsiddhi temple"]
  },
  {
    label: "Kaal Bhairav Temple, Ujjain",
    coords: [75.7738, 23.2109],
    aliases: ["kaal bhairav", "kal bhairav", "kal bherav", "kaal bhairav temple"]
  },
  {
    label: "Mangalnath Temple, Ujjain",
    coords: [75.7758, 23.2204],
    aliases: ["mangalnath", "mangalnath temple"]
  },
  {
    label: "Gopal Mandir, Ujjain",
    coords: [75.7758, 23.1833],
    aliases: ["gopal mandir", "dwarkadhish temple"]
  },
  {
    label: "Chintaman Ganesh Temple, Ujjain",
    coords: [75.7242, 23.1758],
    aliases: ["chintaman ganesh", "chintaman ganesh temple"]
  }
];

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #d8ccc6",
  cursor: "pointer",
  background: "#fff",
  color: "#3d302b",
  fontWeight: 600
};

const primaryButtonStyle = {
  ...buttonStyle,
  background: "#6b2f25",
  color: "#fff",
  borderColor: "#6b2f25"
};

export default function MapsPage() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [startMode, setStartMode] = useState("custom");
  const [destMode, setDestMode] = useState("custom");
  const [startId, setStartId] = useState("");
  const [destId, setDestId] = useState("");
  const [startText, setStartText] = useState("Ram Ghat");
  const [destText, setDestText] = useState("Mahakaleshwar Mandir");
  const [routeProfile, setRouteProfile] = useState("walking");
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

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setError("");
        const res = await fetch(`${API_BASE_URL}/places/maps`);
        if (!res.ok) throw new Error("Failed to fetch map places");
        const data = await res.json();
        setPlaces(data);

        const ujjain = data.find((p) => /ujjain/i.test(p.name || ""));
        if (ujjain) setSelectedPlaceId(ujjain._id);
      } catch (e) {
        setError(e.message || "Failed to load places");
      }
    };
    loadPlaces();
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [75.7866, 23.1765],
      zoom: 13
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlace?.coords) return;

    setRouteInfo(null);
    setError("");

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
      type === "start" ? { color: "#1f8f4d" } : { color: "#c5352f" }
    )
      .setLngLat([lng, lat])
      .addTo(map);

    if (type === "start") mapRef.current._startMarker = marker;
    else mapRef.current._destMarker = marker;
  };

  const buildSearchQuery = (text) => {
    const placeHint = selectedPlace?.name || "Ujjain";
    const escapedPlaceHint = placeHint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasPlaceHint = new RegExp(escapedPlaceHint, "i").test(text);
    const hasIndiaHint = /india|madhya pradesh|mp/i.test(text);
    return [
      text,
      hasPlaceHint ? "" : placeHint,
      hasIndiaHint ? "" : "Madhya Pradesh India"
    ]
      .filter(Boolean)
      .join(", ");
  };

  const resolveKnownLandmark = (text) => {
    const normalized = normalizeSearchText(text);
    if (!normalized) return null;

    const match = UJJAIN_LANDMARKS.find((landmark) =>
      landmark.aliases.some((alias) => {
        const normalizedAlias = normalizeSearchText(alias);
        return normalized === normalizedAlias || normalized.includes(normalizedAlias);
      })
    );

    if (!match) return null;

    return {
      coords: match.coords,
      label: match.label,
      source: "local"
    };
  };

  const scoreGeocodeFeature = (feature, query) => {
    const normalizedPlace = normalizeSearchText(
      `${feature.text || ""} ${feature.place_name || ""}`
    );
    const normalizedQuery = normalizeSearchText(query);

    let score = 0;
    if (normalizedPlace.includes(normalizedQuery)) score += 6;
    if (normalizedPlace.includes("ujjain")) score += 4;
    if (normalizedPlace.includes("madhya pradesh")) score += 2;
    if (normalizedPlace.includes("india")) score += 1;
    if (/ram\s*ghat|ramghat/.test(normalizedQuery) && /ram\s*ghat|ramghat/.test(normalizedPlace)) {
      score += 8;
    }
    if (/mahakal|mahakaleshwar/.test(normalizedQuery) && /mahakal|mahakaleshwar/.test(normalizedPlace)) {
      score += 8;
    }

    const relevance = typeof feature.relevance === "number" ? feature.relevance : 0;
    return score + relevance;
  };

  const geocodeText = async (text) => {
    const q = text.trim();
    if (!q) return null;

    const knownLandmark = resolveKnownLandmark(q);
    if (knownLandmark) return knownLandmark;

    const proximity =
      selectedPlace?.coords?.lng && selectedPlace?.coords?.lat
        ? `&proximity=${selectedPlace.coords.lng},${selectedPlace.coords.lat}`
        : "&proximity=75.7866,23.1765";

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      buildSearchQuery(q)
    )}.json?limit=5&country=in&bbox=${UJJAIN_BBOX}${proximity}&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();
    const features = data?.features || [];
    const best = features
      .filter((feature) => {
        const placeName = normalizeSearchText(feature.place_name || "");
        return placeName.includes("ujjain") || placeName.includes("madhya pradesh");
      })
      .sort((a, b) => scoreGeocodeFeature(b, q) - scoreGeocodeFeature(a, q))[0] || features[0];

    if (!best?.center) return null;

    return {
      coords: best.center,
      label: best.place_name || q,
      source: "mapbox"
    };
  };

  const resolveLocation = async (mode, place, text, fieldLabel) => {
    if (mode === "admin") {
      if (!place?.coords) return null;
      return {
        coords: [place.coords.lng, place.coords.lat],
        label: place.name || fieldLabel
      };
    }
    return await geocodeText(text);
  };

  const handleShowRoute = async () => {
    const map = mapRef.current;
    if (!map) return;

    setError("");
    setRouteInfo(null);
    clearMarkersAndRoute();

    try {
      const start = await resolveLocation(startMode, startPlace, startText, "Start");
      const dest = await resolveLocation(destMode, destPlace, destText, "Destination");

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

      addMarker(start.coords[0], start.coords[1], "start");
      addMarker(dest.coords[0], dest.coords[1], "dest");

      const url = `https://api.mapbox.com/directions/v5/mapbox/${routeProfile}/${start.coords[0]},${start.coords[1]};${dest.coords[0]},${dest.coords[1]}?geometries=geojson&overview=full&steps=true&alternatives=true&language=en&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || !data.routes.length) {
        throw new Error(data.message || "No route found");
      }

      const route = [...data.routes].sort((a, b) => a.duration - b.duration)[0];
      const steps = route.legs?.[0]?.steps?.map((step, index) => ({
        id: index + 1,
        instruction: step.maneuver?.instruction || "Continue",
        distanceM: Math.round(step.distance || 0),
        durationMin: Math.max(1, Math.round((step.duration || 0) / 60))
      })) || [];

      setRouteInfo({
        startLabel: start.label,
        destLabel: dest.label,
        profile: routeProfile,
        distanceKm: (route.distance / 1000).toFixed(2),
        durationMin: Math.round(route.duration / 60),
        steps
      });

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: route.geometry
      };

      const coords = route.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 70 });

      if (!map.isStyleLoaded()) {
        await new Promise((resolve) => map.once("load", resolve));
      }

      map.addSource("route", { type: "geojson", data: geojson });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-width": 5,
          "line-color": routeProfile === "walking" ? "#1f8f4d" : "#315f9f"
        }
      });
    } catch (e) {
      setError(e.message || "Failed to draw route");
    }
  };

  const buildRouteDocument = () => {
    if (!routeInfo) return "";

    const summaryHtml = `
      <table>
        <tbody>
          <tr><th>Start</th><td>${htmlEscape(routeInfo.startLabel)}</td></tr>
          <tr><th>Destination</th><td>${htmlEscape(routeInfo.destLabel)}</td></tr>
          <tr><th>Mode</th><td>${htmlEscape(routeInfo.profile)}</td></tr>
          <tr><th>Distance</th><td>${htmlEscape(routeInfo.distanceKm)} km</td></tr>
          <tr><th>Estimated time</th><td>${htmlEscape(routeInfo.durationMin)} min</td></tr>
        </tbody>
      </table>
    `;

    const stepItems = routeInfo.steps.map(
      (step) =>
        `${step.id}. ${step.instruction} (${step.distanceM} m, about ${step.durationMin} min)`
    );

    return buildOfflineDocument({
      title: "TirthSaathi Offline Route Guide",
      subtitle: "Keep this route available before entering low-network areas.",
      sections: [
        { heading: "Route Summary", html: summaryHtml },
        { heading: "Turn-by-turn Steps", items: stepItems },
        {
          heading: "Pilgrim Safety Notes",
          items: [
            "Keep drinking water and required medicines with you.",
            "Share this route with your companion before starting.",
            "Avoid isolated lanes after dark and follow local police or temple authority guidance.",
            "If the route looks blocked, ask nearby officials before taking an alternate path."
          ]
        }
      ]
    });
  };

  const handleDownloadRoute = () => {
    const html = buildRouteDocument();
    downloadHtmlDocument("tirthsaathi-route-guide.html", html);
  };

  const handlePrintRoute = () => {
    const html = buildRouteDocument();
    const opened = openPrintableDocument(html);
    if (!opened) setError("Please allow popups to print or save this route as PDF.");
  };

  const optionsEnabled = !!selectedPlaceId || places.length === 0;

  return (
    <div style={{ padding: 16, background: "#fff8f2", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 12 }}>Maps</h2>

      {error && <div style={{ marginBottom: 12, color: "crimson" }}>{error}</div>}

      <div style={{ maxWidth: 980, marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
          Select Place Area
        </label>
        <select
          value={selectedPlaceId}
          onChange={(e) => setSelectedPlaceId(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          <option value="">Ujjain / current map area</option>
          {places.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          maxWidth: 980,
          opacity: optionsEnabled ? 1 : 0.6,
          pointerEvents: optionsEnabled ? "auto" : "none"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
            marginBottom: 12
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Start</label>

            <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <label><input type="radio" checked={startMode === "custom"} onChange={() => setStartMode("custom")} /> Custom</label>
              <label><input type="radio" checked={startMode === "admin"} onChange={() => setStartMode("admin")} /> From admin list</label>
            </div>

            {startMode === "admin" ? (
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="">Select start...</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                placeholder="Ram Ghat"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Destination</label>

            <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <label><input type="radio" checked={destMode === "custom"} onChange={() => setDestMode("custom")} /> Custom</label>
              <label><input type="radio" checked={destMode === "admin"} onChange={() => setDestMode("admin")} /> From admin list</label>
            </div>

            {destMode === "admin" ? (
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="">Select destination...</option>
                {places.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                placeholder="Mahakaleshwar Mandir"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            value={routeProfile}
            onChange={(e) => setRouteProfile(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="walking">Walking route</option>
            <option value="driving">Driving route</option>
          </select>
          <button onClick={handleShowRoute} style={primaryButtonStyle}>Show Route</button>
          <button onClick={handleDownloadRoute} disabled={!routeInfo} style={{ ...buttonStyle, opacity: routeInfo ? 1 : 0.55 }}>
            Download Offline Guide
          </button>
          <button onClick={handlePrintRoute} disabled={!routeInfo} style={{ ...buttonStyle, opacity: routeInfo ? 1 : 0.55 }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      {routeInfo && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e1d6d0",
            maxWidth: 980,
            background: "#fff"
          }}
        >
          <strong>Route:</strong> {routeInfo.distanceKm} km, about {routeInfo.durationMin} min by {routeInfo.profile}
          <div style={{ marginTop: 8, color: "#625650" }}>
            {routeInfo.startLabel} to {routeInfo.destLabel}
          </div>
          {routeInfo.steps.length > 0 && (
            <ol style={{ marginTop: 12, paddingLeft: 22 }}>
              {routeInfo.steps.slice(0, 8).map((step) => (
                <li key={step.id} style={{ marginBottom: 6 }}>
                  {step.instruction} <span style={{ color: "#777" }}>({step.distanceM} m)</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "68vh",
          minHeight: 420,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #ddd"
        }}
      />
    </div>
  );
}
