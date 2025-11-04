/**
 * Authentication Service
 * Gestisce login, register, logout e token JWT
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'finreport_token';
const USER_KEY = 'finreport_user';

const authService = {
  /**
   * Register new user
   */
  async register(email, password, fullName) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token and user info
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Login user
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
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
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

      const data = await response.json();
      this.setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout(); // Clear invalid session
      throw error;
    }
  }
};

export default authService;
