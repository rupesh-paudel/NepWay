import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>
            <i className="fas fa-route"></i> Welcome to NepWay
          </h1>
          <p style={{ fontSize: '1.3rem', fontStyle: 'italic', marginBottom: '10px', color: '#ffd700' }}>
            "Ride the Nepali Way"
          </p>
          <p>Your journey starts here. Connect with general users and drivers in your area.</p>
          
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              <i className="fas fa-user-plus"></i> Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
          </div>
          
          <div style={{ marginTop: '60px', opacity: 0.8 }}>
            <p>🚗 Find rides • 🚙 Offer rides • 💰 Save money • 🌱 Help environment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
