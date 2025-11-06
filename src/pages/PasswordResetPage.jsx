import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      setLoading(false);
      return;
    }

    // Validate password length (minimum 8 characters)
    if (formData.newPassword.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Token mancante. Usa il link ricevuto via email.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Password reset failed. The token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <i className="ri-lock-line auth-icon"></i>
            <h1>Token Mancante</h1>
            <p>Usa il link ricevuto via email per resettare la password</p>
          </div>
          <div className="auth-footer">
            <p>
              <Link to="/password-reset-request">
                Richiedi un nuovo link
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <i className="ri-lock-password-line auth-icon"></i>
          <h1>Reset Password</h1>
          <p>Inserisci la tua nuova password</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="ri-error-warning-line"></i>
            {error}
          </div>
        )}

        {success ? (
          <>
            <div className="auth-success">
              <i className="ri-checkbox-circle-line"></i>
              <div>
                <strong>Password aggiornata con successo!</strong>
                <p>Ora puoi effettuare il login con la nuova password.</p>
              </div>
            </div>
            <div className="auth-footer">
              <p>
                <Link to="/login">
                  Vai al Login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newPassword">
                  <i className="ri-lock-line"></i>
                  Nuova Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength="8"
                  autoFocus
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
                    Aggiornamento in corso...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    Reset Password
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Ricordato la password?{' '}
                <Link to="/login">
                  Torna al Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
