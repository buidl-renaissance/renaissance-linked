import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getLinkById } from '@/db/links';
import {
  getLinkClicksOverTime,
  getLinkClickCount,
  getLinkClicksByCountry,
  getLinkClicksByDevice,
  getLinkClicksByBrowser,
  getLinkClicksByReferrer,
} from '@/db/analytics';
import { parseDateRange, fillMissingDates } from '@/utils/analytics';

/**
 * Link Click Analytics API
 * GET /api/analytics/clicks/[linkId] - Get detailed click analytics for a specific link
 * Query params: range (7d, 30d, 90d)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { linkId } = req.query;

  if (typeof linkId !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
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
    // Verify the link belongs to the user
    const link = await getLinkById(linkId);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Parse date range from query params
    const range = req.query.range as string | undefined;
    const dateRange = parseDateRange(range);

    // Fetch all click data in parallel
    const [
      totalClicks,
      clicksOverTime,
      byCountry,
      byDevice,
      byBrowser,
      byReferrer,
    ] = await Promise.all([
      getLinkClickCount(linkId, dateRange),
      getLinkClicksOverTime(linkId, dateRange),
      getLinkClicksByCountry(linkId, dateRange),
      getLinkClicksByDevice(linkId, dateRange),
      getLinkClicksByBrowser(linkId, dateRange),
      getLinkClicksByReferrer(linkId, dateRange),
    ]);

    // Fill missing dates
    const filledClicksOverTime = fillMissingDates(clicksOverTime, dateRange);

    return res.status(200).json({
      linkId,
      linkTitle: link.title,
      linkUrl: link.url,
      totalClicks,
      clicksOverTime: filledClicksOverTime,
      byCountry,
      byDevice,
      byBrowser,
      byReferrer,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ [ANALYTICS] Error fetching link clicks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
