import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';
import { getLinkById, updateLink, deleteLink } from '@/db/links';

/**
 * Links API - Single Link Operations
 * GET /api/links/[id] - Get single link
 * PUT /api/links/[id] - Update link
 * DELETE /api/links/[id] - Delete link
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
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

  if (req.method === 'GET') {
    try {
      const link = await getLinkById(id);
      
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      // Only allow owner to view their own links via this endpoint
      if (link.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.status(200).json({ link });
    } catch (error) {
      console.error('❌ [LINKS] Error fetching link:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { url, title, description, imageUrl, favicon, siteName, isPublic } = req.body as {
        url?: string;
        title?: string | null;
        description?: string | null;
        imageUrl?: string | null;
        favicon?: string | null;
        siteName?: string | null;
        isPublic?: boolean;
      };

      // Validate URL format if provided
      if (url) {
        try {
          new URL(url);
        } catch {
          return res.status(400).json({ error: 'Invalid URL format' });
        }
      }

      const updatedLink = await updateLink(id, user.id, {
        url,
        title,
        description,
        imageUrl,
        favicon,
        siteName,
        isPublic,
      });

      if (!updatedLink) {
        return res.status(404).json({ error: 'Link not found or not authorized' });
      }

      return res.status(200).json({ link: updatedLink });
    } catch (error) {
      console.error('❌ [LINKS] Error updating link:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteLink(id, user.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Link not found or not authorized' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ [LINKS] Error deleting link:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
