import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_ORIGIN } from "../config";
import {
  buildOfflineDocument,
  downloadHtmlDocument,
  htmlEscape,
  openPrintableDocument
} from "../utils/downloadDocument";
import "./eldercare.css";

const STORAGE_KEY = "tirthsaathi_elder_care_profile";

const defaultProfile = {
  pilgrimName: "",
  age: "",
  bloodGroup: "",
  preferredLanguage: "Hindi",
  selectedPlaceId: "",
  mobilityLevel: "slow-walking",
  healthConditions: "",
  medicines: "",
  allergies: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  companionPhone: "",
  notes: ""
};

const careChecklists = {
  "slow-walking": [
    "Keep the darshan route short and avoid unnecessary detours.",
    "Take a seated rest after every 25 to 30 minutes of walking.",
    "Use morning or late afternoon slots when heat and crowd pressure are lower."
  ],
  wheelchair: [
    "Ask for wheelchair support before joining the main queue.",
    "Keep one companion beside the pilgrim and one person ahead for coordination.",
    "Prefer official entry points, ramps, and help desks over crowded shortcuts."
  ],
  "needs-assistance": [
    "Do not let the pilgrim walk alone inside crowded temple lanes.",
    "Keep medicines, ID proof, water, and emergency contacts in one easy pouch.",
    "Pause before stairs, narrow gates, and queue turns to avoid sudden pushing."
  ]
};

