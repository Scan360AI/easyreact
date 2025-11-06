import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
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

    // Validate password length (minimum 8 characters as per API)
    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(
        formData.email,
        formData.password,
        formData.nome || null
      );

      // Mostra messaggio di successo per conferma email
      if (result.requiresEmailConfirmation) {
        setSuccess(true);
        setError('');
      }
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

        {success && (
          <div className="auth-success">
            <i className="ri-mail-check-line"></i>
            <div>
              <strong>Registrazione completata!</strong>
              <p>Controlla la tua email per confermare l'account prima di effettuare il login.</p>
            </div>
          </div>
        )}

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">
                <i className="ri-user-line"></i>
                Nome (opzionale)
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Mario Rossi"
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
              minLength="8"
            />
            <small className="form-hint">Minimo 8 caratteri</small>
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
        )}

        <div className="auth-footer">
          <p>
            {success ? (
              <>
                Torna alla pagina di{' '}
                <Link to="/login">Login</Link>
              </>
            ) : (
              <>
                Hai già un account?{' '}
                <Link to="/login" state={{ from: location.state?.from }}>
                  Accedi
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
