import React, { useEffect, useState } from "react";
import { Carousel, Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./BookStayPage.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

function BookStayPage() {
  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [stays, setStays] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // 🔹 Load admin-added places
  useEffect(() => {
    async function loadPlaces() {
      try {
        const res = await fetch(API_BASE + "/api/places");
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        setError("Failed to load places");
      }
    }
    loadPlaces();
  }, []);

  // 🔹 Load stays when place is selected
  useEffect(() => {
    if (!selectedPlaceId) {
      setStays([]);
      return;
    }

    async function loadStays() {
      try {
        const res = await fetch(
          API_BASE + "/api/accommodations?placeId=" + selectedPlaceId
        );
        const data = await res.json();
        setStays(data);
      } catch (err) {
        setError("Failed to load home stays");
      }
    }

    loadStays();
  }, [selectedPlaceId]);

  return React.createElement(
    "div",
    { style: { padding: 20 } },

    React.createElement("h2", { className: "mb-4" }, "Book Stay"),

    error &&
      React.createElement(
        "p",
        { style: { color: "crimson" } },
        error
      ),

    /* 🔹 PLACE SELECTION */
    React.createElement(
      "div",
      { style: { maxWidth: 500, marginBottom: 20 } },
      React.createElement("label", null, "Select Place"),
      React.createElement(
        "select",
        {
          className: "form-control",
          value: selectedPlaceId,
          onChange: function (e) {
            setSelectedPlaceId(e.target.value);
          },
        },
        React.createElement("option", { value: "" }, "Select a place..."),
        places.map(function (p) {
          return React.createElement(
            "option",
            { key: p._id, value: p._id },
            p.name
          );
        })
      )
    ),

   /* 🔹 IMAGE CAROUSEL */
React.createElement(
  "div",
  { className: "bookstay-carousel-wrap" },

  React.createElement(
    Carousel,
    {
      id: "bookStayCarousel",
      indicators: true,
      controls: true,
      interval: 4000
    },

    React.createElement(
      Carousel.Item,
      null,
      React.createElement("img", {
        className: "bookstay-carousel-img",
        src: "/assests/stay1.png",
        alt: "Slide 1"
      })
    ),

    React.createElement(
      Carousel.Item,
      null,
      React.createElement("img", {
        className: "bookstay-carousel-img",
        src: "/assests/stay2.png",
        alt: "Slide 2"
      })
    ),

    React.createElement(
      Carousel.Item,
      null,
      React.createElement("img", {
        className: "bookstay-carousel-img",
        src: "/assests/stay3.png",
        alt: "Slide 3"
      })
    ),

    React.createElement(
      Carousel.Item,
      null,
      React.createElement("img", {
        className: "bookstay-carousel-img",
        src: "/assests/stay4.png",
        alt: "Slide 4"
      })
    )
  )
),
   /* 🔹 BOOK BUTTON */
React.createElement(
  Button,
  {
    variant: "primary",
    size: "lg",
    className: "mb-5",
    onClick: function () {
      navigate("/stay-booking");
    }
  },
  "Book Home Stay"
),

    /* 🔹 LIST OF STAYS */
    React.createElement("h4", { className: "mb-3" }, "Available Home Stays"),

    stays.length === 0 &&
      selectedPlaceId &&
      React.createElement("p", null, "No homestays available for this place."),

    React.createElement(
      Row,
      null,
      stays.map(function (stay) {
        return React.createElement(
          Col,
          { md: 4, key: stay._id, className: "mb-4" },
          React.createElement(
            Card,
            null,
            React.createElement(Card.Img, {
              variant: "top",
              src: stay.images && stay.images[0]
                ? stay.images[0]
                : "/assests/stay1.png",
            }),
            React.createElement(
              Card.Body,
              null,
              React.createElement(Card.Title, null, stay.name),
              React.createElement(Card.Text, null, stay.description),
              React.createElement(
                Card.Text,
                null,
                React.createElement(
                  "strong",
                  null,
                  "₹" + stay.pricePerNight
                ),
                " / night"
              ),
              React.createElement(
                Button,
                { variant: "outline-primary" },
                "View Details"
              )
            )
          )
        );
      })
    )
  );
}

export default BookStayPage;