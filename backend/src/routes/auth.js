import express from 'express';
import bcrypt from 'bcrypt';
import { query, queryOne } from '../config/db.js';
import { generateToken } from '../config/auth.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, fullName } = req.validatedBody;

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await queryOne(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email, passwordHash, fullName]
    );

    // Generate JWT token
    const token = generateToken(result);

    console.log('✅ User registered:', email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        fullName: result.full_name,
        createdAt: result.created_at
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Get user
    const user = await queryOne(
      'SELECT id, email, password_hash, full_name, is_active FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    console.log('✅ User logged in:', email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res, next) => {
  try {
    // This would use authenticate middleware in server.js
    res.json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
