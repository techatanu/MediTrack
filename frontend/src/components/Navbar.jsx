import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <img src="/MediTrackLogo.png" alt="meditrack-logo" />
          </div>
          <span>MediTrack</span>
        </Link>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About us</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Admin Dashboard</Link></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/login" className="login-link">Log in</Link>
          <Link to="/signup" className="signup-link">Sign up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
