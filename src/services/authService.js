/**
 * Authentication Service
 * Gestisce login, register, logout e token JWT
 * Adattato per ScanEasy API
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'finreport_token';
const USER_KEY = 'finreport_user';

const authService = {
  /**
   * Register new user
   * Note: L'utente deve confermare l'email prima di poter fare login
   */
  async register(email, password, nome = null) {
    try {
      const response = await fetch(`${API_URL}/api/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          nome,
          // tenant_id non viene passato come richiesto
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Registration failed');
      }

      // Non salviamo token/user perché l'utente deve prima confermare l'email
      return {
        user: data,
        requiresEmailConfirmation: true
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Login user
   * Restituisce access_token e token_type, poi recupera i dati utente
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Login failed');
      }

      // Salva il token (access_token dalla risposta)
      this.setToken(data.access_token);

      // Recupera i dati utente con il token
      const user = await this.getCurrentUser();

      return {
        access_token: data.access_token,
        token_type: data.token_type,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set token in localStorage
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get current user from localStorage
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Set user in localStorage
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired (simple check, backend will validate properly)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Get authorization header for API calls
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * Get current user from API (verify token)
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const userData = await response.json();
      this.setUser(userData);
      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout(); // Clear invalid session
      throw error;
    }
  },

  /**
   * Request password reset
   * Invia una email con link per reset password
   */
  async requestPasswordReset(email, frontendUrl) {
    try {
      const response = await fetch(`${API_URL}/api/auth/password-reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          frontend_url: frontendUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * Resetta la password usando il token ricevuto via email
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_URL}/api/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  /**
   * Change password (when logged in)
   * Cambia la password dell'utente corrente
   */
  async changePassword(userId, currentPassword, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          user_id: userId,
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.message || 'Password change failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
};

export default authService;
