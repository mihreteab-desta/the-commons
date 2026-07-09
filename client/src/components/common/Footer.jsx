import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>The Commons</span>
          </div>
          <p>Building stronger neighborhoods through sharing.</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Explore</h4>
            <Link to="/items">Browse Items</Link>
          </div>
          <div className="footer-column">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 The Commons. Built with React, Node.js, Express &amp; PostgreSQL.</p>
      </div>
    </footer>
  );
};

export default Footer;