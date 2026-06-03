import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ORIGIN } from "../config";
const EmergencyPage = () => {
  const [showTips, setShowTips] = useState(false);
  const [places, setPlaces] = useState([]);
const [selectedPlace, setSelectedPlace] = useState("");
useEffect(() => {
  axios
    .get(`${API_ORIGIN}/api/places`)
    .then((res) => setPlaces(res.data || []))
    .catch((err) => {
      console.error("Failed to load places", err);
    });
}, []);
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🚨 Emergency Assistance</h1>
      <p style={styles.subtitle}>
        Your safety is our priority during your pilgrimage journey.
      </p>
      {/* Location Selector */}
<div style={styles.section}>
  <h2 style={styles.sectionTitle}>📍 Select Your Location</h2>

  <select
    value={selectedPlace}
    onChange={(e) => setSelectedPlace(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      marginTop: "10px"
    }}
  >
    <option value="">-- Choose Place --</option>
    {places.map((p) => (
      <option key={p._id} value={p._id}>
        {p.name}
      </option>
    ))}
  </select>

  {selectedPlace && (
    <p className="muted" style={{ marginTop: "8px" }}>
      Emergency services will be shown for the selected place.
    </p>
  )}
</div>
      {/* Quick Actions */}
      <div style={styles.grid}>
        <Card
          title="🏥 Nearby Hospital"
          details="Distance: 1.2 km"
          phone="102"
        />
        <Card
          title="👮 Police Station"
          details="Distance: 800m"
          phone="100"
        />
        <Card
          title="🛕 Temple Help Desk"
          details="Lost & Found / Darshan Support"
          phone="0123456789"
        />
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📍 Share Live Location</h3>
          <button style={styles.primaryBtn}>
            Share via WhatsApp
          </button>
        </div>
      </div>

      {/* Safety Tips */}
      <div style={styles.section}>
        <h2
          style={styles.sectionTitle}
          onClick={() => setShowTips(!showTips)}
        >
          🛕 Safety Tips {showTips ? "▲" : "▼"}
        </h2>

        {showTips && (
          <ul>
            <li>Avoid traveling after sunset.</li>
            <li>Stay hydrated.</li>
            <li>Follow official temple routes only.</li>
          </ul>
        )}
      </div>

      {/* Floating SOS */}
      <button style={styles.sosBtn} onClick={() => alert("SOS Triggered!")}>
        🔴 SOS
      </button>
    </div>
  );
};

const Card = ({ title, details, phone }) => (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>{title}</h3>
    <p>{details}</p>
    <a href={`tel:${phone}`} style={styles.primaryBtn}>
      Call Now
    </a>
  </div>
);

const styles = {
  page: {
    backgroundColor: "#F3ECE6",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "sans-serif",
  },
  title: {
    color: "#7B2D26",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    color: "#7B2D26",
  },
  primaryBtn: {
    backgroundColor: "#7B2D26",
    color: "#fff",
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "10px",
  },
  section: {
    marginTop: "40px",
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
  },
  sectionTitle: {
    color: "#7B2D26",
    cursor: "pointer",
  },
  sosBtn: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    backgroundColor: "#7B2D26",
    color: "#fff",
    borderRadius: "50%",
    width: "80px",
    height: "80px",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default EmergencyPage;
