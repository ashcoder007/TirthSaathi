// frontend/src/pages/TripPlanner.js
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./tripplanner.css";

const API = process.env.REACT_APP_API || "http://localhost:5000";
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";

export default function TripPlanner() {
  const token =
    localStorage.getItem("ts_token") ||
    localStorage.getItem("admin_token") ||
    null;

  /* -------------------- MAP REFS -------------------- */
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* -------------------- STATE -------------------- */
  const [places, setPlaces] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [events, setEvents] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [budgetEstimate, setBudgetEstimate] = useState("");

  const [form, setForm] = useState({
    placeId: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    selectedEventIds: []
  });

  const [viewport, setViewport] = useState({
    latitude: 23.18,
    longitude: 75.7847,
    zoom: 10
  });

  /* -------------------- LOAD PLACES -------------------- */
  useEffect(() => {
    axios.get(`${API}/api/places`).then((res) => {
      setPlaces(res.data || []);
    });
  }, []);

  /* -------------------- PLACE CHANGE -------------------- */
  useEffect(() => {
    if (!form.placeId) return;

    const p = places.find((pl) => pl._id === form.placeId);
    if (p?.coords) {
      setViewport({
        latitude: p.coords.lat,
        longitude: p.coords.lng,
        zoom: 12
      });
    }

    loadEventsForPlace(form.placeId);
    loadAccommodationsForPlace(form.placeId);
  }, [form.placeId, places]);

  /* -------------------- MAP INIT (ONCE) -------------------- */
  useEffect(() => {
    if (!MAPBOX_TOKEN || mapRef.current || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [MAPBOX_TOKEN]);

  /* -------------------- UPDATE MAP -------------------- */
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      essential: true
    });

    if (markerRef.current) markerRef.current.remove();

    markerRef.current = new mapboxgl.Marker({ color: "#e23" })
      .setLngLat([viewport.longitude, viewport.latitude])
      .addTo(mapRef.current);
  }, [viewport]);

  /* -------------------- API HELPERS (FIXED) -------------------- */
  async function loadEventsForPlace(placeId) {
    try {
      const res = await axios.get(`${API}/api/events?place=${placeId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // ✅ CORRECT FILTER (events have populated place object)
      const filtered = (res.data || []).filter(
        (ev) => ev.place?._id === placeId
      );

      setEvents(filtered);
    } catch (err) {
      console.error("loadEventsForPlace failed", err);
      setEvents([]);
    }
  }

 async function loadAccommodationsForPlace(placeId) {
  try {
    const res = await axios.get(`${API}/api/accommodations`);

    console.log("SELECTED PLACE ID:", placeId);
    console.log("ALL ACCOMMODATIONS:", res.data);

    const filtered = res.data.filter(
      (a) => String(a.place) === String(placeId)
    );

    console.log("FILTERED:", filtered);

    setAccommodations(filtered);
  } catch (err) {
    console.error("loadAccommodationsForPlace failed", err);
    setAccommodations([]);
  }
}
  /* -------------------- ITINERARY -------------------- */
 function generateItinerary() {
  if (!form.placeId) {
    alert("Choose a place first");
    return;
  }

  const tripStart = new Date(form.startDate);
  const tripEnd = new Date(form.endDate);

  if (tripStart > tripEnd) {
    alert("End date must be after start date");
    return;
  }

  const days =
    differenceInCalendarDays(tripEnd, tripStart) + 1;

  // 1️⃣ Create empty day buckets
  const itineraryMap = {};

  for (let i = 0; i < days; i++) {
    const d = format(addDays(tripStart, i), "yyyy-MM-dd");
    itineraryMap[d] = {
      date: d,
      items: []
    };
  }

  // 2️⃣ Assign selected events to correct day
  const selectedEvents = events.filter(ev =>
    form.selectedEventIds.includes(ev._id)
  );

  selectedEvents.forEach(ev => {
    const evDay = format(new Date(ev.startDate), "yyyy-MM-dd");

    if (itineraryMap[evDay]) {
      itineraryMap[evDay].items.push({
        type: "event",
        title: ev.title,
        time: ev.startDate
      });
    }
  });

  // 3️⃣ Fill empty days with defaults
  Object.values(itineraryMap).forEach(day => {
    if (day.items.length === 0) {
      day.items.push(
        { type: "suggestion", title: "Morning temple visit" },
        { type: "suggestion", title: "Local food exploration" },
        { type: "suggestion", title: "Evening aarti / walk" }
      );
    }
  });

  setItinerary(Object.values(itineraryMap));
}
  /* ======================== UI ======================== */
  return (
    <div className="trip-planner-page">
      <h2>Plan Yatra — Trip Planner</h2>

      <div className="planner-grid">
        {/* LEFT PANEL */}
        <div className="planner-form card">
          <label>Choose Place</label>
          <select
            value={form.placeId}
            onChange={(e) => setForm({ ...form, placeId: e.target.value })}
          >
            <option value="">-- Select place --</option>
            {places.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <label>Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />

          <label>End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />

          {/* EVENTS */}
          <div style={{ marginTop: 10 }}>
            <strong>Choose Events to Attend</strong>
            <div className="events-list">
              {events.length === 0 && (
                <div className="muted">No events found for this place.</div>
              )}
              {events.map((ev) => (
                <label key={ev._id} className="event-row">
                  <input
                    type="checkbox"
                    checked={form.selectedEventIds.includes(ev._id)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        selectedEventIds: prev.selectedEventIds.includes(ev._id)
                          ? prev.selectedEventIds.filter((x) => x !== ev._id)
                          : [...prev.selectedEventIds, ev._id]
                      }))
                    }
                  />
                  <div className="ev-title">{ev.title}</div>
                  <div className="ev-meta">
                    {ev.locationDesc || "—"} •{" "}
                    {ev.startDate ? new Date(ev.startDate).toLocaleString() : "—"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button onClick={generateItinerary} className="btn-primary">
              Generate Itinerary
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setItinerary([]);
                setBudgetEstimate("");
              }}
            >
              Reset
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Budget Estimate:</strong>
            <div className="muted">{budgetEstimate || "N/A"}</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="planner-results card">
          <h3>Itinerary</h3>
          {itinerary.length === 0 && (
            <div className="muted">No itinerary yet — generate one above.</div>
          )}
          {itinerary.map((day, i) => (
  <div key={i} className="it-day">
    <div className="it-day-title">
      {format(new Date(day.date), "eee, MMM d, yyyy")}
    </div>

    <ul>
      {day.items.map((it, j) => (
        <li key={j}>
          {it.type === "event" ? "🎉 " : "🧘 "}
          {it.title}
        </li>
      ))}
    </ul>
  </div>
))}

          <h3 style={{ marginTop: 12 }}>Suggested Accommodations</h3>
          {accommodations.length === 0 && (
            <div className="muted">No accommodations found for this place.</div>
          )}
{accommodations.map((a) => (
  <div key={a._id} className="acc-row">
    <strong>{a.name}</strong> — {a.type} — {a.priceRange}
    <div className="muted">
      {a.address} {a.phone ? `• ${a.phone}` : ""}
    </div>
  </div>
))}
          <h3 style={{ marginTop: 12 }}>Map</h3>
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "300px",
              borderRadius: "8px",
              overflow: "hidden"
            }}
          />
        </div>
      </div>
    </div>
  );
}