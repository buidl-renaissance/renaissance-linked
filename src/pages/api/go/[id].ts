import type { NextApiRequest, NextApiResponse } from 'next';
import { getLinkById, incrementLinkClicks } from '@/db/links';

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

    // Increment click counter
    await incrementLinkClicks(id);

    // Redirect to the actual URL
    return res.redirect(302, link.url);
  } catch (error) {
    console.error('❌ [GO] Error redirecting:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
