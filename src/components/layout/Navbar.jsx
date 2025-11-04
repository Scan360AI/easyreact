import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="ri-pie-chart-line"></i>
          <span>FinReport Dashboard</span>
        </Link>

        <div className="navbar-nav">
          {!isHomePage && (
            <Link to="/" className="nav-link">
              <i className="ri-arrow-left-line"></i>
              Torna alla Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
