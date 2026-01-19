import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import {
  getProfileViewsOverTime,
  getProfileViewCount,
  getProfileViewsByCountry,
  getProfileViewsByReferrer,
} from '@/db/analytics';
import { parseDateRange, fillMissingDates } from '@/utils/analytics';

/**
 * Profile Views Analytics API
 * GET /api/analytics/views - Get profile view analytics
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

    // Fetch all profile view data in parallel
    const [totalViews, viewsOverTime, byCountry, byReferrer] = await Promise.all([
      getProfileViewCount(user.id, dateRange),
      getProfileViewsOverTime(user.id, dateRange),
      getProfileViewsByCountry(user.id, dateRange),
      getProfileViewsByReferrer(user.id, dateRange),
    ]);

    // Fill missing dates
    const filledViewsOverTime = fillMissingDates(viewsOverTime, dateRange);

    return res.status(200).json({
      totalViews,
      viewsOverTime: filledViewsOverTime,
      byCountry,
      byReferrer,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ANALYTICS] Error fetching profile views:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
