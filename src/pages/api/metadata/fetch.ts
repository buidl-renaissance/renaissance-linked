import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById } from '@/db/user';

interface MetadataResult {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  favicon: string | null;
  siteName: string | null;
}

/**
 * Extract content from meta tag using various attribute combinations
 */
function extractMetaContent(html: string, property: string): string | null {
  // Try property attribute (OG tags)
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')
  );
  if (propertyMatch) return propertyMatch[1];

  // Try content before property
  const contentFirstMatch = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i')
  );
  if (contentFirstMatch) return contentFirstMatch[1];

  // Try name attribute
  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')
  );
  if (nameMatch) return nameMatch[1];

  // Try content before name
  const nameContentFirstMatch = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i')
  );
  if (nameContentFirstMatch) return nameContentFirstMatch[1];

  return null;
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string | null {
  // Try OG title first
  const ogTitle = extractMetaContent(html, 'og:title');
  if (ogTitle) return ogTitle;

  // Try twitter:title
  const twitterTitle = extractMetaContent(html, 'twitter:title');
  if (twitterTitle) return twitterTitle;

  // Fall back to <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  return null;
}

/**
 * Extract description from HTML
 */
function extractDescription(html: string): string | null {
  // Try OG description first
  const ogDesc = extractMetaContent(html, 'og:description');
  if (ogDesc) return ogDesc;

  // Try twitter:description
  const twitterDesc = extractMetaContent(html, 'twitter:description');
  if (twitterDesc) return twitterDesc;

  // Fall back to meta description
  const metaDesc = extractMetaContent(html, 'description');
  if (metaDesc) return metaDesc;

  return null;
}

/**
 * Extract image URL from HTML
 */
function extractImageUrl(html: string, baseUrl: string): string | null {
  // Try OG image first
  const ogImage = extractMetaContent(html, 'og:image');
  if (ogImage) return resolveUrl(ogImage, baseUrl);

  // Try twitter:image
  const twitterImage = extractMetaContent(html, 'twitter:image');
  if (twitterImage) return resolveUrl(twitterImage, baseUrl);

  // Try twitter:image:src
  const twitterImageSrc = extractMetaContent(html, 'twitter:image:src');
  if (twitterImageSrc) return resolveUrl(twitterImageSrc, baseUrl);

  return null;
}

/**
 * Extract favicon from HTML
 */
function extractFavicon(html: string, baseUrl: string): string {
  // Try various link rel formats
  const iconPatterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
    /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
  ];

  for (const pattern of iconPatterns) {
    const match = html.match(pattern);
    if (match) return resolveUrl(match[1], baseUrl);
  }

  // Default to /favicon.ico
  try {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}/favicon.ico`;
  } catch {
    return '/favicon.ico';
  }
}

/**
 * Extract site name from HTML
 */
function extractSiteName(html: string, baseUrl: string): string | null {
  // Try OG site_name
  const ogSiteName = extractMetaContent(html, 'og:site_name');
  if (ogSiteName) return ogSiteName;

  // Try application-name
  const appName = extractMetaContent(html, 'application-name');
  if (appName) return appName;

  // Fall back to hostname
  try {
    const url = new URL(baseUrl);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Resolve relative URL to absolute URL
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return url;
  
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Protocol-relative URL
  if (url.startsWith('//')) {
    try {
      const base = new URL(baseUrl);
      return `${base.protocol}${url}`;
    } catch {
      return `https:${url}`;
    }
  }

  // Relative URL
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    if (entities[entity]) return entities[entity];
    
    // Handle numeric entities
    const numMatch = entity.match(/&#(\d+);/);
    if (numMatch) return String.fromCharCode(parseInt(numMatch[1], 10));
    
    const hexMatch = entity.match(/&#x([0-9a-fA-F]+);/);
    if (hexMatch) return String.fromCharCode(parseInt(hexMatch[1], 16));
    
    return entity;
  });
}

/**
 * Metadata Fetch API
 * POST /api/metadata/fetch
 * Body: { url: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get user from session cookie (require authentication)
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
    const { url } = req.body as { url?: string };

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch the page
    const response = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkedBot/1.0; +https://linked.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(400).json({ 
        error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
      });
    }

    const html = await response.text();
    const finalUrl = response.url || parsedUrl.href;

    // Extract metadata
    const metadata: MetadataResult = {
      url: finalUrl,
      title: extractTitle(html),
      description: extractDescription(html),
      imageUrl: extractImageUrl(html, finalUrl),
      favicon: extractFavicon(html, finalUrl),
      siteName: extractSiteName(html, finalUrl),
    };

    // Decode HTML entities in text fields
    if (metadata.title) metadata.title = decodeHtmlEntities(metadata.title);
    if (metadata.description) metadata.description = decodeHtmlEntities(metadata.description);
    if (metadata.siteName) metadata.siteName = decodeHtmlEntities(metadata.siteName);

    // Truncate description if too long
    if (metadata.description && metadata.description.length > 300) {
      metadata.description = metadata.description.substring(0, 297) + '...';
    }

    console.log('📋 [METADATA] Fetched metadata for:', {
      url: finalUrl,
      title: metadata.title,
      siteName: metadata.siteName,
    });

    return res.status(200).json({ metadata });
  } catch (error) {
    console.error('❌ [METADATA] Error fetching metadata:', error);
    return res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}
