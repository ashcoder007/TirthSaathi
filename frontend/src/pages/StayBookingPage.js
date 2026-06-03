import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, publicAsset } from "../config";

function StayBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // If user came from BookStay page with a selected stay
  const preselectedStay = location.state && location.state.stay ? location.state.stay : null;

  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    preselectedStay && preselectedStay.placeId ? String(preselectedStay.placeId) : ""
  );

  const [stays, setStays] = useState([]);
  const [selectedStayId, setSelectedStayId] = useState(preselectedStay ? preselectedStay._id : "");

  const selectedStay = useMemo(() => {
    return stays.find((s) => String(s._id) === String(selectedStayId)) || preselectedStay || null;
  }, [stays, selectedStayId, preselectedStay]);

  // Booking form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");

  // Payment placeholder state
  const [paymentStatus, setPaymentStatus] = useState("unpaid"); // unpaid | processing | paid
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load places
  useEffect(() => {
    async function loadPlaces() {
      try {
        setError("");
        const res = await fetch(`${API_BASE_URL}/places`);
        const data = await res.json();
        setPlaces(data);
      } catch (e) {
        setError("Failed to load places");
      }
    }
    loadPlaces();
  }, []);

  // Load stays for selected place
  useEffect(() => {
    if (!selectedPlaceId) {
      setStays([]);
      return;
    }

    async function loadStays() {
      try {
        setError("");
        setSuccessMsg("");
        const res = await fetch(`${API_BASE_URL}/accommodations?placeId=${selectedPlaceId}`);
        const data = await res.json();
        setStays(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Failed to load stays for this place");
      }
    }

    loadStays();
  }, [selectedPlaceId]);

  // Reset payment if stay changes
  useEffect(() => {
    setPaymentStatus("unpaid");
  }, [selectedStayId]);

  function validateForm() {
    if (!selectedPlaceId) return "Please select a place.";
    if (!selectedStayId) return "Please select a stay.";
    if (!fullName.trim()) return "Please enter your full name.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!checkIn) return "Please select check-in date.";
    if (!checkOut) return "Please select check-out date.";
    if (new Date(checkOut) <= new Date(checkIn)) return "Check-out must be after check-in.";
    if (!guests || guests < 1) return "Guests must be at least 1.";
    return "";
  }

  // Placeholder payment function (Razorpay later)
  async function handleInitiatePayment() {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setSuccessMsg("");
    setPaymentStatus("processing");

    // Simulate payment success
    setTimeout(function () {
      setPaymentStatus("paid");
      setSuccessMsg("Payment successful (demo). You can now confirm booking.");
    }, 1200);
  }

  async function handleConfirmBooking() {
    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }
    if (paymentStatus !== "paid") {
      setError("Please complete payment first.");
      return;
    }

    setError("");
    setSuccessMsg("");

    // ✅ You will connect this with backend booking API later
    // For now: show success and navigate back
    setSuccessMsg("Booking confirmed! (demo) We will notify you with details.");

    setTimeout(function () {
      navigate("/book-stay");
    }, 1200);
  }

  return React.createElement(
    "div",
    { style: { padding: 20 } },

    React.createElement("h2", { className: "mb-4" }, "Book Your Stay"),

    error && React.createElement("div", { style: { color: "crimson", marginBottom: 12 } }, error),
    successMsg && React.createElement("div", { style: { color: "green", marginBottom: 12 } }, successMsg),

    // Place selection
    React.createElement(
      "div",
      { style: { maxWidth: 520, marginBottom: 20 } },
      React.createElement("label", null, "Select Place"),
      React.createElement(
        "select",
        {
          className: "form-control",
          value: selectedPlaceId,
          onChange: function (e) {
            setSelectedPlaceId(e.target.value);
            setSelectedStayId("");
          },
        },
        React.createElement("option", { value: "" }, "Select a place..."),
        places.map(function (p) {
          return React.createElement("option", { key: p._id, value: p._id }, p.name);
        })
      )
    ),

    // Stays list
    React.createElement("h5", { className: "mb-3" }, "Choose a Stay"),
    React.createElement(
      Row,
      null,
      stays.map(function (stay) {
        var isSelected = String(stay._id) === String(selectedStayId);
        var img = stay.images && stay.images[0] ? stay.images[0] : publicAsset("/assests/stay1.png");

        return React.createElement(
          Col,
          { md: 4, key: stay._id, className: "mb-4" },
          React.createElement(
            Card,
            {
              style: {
                cursor: "pointer",
                border: isSelected ? "2px solid #8e7cf5" : "1px solid #ddd",
              },
              onClick: function () {
                setSelectedStayId(stay._id);
              },
            },
            React.createElement(Card.Img, { variant: "top", src: img }),
            React.createElement(
              Card.Body,
              null,
              React.createElement(Card.Title, null, stay.name),
              React.createElement(Card.Text, null, stay.description || ""),
              React.createElement(
                Card.Text,
                null,
                React.createElement("strong", null, "₹" + (stay.pricePerNight || "--")),
                " / night"
              ),
              isSelected
                ? React.createElement(
                    "div",
                    { style: { fontSize: 13, color: "#6b2f1a" } },
                    "Selected"
                  )
                : null
            )
          )
        );
      })
    ),

    // Booking form + Payment
    React.createElement("hr", null),

    React.createElement(
      Row,
      null,

      // Left: Booking form
      React.createElement(
        Col,
        { md: 7, className: "mb-4" },
        React.createElement("h5", { className: "mb-3" }, "Booking Details"),

        React.createElement(
          Form,
          null,
          React.createElement(Form.Group, { className: "mb-3" },
            React.createElement(Form.Label, null, "Full Name"),
            React.createElement(Form.Control, {
              value: fullName,
              onChange: function (e) { setFullName(e.target.value); },
              placeholder: "Enter your name"
            })
          ),

          React.createElement(Form.Group, { className: "mb-3" },
            React.createElement(Form.Label, null, "Phone Number"),
            React.createElement(Form.Control, {
              value: phone,
              onChange: function (e) { setPhone(e.target.value); },
              placeholder: "Enter your phone"
            })
          ),

          React.createElement(
            Row,
            null,
            React.createElement(
              Col,
              { md: 6 },
              React.createElement(Form.Group, { className: "mb-3" },
                React.createElement(Form.Label, null, "Check-in"),
                React.createElement(Form.Control, {
                  type: "date",
                  value: checkIn,
                  onChange: function (e) { setCheckIn(e.target.value); }
                })
              )
            ),
            React.createElement(
              Col,
              { md: 6 },
              React.createElement(Form.Group, { className: "mb-3" },
                React.createElement(Form.Label, null, "Check-out"),
                React.createElement(Form.Control, {
                  type: "date",
                  value: checkOut,
                  onChange: function (e) { setCheckOut(e.target.value); }
                })
              )
            )
          ),

          React.createElement(Form.Group, { className: "mb-3" },
            React.createElement(Form.Label, null, "Guests"),
            React.createElement(Form.Control, {
              type: "number",
              min: 1,
              value: guests,
              onChange: function (e) { setGuests(Number(e.target.value || 1)); }
            })
          ),

          React.createElement(Form.Group, { className: "mb-3" },
            React.createElement(Form.Label, null, "Notes (optional)"),
            React.createElement(Form.Control, {
              as: "textarea",
              rows: 3,
              value: notes,
              onChange: function (e) { setNotes(e.target.value); },
              placeholder: "Any special request?"
            })
          )
        )
      ),

      // Right: Payment box
      React.createElement(
        Col,
        { md: 5 },
        React.createElement(
          Card,
          { style: { borderRadius: 12 } },
          React.createElement(
            Card.Body,
            null,
            React.createElement("h5", { className: "mb-3" }, "Payment"),

            selectedStay
              ? React.createElement(
                  "div",
                  { style: { marginBottom: 12, color: "#444" } },
                  React.createElement("div", null, React.createElement("strong", null, selectedStay.name)),
                  React.createElement("div", null, "₹" + (selectedStay.pricePerNight || "--") + " / night")
                )
              : React.createElement("div", { style: { marginBottom: 12, color: "#666" } }, "Select a stay to see price."),

            React.createElement(
              "div",
              { style: { fontSize: 13, color: "#666", marginBottom: 14 } },
              "Payment gateway will be Razorpay (you will add API later)."
            ),

            React.createElement(
              Button,
              {
                variant: "outline-primary",
                disabled: paymentStatus === "processing",
                onClick: handleInitiatePayment,
                style: { width: "100%", marginBottom: 10 },
              },
              paymentStatus === "processing" ? "Processing..." : "Initiate Payment"
            ),

            React.createElement(
              Button,
              {
                variant: "primary",
                disabled: paymentStatus !== "paid",
                onClick: handleConfirmBooking,
                style: { width: "100%" },
              },
              "Confirm Booking"
            ),

            React.createElement(
              "div",
              { style: { marginTop: 12, fontSize: 13 } },
              paymentStatus === "paid"
                ? React.createElement("span", { style: { color: "green" } }, "Payment: Success ✅")
                : React.createElement("span", { style: { color: "#999" } }, "Payment: Not completed")
            )
          )
        )
      )
    )
  );
}

export default StayBookingPage;
