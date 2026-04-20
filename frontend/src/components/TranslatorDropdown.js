import React, { useState } from "react";

export default function TranslatorDropdown() {
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
    { code: "kn", label: "Kannada" },
    { code: "ml", label: "Malayalam" },
    { code: "gu", label: "Gujarati" },
    { code: "mr", label: "Marathi" },
    { code: "bn", label: "Bengali" },
    { code: "pa", label: "Punjabi" },
    { code: "or", label: "Odia" },
  ];

  const waitForCombo = (tries = 30) =>
    new Promise((resolve, reject) => {
      const tick = () => {
        const select = document.querySelector(".goog-te-combo");
        if (select) return resolve(select);
        if (tries-- <= 0) return reject(new Error("goog-te-combo not found"));
        setTimeout(tick, 300);
      };
      tick();
    });

  const changeLanguage = async (lang) => {
    let select;
    try {
      select = await waitForCombo();
    } catch (e) {
      console.warn("Google Translate not ready yet.");
      return;
    }

    if (lang === "en") {
      select.value = ""; // reset
      select.dispatchEvent(new Event("change"));
      return;
    }

    select.value = lang;
    select.dispatchEvent(new Event("change"));
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 20px",
          background: "#8e7cf5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🌐 Choose Language
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setOpen(false);
              }}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}