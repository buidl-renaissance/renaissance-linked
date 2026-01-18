import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserByUsername } from '@/db/user';
import { getPublicLinksByUserId } from '@/db/links';

/**
 * Public Profile API
 * GET /api/profile/[username] - Get public profile data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid username' });
  }

  try {
    // Find user by username (case-insensitive)
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get public links
    const links = await getPublicLinksByUserId(user.id);

    // Return public profile data (sanitized)
    return res.status(200).json({
      profile: {
        username: user.username,
        displayName: user.displayName || user.name || user.username,
        pfpUrl: user.pfpUrl || user.profilePicture,
      },
      links: links.map((link) => ({
        id: link.id,
        url: link.url,
        title: link.title,
        description: link.description,
        imageUrl: link.imageUrl,
        favicon: link.favicon,
        siteName: link.siteName,
      })),
    });
  } catch (error) {
    console.error('❌ [PROFILE] Error fetching profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
