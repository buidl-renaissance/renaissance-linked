import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getLinksByUserId, createLink } from '@/db/links';

/**
 * Links API - List and Create
 * GET /api/links - List user's links
 * POST /api/links - Create new link
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  if (req.method === 'GET') {
    try {
      const links = await getLinksByUserId(user.id);
      return res.status(200).json({ links });
    } catch (error) {
      console.error('❌ [LINKS] Error fetching links:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { url, title, description, imageUrl, favicon, siteName, isPublic } = req.body as {
        url?: string;
        title?: string;
        description?: string;
        imageUrl?: string;
        favicon?: string;
        siteName?: string;
        isPublic?: boolean;
      };

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const link = await createLink({
        userId: user.id,
        url,
        title,
        description,
        imageUrl,
        favicon,
        siteName,
        isPublic,
      });

      return res.status(201).json({ link });
    } catch (error) {
      console.error('❌ [LINKS] Error creating link:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
