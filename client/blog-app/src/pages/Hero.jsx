import React from "react";
import "./Hero.css";
import heroImage from './img.jpg';

const Hero = () => {
  return (
    <div className="hero-container">
      <img src={heroImage} alt="Hero" className="hero-image" />
      <div className="hero-text">
        <div className="hero-line animate-line1">
          Welcome to ByteScript
        </div>
        <div className="hero-line animate-line2">
          Your one stop for dev logs, educational blogs and tech news.
        </div>
      </div>
    </div>
  );
};

export default Hero;