import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <div className="nepway-logo">
              <div className="logo-icon">
                <i className="fas fa-mountain"></i>
                <i className="fas fa-route"></i>
              </div>
              <span className="logo-text">NepWay</span>
            </div>
          </Link>
          
          <div className="navbar-nav">
            {isAuthenticated ? (
              <>
                <span className="user-info">
                  Welcome, {user?.name} ({user?.role})
                </span>
                <button onClick={onLogout} className="btn btn-secondary">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
