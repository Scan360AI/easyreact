import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }

    try {
      await authService.register(
        formData.email,
        formData.password,
        formData.fullName
      );
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <p>Crea il tuo account</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="ri-error-warning-line"></i>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">
              <i className="ri-user-line"></i>
              Nome Completo
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Mario Rossi"
              required
              autoComplete="name"
              autoFocus
            />
          </div>

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
              autoComplete="new-password"
              minLength="6"
            />
            <small className="form-hint">Minimo 6 caratteri</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="ri-lock-line"></i>
              Conferma Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
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
                Registrazione in corso...
              </>
            ) : (
              <>
                <i className="ri-user-add-line"></i>
                Registrati
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Hai già un account?{' '}
            <Link to="/login" state={{ from: location.state?.from }}>
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
