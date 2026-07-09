import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="brand-mark"><span></span><span></span><span></span></span>
            <span>The Commons</span>
          </Link>

          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/items" className={`nav-link ${isActive('/items') ? 'active' : ''}`}>
              Browse Items
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/items/new" className={`nav-link ${isActive('/items/new') ? 'active' : ''}`}>
                  List Item
                </Link>
                <Link to="/rentals" className={`nav-link ${isActive('/rentals') ? 'active' : ''}`}>
                  Rentals
                </Link>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <a href="http://localhost:5000/admin" className="nav-link">
                    Admin
                  </a>
                )}
                
                <div className="nav-dropdown">
                  <button className="nav-dropdown-btn">
                    <span className="user-avatar">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    {user?.full_name?.split(' ')[0] || 'User'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className="nav-dropdown-content">
                    <Link to="/profile">My Profile</Link>
                    <button onClick={handleLogout} className="logout-link">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Join
                </Link>
              </>
            )}
          </div>

          <button className="nav-toggle" onClick={toggleMobile}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'active' : ''}`}>
        <Link to="/" onClick={toggleMobile}>Home</Link>
        <Link to="/items" onClick={toggleMobile}>Browse Items</Link>
        {isAuthenticated ? (
          <>
            <Link to="/items/new" onClick={toggleMobile}>List Item</Link>
            <Link to="/rentals" onClick={toggleMobile}>Rentals</Link>
            <Link to="/dashboard" onClick={toggleMobile}>Dashboard</Link>
            <Link to="/profile" onClick={toggleMobile}>My Profile</Link>
            {user?.role === 'admin' && (
              <a href="http://localhost:5000/admin" onClick={toggleMobile}>Admin</a>
            )}
            <button onClick={() => { handleLogout(); toggleMobile(); }} className="logout-link">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={toggleMobile}>Login</Link>
            <Link to="/register" onClick={toggleMobile}>Join</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
