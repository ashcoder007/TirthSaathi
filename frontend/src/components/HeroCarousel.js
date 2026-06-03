// HeroCarousel.js
import React from "react";
import { Carousel } from "react-bootstrap";
import "./HeroCarousel.css";
import { publicAsset } from "../config";

const HeroCarousel = () => {
  return (
    <section className="hero-section">
      <div className="container-narrow">
        <div className="hero-top text-center">
          <h1 className="brand-title">TirthSaathi</h1>
          <p className="brand-sub">Your trusted companion on the path of pilgrimage.</p>
        </div>

        <Carousel fade indicators controls interval={4500}>
          <Carousel.Item>
            <img
              className="d-block w-100 hero-img"
              src={publicAsset("/assests/hero/hero1.jpeg")}
              alt="Explore sacred destinations"
            />
            <Carousel.Caption>
              <p className="carousel-caption">Explore sacred destinations.</p>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <img
              className="d-block w-100 hero-img"
              src={publicAsset("/assests/hero/hero2.jpg")}
              alt="Journey with peace of mind"
            />
            <Carousel.Caption>
              <p className="carousel-caption">Journey with peace of mind.</p>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <img
              className="d-block w-100 hero-img"
              src={publicAsset("/assests/hero/hero3.jpg")}
              alt="All the assistance you need"
            />
            <Carousel.Caption>
              <p className="carousel-caption">All the assistance you need.</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>
    </section>
  );
};

export default HeroCarousel;
