import express from 'express';
import { queryOne, queryMany } from '../config/db.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, companySchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/companies
 * Get companies (with optional P.IVA filter)
 */
router.get('/', async (req, res, next) => {
  try {
    const { piva, search } = req.query;

    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];

    // Filter by P.IVA (exact match)
    if (piva) {
      params.push(piva);
      query += ` AND piva = $${params.length}`;
    }

    // Search by name or P.IVA
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR piva LIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const companies = await queryMany(query, params);

    res.json({
      companies,
      total: companies.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/companies/autocomplete
 * Autocomplete companies by name or P.IVA
 */
router.get('/autocomplete', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await queryMany(
      `SELECT id, piva, name, email
       FROM companies
       WHERE piva LIKE $1 OR name ILIKE $2
       ORDER BY name
       LIMIT 10`,
      [`${q}%`, `%${q}%`]
    );

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/companies/:id
 * Get company by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await queryOne(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
        message: 'No company found with this ID'
      });
    }

    res.json({ company });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/companies
 * Create new company
 */
router.post('/', validate(companySchema), async (req, res, next) => {
  try {
    const { piva, name, email, phone } = req.validatedBody;

    // Check if company with this P.IVA already exists
    const existing = await queryOne(
      'SELECT id, piva, name FROM companies WHERE piva = $1',
      [piva]
    );

    if (existing) {
      return res.status(409).json({
        error: 'Company already exists',
        message: 'A company with this P.IVA already exists',
        company: existing
      });
    }

    // Create company
    const company = await queryOne(
      `INSERT INTO companies (piva, name, email, phone, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [piva, name, email, phone, req.user.id]
    );

    console.log('✅ Company created:', piva);

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/companies/:id/reports
 * Get all reports for a specific company
 */
router.get('/:id/reports', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get company
    const company = await queryOne(
      'SELECT id, piva, name FROM companies WHERE id = $1',
      [id]
    );

    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    // Get reports for this company
    const reports = await queryMany(
      `SELECT id, status, created_at, completed_at,
              payload->>'riskScore' as risk_score,
              payload->>'riskCategory' as risk_category
       FROM reports
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      company,
      reports,
      total: reports.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
