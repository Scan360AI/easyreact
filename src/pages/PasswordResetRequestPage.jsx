import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

const PasswordResetRequestPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Frontend URL dove l'utente verrà reindirizzato con il token
      const frontendUrl = `${window.location.origin}/password-reset`;

      await authService.requestPasswordReset(email, frontendUrl);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <i className="ri-mail-send-line auth-icon"></i>
          <h1>Password Dimenticata?</h1>
          <p>Inserisci la tua email per ricevere il link di reset</p>
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
              <i className="ri-mail-check-line"></i>
              <div>
                <strong>Email inviata!</strong>
                <p>Controlla la tua casella email e clicca sul link per resettare la password.</p>
              </div>
            </div>
            <div className="auth-footer">
              <p>
                <Link to="/login">
                  Torna al Login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="tuo@email.com"
                  required
                  autoComplete="email"
                  autoFocus
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
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line"></i>
                    Invia Link di Reset
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

export default PasswordResetRequestPage;
