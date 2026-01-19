import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getUserAnalyticsSummary } from '@/db/analytics';
import { parseDateRange, fillMissingDates } from '@/utils/analytics';

/**
 * Analytics Summary API
 * GET /api/analytics/summary - Get comprehensive analytics summary for the user
 * Query params: range (7d, 30d, 90d)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user from session cookie
  const cookies = req.headers.cookie || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  
  if (!sessionMatch || !sessionMatch[1]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = sessionMatch[1];
  const user = await getUserById(userId);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Parse date range from query params
    const range = req.query.range as string | undefined;
    const dateRange = parseDateRange(range);

    // Get analytics summary
    const summary = await getUserAnalyticsSummary(user.id, dateRange);

    // Fill missing dates in time series data
    const clicksOverTime = fillMissingDates(summary.clicksOverTime, dateRange);
    const viewsOverTime = fillMissingDates(summary.viewsOverTime, dateRange);

    return res.status(200).json({
      ...summary,
      clicksOverTime,
      viewsOverTime,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ANALYTICS] Error fetching summary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
