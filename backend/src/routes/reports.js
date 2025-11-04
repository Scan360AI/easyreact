import express from 'express';
import { query, queryOne, queryMany } from '../config/db.js';
import { authenticate, optionalAuth } from '../middleware/authenticate.js';
import { validate, validateQuery, createReportSchema, completeReportSchema, reportFiltersSchema } from '../utils/validation.js';
import { triggerReportGeneration, verifyCallbackSecret } from '../services/n8n.js';

const router = express.Router();

/**
 * POST /api/reports
 * Create new report and trigger n8n workflow
 * Requires authentication
 */
router.post('/', authenticate, validate(createReportSchema), async (req, res, next) => {
  try {
    const { piva, companyName, email, phone, companyId } = req.validatedBody;

    // Generate unique report ID
    const reportId = `rep-${Date.now()}`;

    let finalCompanyId = companyId;

    // If no companyId provided, check if company exists or create it
    if (!finalCompanyId) {
      let company = await queryOne(
        'SELECT id FROM companies WHERE piva = $1',
        [piva]
      );

      if (!company) {
        // Create new company
        company = await queryOne(
          `INSERT INTO companies (piva, name, email, phone, created_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [piva, companyName, email, phone, req.user.id]
        );
        console.log('✅ Auto-created company:', piva);
      }

      finalCompanyId = company.id;
    }

    // Create report in database with status "processing"
    const report = await queryOne(
      `INSERT INTO reports (id, company_id, user_id, status)
       VALUES ($1, $2, $3, 'processing')
       RETURNING *`,
      [reportId, finalCompanyId, req.user.id]
    );

    console.log('✅ Report created:', reportId);

    // Trigger n8n workflow (async, don't wait for it)
    triggerReportGeneration({
      reportId,
      piva,
      companyName,
      email,
      phone
    }).catch(error => {
      console.error('⚠️ n8n trigger failed (report will remain in processing):', error.message);
    });

    res.status(201).json({
      message: 'Report created successfully',
      reportId: report.id,
      status: report.status,
      createdAt: report.created_at
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/my/reports
 * Get reports for current user with filters
 * Requires authentication
 */
router.get('/my', authenticate, validateQuery(reportFiltersSchema), async (req, res, next) => {
  try {
    const { status, search, from, to, limit, offset } = req.validatedQuery;

    // Build query
    let sqlQuery = `
      SELECT
        r.id,
        r.status,
        r.created_at,
        r.completed_at,
        r.error_message,
        r.payload->>'riskScore' as risk_score,
        r.payload->>'riskCategory' as risk_category,
        c.piva,
        c.name as company_name,
        c.email as company_email
      FROM reports r
      JOIN companies c ON r.company_id = c.id
      WHERE r.user_id = $1
    `;

    const params = [req.user.id];
    let paramCount = 1;

    // Filter by status
    if (status) {
      paramCount++;
      params.push(status);
      sqlQuery += ` AND r.status = $${paramCount}`;
    }

    // Search by company name or P.IVA
    if (search) {
      paramCount++;
      params.push(`%${search}%`);
      sqlQuery += ` AND (c.name ILIKE $${paramCount} OR c.piva LIKE $${paramCount})`;
    }

    // Date range filter
    if (from) {
      paramCount++;
      params.push(from);
      sqlQuery += ` AND r.created_at >= $${paramCount}`;
    }

    if (to) {
      paramCount++;
      params.push(to);
      sqlQuery += ` AND r.created_at <= $${paramCount}`;
    }

    // Get total count
    const countQuery = sqlQuery.replace(
      /SELECT .* FROM/,
      'SELECT COUNT(*) as total FROM'
    );
    const { total } = await queryOne(countQuery, params);

    // Add ordering and pagination
    sqlQuery += ` ORDER BY r.created_at DESC`;

    paramCount++;
    params.push(limit);
    sqlQuery += ` LIMIT $${paramCount}`;

    paramCount++;
    params.push(offset);
    sqlQuery += ` OFFSET $${paramCount}`;

    // Get reports
    const reports = await queryMany(sqlQuery, params);

    res.json({
      reports,
      pagination: {
        total: parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id
 * Get single report by ID
 * Requires authentication and ownership check
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await queryOne(
      `SELECT
         r.*,
         c.piva,
         c.name as company_name,
         c.email as company_email,
         c.phone as company_phone
       FROM reports r
       JOIN companies c ON r.company_id = c.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, req.user.id]
    );

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Report not found or you do not have access to it'
      });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports/:id/complete
 * Callback from n8n when report is completed
 * No authentication required (uses secret key)
 */
router.post('/:id/complete', validate(completeReportSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { secret } = req.query;
    const { status, payload, error: errorMessage } = req.validatedBody;

    // Verify callback secret
    if (!verifyCallbackSecret(secret)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid callback secret'
      });
    }

    // Check if report exists
    const report = await queryOne(
      'SELECT id, status FROM reports WHERE id = $1',
      [id]
    );

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'No report found with this ID'
      });
    }

    if (report.status !== 'processing') {
      return res.status(409).json({
        error: 'Report already completed',
        message: `Report status is already '${report.status}'`
      });
    }

    // Update report
    const updatedReport = await queryOne(
      `UPDATE reports
       SET status = $1,
           payload = $2,
           error_message = $3,
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
       WHERE id = $4
       RETURNING *`,
      [status, payload ? JSON.stringify(payload) : null, errorMessage, id]
    );

    console.log('✅ Report completed:', id, status);

    res.json({
      message: 'Report updated successfully',
      report: {
        id: updatedReport.id,
        status: updatedReport.status,
        completedAt: updatedReport.completed_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report (soft delete or hard delete)
 * Requires authentication and ownership
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM reports WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Report not found or you do not have permission to delete it'
      });
    }

    console.log('✅ Report deleted:', id);

    res.json({
      message: 'Report deleted successfully',
      reportId: id
    });
  } catch (error) {
    next(error);
  }
});

export default router;