export default function ElderCarePage() {
  const [places, setPlaces] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(saved) });
      } catch (err) {
        console.error("Failed to load elder care profile", err);
      }
    }

    axios
      .get(`${API_ORIGIN}/api/places`)
      .then((res) => setPlaces(res.data || []))
      .catch((err) => console.error("Failed to load places", err));
  }, []);

  const selectedPlace = useMemo(
    () => places.find((p) => p._id === profile.selectedPlaceId),
    [places, profile.selectedPlaceId]
  );

  const mobilityChecklist = careChecklists[profile.mobilityLevel] || careChecklists["slow-walking"];

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSavedMessage("");
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSavedMessage("Saved on this device for offline use.");
  };

  const buildCareDocument = () => {
    const profileRows = [
      ["Name", profile.pilgrimName || "-"],
      ["Age", profile.age || "-"],
      ["Blood Group", profile.bloodGroup || "-"],
      ["Preferred Language", profile.preferredLanguage || "-"],
      ["Yatra Place", selectedPlace?.name || "-"],
      ["Mobility Support", profile.mobilityLevel.replace(/-/g, " ")],
      ["Health Conditions", profile.healthConditions || "-"],
      ["Medicines", profile.medicines || "-"],
      ["Allergies", profile.allergies || "-"]
    ]
      .map(([label, value]) => `<tr><th>${htmlEscape(label)}</th><td>${htmlEscape(value)}</td></tr>`)
      .join("");

    const contactRows = [
      ["Emergency Contact", profile.emergencyContactName || "-", profile.emergencyContactPhone || "-"],
      ["Companion Phone", "Travel companion", profile.companionPhone || "-"]
    ]
      .map(
        ([label, name, phone]) =>
          `<tr><th>${htmlEscape(label)}</th><td>${htmlEscape(name)}</td><td>${htmlEscape(phone)}</td></tr>`
      )
      .join("");

    return buildOfflineDocument({
      title: "TirthSaathi Elder Care Card",
      subtitle: "Keep this with the pilgrim, companion, and family before darshan.",
      sections: [
        {
          heading: "Pilgrim Health Profile",
          html: `<table><tbody>${profileRows}</tbody></table>`
        },
        {
          heading: "Emergency Contacts",
          html: `<table><thead><tr><th>Type</th><th>Name</th><th>Phone</th></tr></thead><tbody>${contactRows}</tbody></table>`
        },
        {
          heading: "Mobility Plan",
          items: mobilityChecklist
        },
        {
          heading: "Carry Before Leaving",
          items: [
            "Daily medicines and one extra dose in a separate pouch.",
            "Water bottle, light snack, cap or scarf, and comfortable footwear.",
            "ID proof, emergency contact slip, and a small amount of cash.",
            "Phone numbers written on paper in case the phone battery drains."
          ]
        },
        {
          heading: "Low Network Instructions",
          items: [
            "Fix a meeting point before entering the queue.",
            "Share this care card with the companion and family.",
            "If separated, go to the nearest police, temple help desk, or medical booth.",
            profile.notes || "Add any personal note before printing if needed."
          ]
        }
      ]
    });
  };

  const handleDownload = () => {
    handleSave();
    downloadHtmlDocument("tirthsaathi-elder-care-card.html", buildCareDocument());
  };

  const handlePrint = () => {
    handleSave();
    const opened = openPrintableDocument(buildCareDocument());
    if (!opened) alert("Please allow popups to print or save this elder care card as PDF.");
  };

  return (
    <div className="elder-care-page">
      <header className="elder-header">
        <div>
          <h1>Elderly Care</h1>
          <p>Prepare a simple safety profile, care checklist, and offline card for senior pilgrims.</p>
        </div>
        <div className="elder-actions">
          <a href="tel:112" className="elder-call">Call 112</a>
          <a href="tel:102" className="elder-call secondary">Ambulance 102</a>
        </div>
      </header>

      <main className="elder-grid">
        <section className="elder-panel">
          <h2>Senior Pilgrim Profile</h2>
          <div className="elder-form-grid">
            <label>
              Pilgrim Name
              <input value={profile.pilgrimName} onChange={(e) => handleChange("pilgrimName", e.target.value)} />
            </label>
            <label>
              Age
              <input type="number" min="1" value={profile.age} onChange={(e) => handleChange("age", e.target.value)} />
            </label>
            <label>
              Blood Group
              <select value={profile.bloodGroup} onChange={(e) => handleChange("bloodGroup", e.target.value)}>
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </label>
            <label>
              Preferred Language
              <input value={profile.preferredLanguage} onChange={(e) => handleChange("preferredLanguage", e.target.value)} />
            </label>
            <label>
              Yatra Place
              <select value={profile.selectedPlaceId} onChange={(e) => handleChange("selectedPlaceId", e.target.value)}>
                <option value="">Select place</option>
                {places.map((place) => (
                  <option key={place._id} value={place._id}>{place.name}</option>
                ))}
              </select>
            </label>
            <label>
              Mobility Support
              <select value={profile.mobilityLevel} onChange={(e) => handleChange("mobilityLevel", e.target.value)}>
                <option value="slow-walking">Slow walking</option>
                <option value="wheelchair">Wheelchair support</option>
                <option value="needs-assistance">Needs close assistance</option>
              </select>
            </label>
          </div>

          <label className="full-field">
            Health Conditions
            <textarea value={profile.healthConditions} onChange={(e) => handleChange("healthConditions", e.target.value)} placeholder="Diabetes, BP, asthma, heart condition..." />
          </label>
          <label className="full-field">
            Medicines
            <textarea value={profile.medicines} onChange={(e) => handleChange("medicines", e.target.value)} placeholder="Medicine name, dose, timing..." />
          </label>
          <label className="full-field">
            Allergies
            <textarea value={profile.allergies} onChange={(e) => handleChange("allergies", e.target.value)} placeholder="Food, medicine, dust, fragrance..." />
          </label>
        </section>

        <aside className="elder-panel elder-plan">
          <h2>Care Plan</h2>
          <ul>
            {mobilityChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="quick-grid">
            <div>
              <strong>Best rhythm</strong>
              <span>Walk, rest, hydrate, then continue.</span>
            </div>
            <div>
              <strong>Queue safety</strong>
              <span>Keep one companion within arm's reach.</span>
            </div>
            <div>
              <strong>Heat care</strong>
              <span>Prefer shaded waiting and avoid noon rush.</span>
            </div>
            <div>
              <strong>Network backup</strong>
              <span>Print or download this card before travel.</span>
            </div>
          </div>
        </aside>

        <section className="elder-panel">
          <h2>Contacts And Notes</h2>
          <div className="elder-form-grid">
            <label>
              Emergency Contact Name
              <input value={profile.emergencyContactName} onChange={(e) => handleChange("emergencyContactName", e.target.value)} />
            </label>
            <label>
              Emergency Contact Phone
              <input value={profile.emergencyContactPhone} onChange={(e) => handleChange("emergencyContactPhone", e.target.value)} />
            </label>
            <label>
              Companion Phone
              <input value={profile.companionPhone} onChange={(e) => handleChange("companionPhone", e.target.value)} />
            </label>
          </div>
          <label className="full-field">
            Personal Notes
            <textarea value={profile.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Meeting point, hotel address, doctor advice, special darshan notes..." />
          </label>
          <div className="elder-button-row">
            <button onClick={handleSave} className="elder-primary">Save Profile</button>
            <button onClick={handleDownload} className="elder-secondary">Download Offline Card</button>
            <button onClick={handlePrint} className="elder-secondary">Print / Save PDF</button>
          </div>
          {savedMessage && <p className="elder-saved">{savedMessage}</p>}
        </section>

        <section className="elder-panel">
          <h2>Before Darshan Checklist</h2>
          <div className="checklist-grid">
            {[
              "Medicines packed",
              "Water and light snack",
              "ID proof and cash",
              "Emergency numbers on paper",
              "Meeting point fixed",
              "Comfortable footwear",
              "Companion assigned",
              "Offline route downloaded"
            ].map((item) => (
              <label key={item} className="check-item">
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
