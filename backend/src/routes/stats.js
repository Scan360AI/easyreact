import express from 'express';
import { queryOne, queryMany } from '../config/db.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/my/stats
 * Get dashboard statistics for current user
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total reports
    const { total_reports } = await queryOne(
      'SELECT COUNT(*) as total_reports FROM reports WHERE user_id = $1',
      [userId]
    );

    // Reports by status
    const statusCounts = await queryMany(
      `SELECT status, COUNT(*) as count
       FROM reports
       WHERE user_id = $1
       GROUP BY status`,
      [userId]
    );

    const byStatus = {
      processing: 0,
      completed: 0,
      failed: 0
    };

    statusCounts.forEach(row => {
      byStatus[row.status] = parseInt(row.count);
    });

    // Reports this month
    const { reports_this_month } = await queryOne(
      `SELECT COUNT(*) as reports_this_month
       FROM reports
       WHERE user_id = $1
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // Completed this month
    const { completed_this_month } = await queryOne(
      `SELECT COUNT(*) as completed_this_month
       FROM reports
       WHERE user_id = $1
         AND status = 'completed'
         AND completed_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // Failed last week
    const { failed_last_week } = await queryOne(
      `SELECT COUNT(*) as failed_last_week
       FROM reports
       WHERE user_id = $1
         AND status = 'failed'
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    // Top companies (most analyzed)
    const topCompanies = await queryMany(
      `SELECT
         c.id,
         c.piva,
         c.name,
         COUNT(r.id) as report_count,
         MAX(r.created_at) as last_report_date
       FROM companies c
       JOIN reports r ON r.company_id = c.id
       WHERE r.user_id = $1
       GROUP BY c.id, c.piva, c.name
       ORDER BY report_count DESC, last_report_date DESC
       LIMIT 10`,
      [userId]
    );

    // Recent activity (last 7 days)
    const recentActivity = await queryMany(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) as count
       FROM reports
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [userId]
    );

    // Average completion time (in minutes)
    const { avg_completion_time } = await queryOne(
      `SELECT
         ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60)) as avg_completion_time
       FROM reports
       WHERE user_id = $1
         AND status = 'completed'
         AND completed_at IS NOT NULL`,
      [userId]
    );

    res.json({
      summary: {
        totalReports: parseInt(total_reports),
        reportsThisMonth: parseInt(reports_this_month),
        completedThisMonth: parseInt(completed_this_month),
        failedLastWeek: parseInt(failed_last_week),
        processingNow: byStatus.processing,
        avgCompletionTime: parseInt(avg_completion_time) || null
      },
      byStatus,
      topCompanies,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/my/activity
 * Get detailed activity timeline for current user
 */
router.get('/activity', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    const activity = await queryMany(
      `SELECT
         r.id,
         r.status,
         r.created_at,
         r.completed_at,
         c.piva,
         c.name as company_name
       FROM reports r
       JOIN companies c ON r.company_id = c.id
       WHERE r.user_id = $1
         AND r.created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
       ORDER BY r.created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json({
      activity,
      period: `Last ${days} days`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
