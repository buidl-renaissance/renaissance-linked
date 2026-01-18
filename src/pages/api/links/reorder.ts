import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { reorderLinks } from '@/db/links';

/**
 * Links Reorder API
 * POST /api/links/reorder - Update link positions
 * Body: { linkIds: string[] }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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
    const { linkIds } = req.body as { linkIds?: string[] };

    if (!linkIds || !Array.isArray(linkIds)) {
      return res.status(400).json({ error: 'linkIds array is required' });
    }

    await reorderLinks(user.id, linkIds);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ [LINKS] Error reordering links:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
