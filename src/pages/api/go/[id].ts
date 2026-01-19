import type { NextApiRequest, NextApiResponse } from 'next';
import { getLinkById, incrementLinkClicks } from '@/db/links';
import { recordLinkClick } from '@/db/analytics';
import { extractAnalyticsMetadata } from '@/utils/analytics';

/**
 * Link Redirect API
 * GET /api/go/[id] - Track click and redirect to link URL
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid link ID' });
  }

  try {
    // Get the link
    const link = await getLinkById(id);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Extract analytics metadata from request headers
    const headers = req.headers as Record<string, string | string[] | undefined>;
    const metadata = await extractAnalyticsMetadata(headers);

    // Record detailed click event and increment simple counter
    await Promise.all([
      recordLinkClick(id, metadata),
      incrementLinkClicks(id),
    ]);

    // Redirect to the actual URL
    return res.redirect(302, link.url);
  } catch (error) {
    console.error('❌ [GO] Error redirecting:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
