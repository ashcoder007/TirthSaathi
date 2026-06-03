// frontend/src/admin/AdminDashboard.js
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Recharts for graphs
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { API_ORIGIN } from "../config";

export default function AdminDashboard() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("ts_token");

  const [counts, setCounts] = useState({ users: 0, places: 0, events: 0 });
  const [eventsByPlace, setEventsByPlace] = useState([]);
  const [monthlyVisits, setMonthlyVisits] = useState([]);

  // ------------------------------------
  // Total counts: users / places / events
  // ------------------------------------
  const loadCounts = useCallback(async () => {
    try {
      const [u, p, e] = await Promise.all([
        axios.get(`${API_ORIGIN}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_ORIGIN}/api/admin/places`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_ORIGIN}/api/admin/events`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setCounts({
        users: u.data.length,
        places: p.data.length,
        events: e.data.length,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard counts");
    }
  }, [token]);

  // ------------------------------------
  // Events per place (bar chart)
  // ------------------------------------
  const loadEventsByPlace = useCallback(async () => {
    try {
      const res = await axios.get(`${API_ORIGIN}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const events = res.data;
      const map = {};

      events.forEach(ev => {
        const p = ev.place?.name || "Unknown";
        map[p] = (map[p] || 0) + 1;
      });

      const formatted = Object.keys(map).map(k => ({
        place: k,
        events: map[k],
      }));

      setEventsByPlace(formatted);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // ------------------------------------
  // Fake monthly visits (until backend adds real analytics)
  // ------------------------------------
  const loadMonthlyVisits = useCallback(() => {
    const sample = [
      { month: "Jan", visits: 120 },
      { month: "Feb", visits: 210 },
      { month: "Mar", visits: 150 },
      { month: "Apr", visits: 280 },
      { month: "May", visits: 200 },
      { month: "Jun", visits: 240 },
      { month: "Jul", visits: 300 },
      { month: "Aug", visits: 400 },
      { month: "Sep", visits: 250 },
      { month: "Oct", visits: 320 },
      { month: "Nov", visits: 410 },
      { month: "Dec", visits: 500 }
    ];
    setMonthlyVisits(sample);
  }, []);

  // ------------------------------------
  // Load data when page opens
  // ------------------------------------
  useEffect(() => {
    loadCounts();
    loadEventsByPlace();
    loadMonthlyVisits();   // sample data for now
  }, [loadCounts, loadEventsByPlace, loadMonthlyVisits]);

  // ------------------------------------
  // UI Rendering
  // ------------------------------------
  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>TirthSaathi Admin Dashboard</h2>

      {/* Links */}
      <ul style={{ marginBottom: 30 }}>
        <li><Link to="/admin/places">Manage Places</Link></li>
        <li><Link to="/admin/events">Manage Events</Link></li>
        <li><Link to="/admin/accommodations">Manage Accommodations</Link></li>
      </ul>

      {/* Statistic Cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-number">{counts.users}</div>
          <div className="stat-label">Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{counts.places}</div>
          <div className="stat-label">Places</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{counts.events}</div>
          <div className="stat-label">Events</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Monthly visits */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
          <h3>Monthly Visits</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyVisits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#6b2f25" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Events by place */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
          <h3>Events by Place</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={eventsByPlace}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="place" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
