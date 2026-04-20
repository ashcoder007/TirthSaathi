import React from "react";

function AssistDescription() {
  return (
    <section
      style={{
        padding: "50px 20px",
        backgroundColor: "#fff7f1",
        textAlign: "center",
      }}
    >
      <h3 style={{ color: "#6b2f1a", marginBottom: "15px" }}>
        Your Pilgrimage, Made Simple
      </h3>

      <p
        style={{
          maxWidth: "720px",
          margin: "0 auto 30px",
          color: "#555",
          fontSize: "16px",
          lineHeight: "1.7",
        }}
      >
        TirthSaathi supports you throughout your sacred journey — from planning
        yatras and navigating routes, to finding comfortable stays and receiving
        assistance when you need it most. Travel with faith, comfort, and peace
        of mind.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          fontSize: "15px",
        }}
      >
        <div>🛕 Curated Pilgrimage Destinations</div>
        <div>🗺️ Easy Navigation & Maps</div>
        <div>🏠 Comfortable Home Stays</div>
        <div>🤝 Elderly & Emergency Support</div>
      </div>
    </section>
  );
}

export default AssistDescription;