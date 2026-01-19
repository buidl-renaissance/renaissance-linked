import { v4 as uuidv4 } from 'uuid';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';
import { db } from './drizzle';
import { linkClicks, profileViews, links, DeviceType } from './schema';

// ============================================
// TYPES
// ============================================

export interface ClickMetadata {
  ipAddress?: string;
  country?: string;
  city?: string;
  userAgent?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
  referrer?: string;
  referrerDomain?: string;
}

export interface ViewMetadata extends ClickMetadata {}

export interface LinkClick {
  id: string;
  linkId: string;
  clickedAt: Date;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  deviceType: DeviceType | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  referrerDomain: string | null;
}

export interface ProfileView {
  id: string;
  userId: string;
  viewedAt: Date;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  deviceType: DeviceType | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  referrerDomain: string | null;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface CountByField {
  value: string;
  count: number;
}

// ============================================
// RECORD EVENTS
// ============================================

/**
 * Record a link click event with metadata
 */
export async function recordLinkClick(
  linkId: string,
  metadata: ClickMetadata
): Promise<LinkClick> {
  const id = uuidv4();
  const now = new Date();

  const clickData = {
    id,
    linkId,
    clickedAt: now,
    ipAddress: metadata.ipAddress ?? null,
    country: metadata.country ?? null,
    city: metadata.city ?? null,
    userAgent: metadata.userAgent ?? null,
    deviceType: metadata.deviceType ?? 'unknown' as DeviceType,
    browser: metadata.browser ?? null,
    os: metadata.os ?? null,
    referrer: metadata.referrer ?? null,
    referrerDomain: metadata.referrerDomain ?? null,
  };

  await db.insert(linkClicks).values(clickData);

  console.log('📊 [ANALYTICS] Recorded link click:', {
    linkId,
    country: metadata.country,
    deviceType: metadata.deviceType,
  });

  return clickData;
}

/**
 * Record a profile view event with metadata
 */
export async function recordProfileView(
  userId: string,
  metadata: ViewMetadata
): Promise<ProfileView> {
  const id = uuidv4();
  const now = new Date();

  const viewData = {
    id,
    userId,
    viewedAt: now,
    ipAddress: metadata.ipAddress ?? null,
    country: metadata.country ?? null,
    city: metadata.city ?? null,
    userAgent: metadata.userAgent ?? null,
    deviceType: metadata.deviceType ?? 'unknown' as DeviceType,
    browser: metadata.browser ?? null,
    os: metadata.os ?? null,
    referrer: metadata.referrer ?? null,
    referrerDomain: metadata.referrerDomain ?? null,
  };

  await db.insert(profileViews).values(viewData);

  console.log('📊 [ANALYTICS] Recorded profile view:', {
    userId,
    country: metadata.country,
    deviceType: metadata.deviceType,
  });

  return viewData;
}

// ============================================
// LINK CLICK ANALYTICS
// ============================================

/**
 * Get clicks for a specific link over time (grouped by day)
 */
export async function getLinkClicksOverTime(
  linkId: string,
  dateRange: DateRange
): Promise<TimeSeriesDataPoint[]> {
  const results = await db
    .select({
      date: sql<string>`date(${linkClicks.clickedAt}, 'unixepoch')`.as('date'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .where(
      and(
        eq(linkClicks.linkId, linkId),
        gte(linkClicks.clickedAt, dateRange.start),
        lte(linkClicks.clickedAt, dateRange.end)
      )
    )
    .groupBy(sql`date(${linkClicks.clickedAt}, 'unixepoch')`)
    .orderBy(sql`date(${linkClicks.clickedAt}, 'unixepoch')`);

  return results.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by country for a specific link
 */
export async function getLinkClicksByCountry(
  linkId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(linkClicks.linkId, linkId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.country}, 'Unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .where(and(...conditions))
    .groupBy(linkClicks.country)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by device type for a specific link
 */
export async function getLinkClicksByDevice(
  linkId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(linkClicks.linkId, linkId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.deviceType}, 'unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .where(and(...conditions))
    .groupBy(linkClicks.deviceType)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by browser for a specific link
 */
export async function getLinkClicksByBrowser(
  linkId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(linkClicks.linkId, linkId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.browser}, 'Unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .where(and(...conditions))
    .groupBy(linkClicks.browser)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by referrer domain for a specific link
 */
export async function getLinkClicksByReferrer(
  linkId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(linkClicks.linkId, linkId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.referrerDomain}, 'Direct')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .where(and(...conditions))
    .groupBy(linkClicks.referrerDomain)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get total click count for a link in a date range
 */
export async function getLinkClickCount(
  linkId: string,
  dateRange?: DateRange
): Promise<number> {
  const conditions = [eq(linkClicks.linkId, linkId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const result = await db
    .select({ count: count() })
    .from(linkClicks)
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

// ============================================
// USER-LEVEL ANALYTICS (ALL LINKS)
// ============================================

/**
 * Get clicks for all of a user's links over time
 */
export async function getUserClicksOverTime(
  userId: string,
  dateRange: DateRange
): Promise<TimeSeriesDataPoint[]> {
  const results = await db
    .select({
      date: sql<string>`date(${linkClicks.clickedAt}, 'unixepoch')`.as('date'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(
      and(
        eq(links.userId, userId),
        gte(linkClicks.clickedAt, dateRange.start),
        lte(linkClicks.clickedAt, dateRange.end)
      )
    )
    .groupBy(sql`date(${linkClicks.clickedAt}, 'unixepoch')`)
    .orderBy(sql`date(${linkClicks.clickedAt}, 'unixepoch')`);

  return results.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by country for all of a user's links
 */
export async function getUserClicksByCountry(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.country}, 'Unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions))
    .groupBy(linkClicks.country)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by device type for all of a user's links
 */
export async function getUserClicksByDevice(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.deviceType}, 'unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions))
    .groupBy(linkClicks.deviceType)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by browser for all of a user's links
 */
export async function getUserClicksByBrowser(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.browser}, 'Unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions))
    .groupBy(linkClicks.browser)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get clicks grouped by referrer domain for all of a user's links
 */
export async function getUserClicksByReferrer(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${linkClicks.referrerDomain}, 'Direct')`.as('value'),
      count: count().as('count'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions))
    .groupBy(linkClicks.referrerDomain)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get total click count for all of a user's links
 */
export async function getUserTotalClicks(
  userId: string,
  dateRange?: DateRange
): Promise<number> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const result = await db
    .select({ count: count() })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

/**
 * Get clicks per link for a user (top links)
 */
export async function getUserTopLinks(
  userId: string,
  dateRange?: DateRange,
  limit: number = 10
): Promise<{ linkId: string; title: string | null; url: string; clicks: number }[]> {
  const conditions = [eq(links.userId, userId)];
  if (dateRange) {
    conditions.push(gte(linkClicks.clickedAt, dateRange.start));
    conditions.push(lte(linkClicks.clickedAt, dateRange.end));
  }

  const results = await db
    .select({
      linkId: links.id,
      title: links.title,
      url: links.url,
      clicks: count().as('clicks'),
    })
    .from(linkClicks)
    .innerJoin(links, eq(linkClicks.linkId, links.id))
    .where(and(...conditions))
    .groupBy(links.id)
    .orderBy(desc(count()))
    .limit(limit);

  return results.map((r) => ({
    linkId: r.linkId,
    title: r.title,
    url: r.url,
    clicks: Number(r.clicks),
  }));
}

// ============================================
// PROFILE VIEW ANALYTICS
// ============================================

/**
 * Get profile views over time
 */
export async function getProfileViewsOverTime(
  userId: string,
  dateRange: DateRange
): Promise<TimeSeriesDataPoint[]> {
  const results = await db
    .select({
      date: sql<string>`date(${profileViews.viewedAt}, 'unixepoch')`.as('date'),
      count: count().as('count'),
    })
    .from(profileViews)
    .where(
      and(
        eq(profileViews.userId, userId),
        gte(profileViews.viewedAt, dateRange.start),
        lte(profileViews.viewedAt, dateRange.end)
      )
    )
    .groupBy(sql`date(${profileViews.viewedAt}, 'unixepoch')`)
    .orderBy(sql`date(${profileViews.viewedAt}, 'unixepoch')`);

  return results.map((r) => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get total profile view count
 */
export async function getProfileViewCount(
  userId: string,
  dateRange?: DateRange
): Promise<number> {
  const conditions = [eq(profileViews.userId, userId)];
  if (dateRange) {
    conditions.push(gte(profileViews.viewedAt, dateRange.start));
    conditions.push(lte(profileViews.viewedAt, dateRange.end));
  }

  const result = await db
    .select({ count: count() })
    .from(profileViews)
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

/**
 * Get profile views grouped by country
 */
export async function getProfileViewsByCountry(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(profileViews.userId, userId)];
  if (dateRange) {
    conditions.push(gte(profileViews.viewedAt, dateRange.start));
    conditions.push(lte(profileViews.viewedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${profileViews.country}, 'Unknown')`.as('value'),
      count: count().as('count'),
    })
    .from(profileViews)
    .where(and(...conditions))
    .groupBy(profileViews.country)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

/**
 * Get profile views grouped by referrer
 */
export async function getProfileViewsByReferrer(
  userId: string,
  dateRange?: DateRange
): Promise<CountByField[]> {
  const conditions = [eq(profileViews.userId, userId)];
  if (dateRange) {
    conditions.push(gte(profileViews.viewedAt, dateRange.start));
    conditions.push(lte(profileViews.viewedAt, dateRange.end));
  }

  const results = await db
    .select({
      value: sql<string>`COALESCE(${profileViews.referrerDomain}, 'Direct')`.as('value'),
      count: count().as('count'),
    })
    .from(profileViews)
    .where(and(...conditions))
    .groupBy(profileViews.referrerDomain)
    .orderBy(desc(count()));

  return results.map((r) => ({
    value: r.value,
    count: Number(r.count),
  }));
}

// ============================================
// SUMMARY ANALYTICS
// ============================================

export interface AnalyticsSummary {
  totalClicks: number;
  totalProfileViews: number;
  clicksChange: number; // percentage change from previous period
  viewsChange: number; // percentage change from previous period
  topCountries: CountByField[];
  topDevices: CountByField[];
  topReferrers: CountByField[];
  topLinks: { linkId: string; title: string | null; url: string; clicks: number }[];
  clicksOverTime: TimeSeriesDataPoint[];
  viewsOverTime: TimeSeriesDataPoint[];
}

/**
 * Get comprehensive analytics summary for a user
 */
export async function getUserAnalyticsSummary(
  userId: string,
  dateRange: DateRange
): Promise<AnalyticsSummary> {
  // Calculate previous period for comparison
  const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
  const previousRange: DateRange = {
    start: new Date(dateRange.start.getTime() - periodLength),
    end: new Date(dateRange.start.getTime() - 1),
  };

  // Fetch all data in parallel
  const [
    totalClicks,
    previousClicks,
    totalProfileViews,
    previousViews,
    topCountries,
    topDevices,
    topReferrers,
    topLinks,
    clicksOverTime,
    viewsOverTime,
  ] = await Promise.all([
    getUserTotalClicks(userId, dateRange),
    getUserTotalClicks(userId, previousRange),
    getProfileViewCount(userId, dateRange),
    getProfileViewCount(userId, previousRange),
    getUserClicksByCountry(userId, dateRange),
    getUserClicksByDevice(userId, dateRange),
    getUserClicksByReferrer(userId, dateRange),
    getUserTopLinks(userId, dateRange, 5),
    getUserClicksOverTime(userId, dateRange),
    getProfileViewsOverTime(userId, dateRange),
  ]);

  // Calculate percentage changes
  const clicksChange = previousClicks > 0
    ? Math.round(((totalClicks - previousClicks) / previousClicks) * 100)
    : totalClicks > 0 ? 100 : 0;

  const viewsChange = previousViews > 0
    ? Math.round(((totalProfileViews - previousViews) / previousViews) * 100)
    : totalProfileViews > 0 ? 100 : 0;

  return {
    totalClicks,
    totalProfileViews,
    clicksChange,
    viewsChange,
    topCountries: topCountries.slice(0, 5),
    topDevices: topDevices.slice(0, 5),
    topReferrers: topReferrers.slice(0, 5),
    topLinks,
    clicksOverTime,
    viewsOverTime,
  };
}
