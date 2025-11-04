import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const user = authService.getUser();

  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      authService.logout();
      navigate('/login');
    }
  };

  // Don't show navbar on login/register pages
  if (isAuthPage) {
    return null;
  }

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

          {user && (
            <div className="navbar-user">
              <div className="user-info">
                <i className="ri-user-line"></i>
                <span className="user-name">{user.fullName || user.email}</span>
              </div>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <i className="ri-logout-box-line"></i>
                Esci
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
