import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password);
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <i className="ri-pie-chart-line auth-icon"></i>
          <h1>FinReport Dashboard</h1>
          <p>Accedi al tuo account</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="ri-error-warning-line"></i>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <i className="ri-mail-line"></i>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tuo@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="ri-lock-line"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line spin"></i>
                Accesso in corso...
              </>
            ) : (
              <>
                <i className="ri-login-box-line"></i>
                Accedi
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Non hai un account?{' '}
            <Link to="/register" state={{ from: location.state?.from }}>
              Registrati
            </Link>
          </p>
        </div>

        <div className="auth-demo">
          <p className="demo-title">
            <i className="ri-information-line"></i>
            Account Demo
          </p>
          <p className="demo-credentials">
            <strong>Email:</strong> demo@finreport.com<br />
            <strong>Password:</strong> demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
