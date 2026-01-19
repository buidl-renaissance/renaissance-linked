import { UAParser } from 'ua-parser-js';
import { DeviceType } from '@/db/schema';

// ============================================
// USER AGENT PARSING
// ============================================

export interface ParsedUserAgent {
  deviceType: DeviceType;
  browser: string;
  os: string;
}

/**
 * Parse user agent string to extract device type, browser, and OS
 */
export function parseUserAgent(userAgent: string | undefined | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  // UAParser v2.x: use the function directly or instantiate with new
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Determine device type
  let deviceType: DeviceType = 'desktop';
  const deviceTypeStr = result.device?.type;
  
  if (deviceTypeStr === 'mobile') {
    deviceType = 'mobile';
  } else if (deviceTypeStr === 'tablet') {
    deviceType = 'tablet';
  } else if (!deviceTypeStr) {
    // If no device type, assume desktop
    deviceType = 'desktop';
  }

  // Get browser name with fallback
  const browser = result.browser?.name || 'Unknown';

  // Get OS name with fallback
  const os = result.os?.name || 'Unknown';

  return {
    deviceType,
    browser,
    os,
  };
}

// ============================================
// GEO IP LOOKUP
// ============================================

export interface GeoData {
  country: string | null;
  city: string | null;
}

/**
 * Get geo location data from IP address using ip-api.com (free service)
 * Note: This is a free API with rate limits (45 requests/minute)
 * For production, consider using a paid service or local database
 */
export async function getGeoFromIP(ipAddress: string | undefined | null): Promise<GeoData> {
  if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
    return { country: null, city: null };
  }

  try {
    // ip-api.com is free for non-commercial use
    // For production, consider ipinfo.io, maxmind, or similar services
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,city`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      console.warn('Geo lookup failed:', response.status);
      return { country: null, city: null };
    }

    const data = await response.json();
    
    if (data.status === 'fail') {
      return { country: null, city: null };
    }

    return {
      country: data.country || null,
      city: data.city || null,
    };
  } catch (error) {
    // Don't let geo lookup failure break the request
    console.warn('Geo lookup error:', error);
    return { country: null, city: null };
  }
}

// ============================================
// REFERRER EXTRACTION
// ============================================

/**
 * Extract domain from referrer URL
 */
export function extractReferrerDomain(referrer: string | undefined | null): string | null {
  if (!referrer) {
    return null;
  }

  try {
    const url = new URL(referrer);
    // Return just the hostname (e.g., "google.com" from "https://www.google.com/search?q=...")
    return url.hostname.replace(/^www\./, '');
  } catch {
    // Invalid URL
    return null;
  }
}

// ============================================
// IP ADDRESS EXTRACTION
// ============================================

/**
 * Extract client IP address from request headers
 * Handles common proxy headers (Cloudflare, Vercel, nginx, etc.)
 */
export function getClientIP(headers: Record<string, string | string[] | undefined>): string | null {
  // Cloudflare
  const cfConnectingIP = headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return Array.isArray(cfConnectingIP) ? cfConnectingIP[0] : cfConnectingIP;
  }

  // Vercel / Generic proxy
  const xForwardedFor = headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    // x-forwarded-for can contain multiple IPs, first one is the client
    return ips.split(',')[0].trim();
  }

  // Standard proxy header
  const xRealIP = headers['x-real-ip'];
  if (xRealIP) {
    return Array.isArray(xRealIP) ? xRealIP[0] : xRealIP;
  }

  return null;
}

// ============================================
// COMBINED METADATA EXTRACTION
// ============================================

import { ClickMetadata } from '@/db/analytics';

/**
 * Extract all analytics metadata from request headers
 * This is a convenience function that combines all extraction methods
 */
export async function extractAnalyticsMetadata(
  headers: Record<string, string | string[] | undefined>
): Promise<ClickMetadata> {
  const userAgent = headers['user-agent'];
  const referrer = headers['referer'] || headers['referrer'];
  const ipAddress = getClientIP(headers);

  // Parse user agent
  const uaString = Array.isArray(userAgent) ? userAgent[0] : userAgent;
  const parsedUA = parseUserAgent(uaString);

  // Get geo data (async)
  const geoData = await getGeoFromIP(ipAddress);

  // Extract referrer domain
  const referrerStr = Array.isArray(referrer) ? referrer[0] : referrer;
  const referrerDomain = extractReferrerDomain(referrerStr);

  return {
    ipAddress: ipAddress || undefined,
    country: geoData.country || undefined,
    city: geoData.city || undefined,
    userAgent: uaString || undefined,
    deviceType: parsedUA.deviceType,
    browser: parsedUA.browser,
    os: parsedUA.os,
    referrer: referrerStr || undefined,
    referrerDomain: referrerDomain || undefined,
  };
}

// ============================================
// DATE HELPERS
// ============================================

import { DateRange } from '@/db/analytics';

/**
 * Get date range for the last N days
 */
export function getLastNDays(days: number): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

/**
 * Pre-defined date ranges
 */
export const DATE_RANGES = {
  '7d': () => getLastNDays(7),
  '30d': () => getLastNDays(30),
  '90d': () => getLastNDays(90),
} as const;

export type DateRangeKey = keyof typeof DATE_RANGES;

/**
 * Parse date range from query params
 */
export function parseDateRange(range: string | undefined): DateRange {
  if (range && range in DATE_RANGES) {
    return DATE_RANGES[range as DateRangeKey]();
  }
  // Default to last 30 days
  return getLastNDays(30);
}

/**
 * Fill missing dates in time series data
 * This ensures we have data points for every day in the range
 */
export function fillMissingDates(
  data: { date: string; count: number }[],
  dateRange: DateRange
): { date: string; count: number }[] {
  const dataMap = new Map(data.map((d) => [d.date, d.count]));
  const result: { date: string; count: number }[] = [];

  const current = new Date(dateRange.start);
  while (current <= dateRange.end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}
