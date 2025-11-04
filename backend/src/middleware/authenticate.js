import { verifyToken, extractToken } from '../config/auth.js';
import { queryOne } from '../config/db.js';

/**
 * Middleware to authenticate JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await queryOne(
      'SELECT id, email, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await queryOne(
        'SELECT id, email, full_name, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
