import { v4 as uuidv4 } from 'uuid';
import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { links } from './schema';

export interface Link {
  id: string;
  userId: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  favicon: string | null;
  siteName: string | null;
  position: number;
  isPublic: boolean;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to convert db row to Link object
function rowToLink(row: typeof links.$inferSelect): Link {
  return {
    id: row.id,
    userId: row.userId,
    url: row.url,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    favicon: row.favicon,
    siteName: row.siteName,
    position: row.position,
    isPublic: row.isPublic,
    clicks: row.clicks,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  };
}

// ============================================
// LINK LOOKUP FUNCTIONS
// ============================================

export async function getLinkById(linkId: string): Promise<Link | null> {
  const results = await db
    .select()
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  if (results.length === 0) return null;
  return rowToLink(results[0]);
}

export async function getLinksByUserId(userId: string): Promise<Link[]> {
  const results = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(asc(links.position), desc(links.createdAt));

  return results.map(rowToLink);
}

export async function getPublicLinksByUserId(userId: string): Promise<Link[]> {
  const results = await db
    .select()
    .from(links)
    .where(and(eq(links.userId, userId), eq(links.isPublic, true)))
    .orderBy(asc(links.position), desc(links.createdAt));

  return results.map(rowToLink);
}

// ============================================
// LINK CREATION & UPDATE FUNCTIONS
// ============================================

export interface CreateLinkData {
  userId: string;
  url: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  favicon?: string | null;
  siteName?: string | null;
  isPublic?: boolean;
}

export async function createLink(data: CreateLinkData): Promise<Link> {
  const id = uuidv4();
  const now = new Date();

  // Get the highest position for this user to add at the end
  const maxPositionResult = await db
    .select({ maxPos: sql<number>`MAX(${links.position})` })
    .from(links)
    .where(eq(links.userId, data.userId));

  const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

  const newLink = {
    id,
    userId: data.userId,
    url: data.url,
    title: data.title ?? null,
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    favicon: data.favicon ?? null,
    siteName: data.siteName ?? null,
    position: nextPosition,
    isPublic: data.isPublic ?? true,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(links).values(newLink);

  console.log('🔗 [CREATE LINK] Created link:', {
    linkId: id,
    userId: data.userId,
    url: data.url,
    title: data.title,
  });

  return newLink as Link;
}

export interface UpdateLinkData {
  url?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  favicon?: string | null;
  siteName?: string | null;
  isPublic?: boolean;
}

export async function updateLink(
  linkId: string,
  userId: string,
  data: UpdateLinkData
): Promise<Link | null> {
  const existing = await getLinkById(linkId);
  if (!existing || existing.userId !== userId) return null;

  const now = new Date();
  const updateData: Record<string, unknown> = { updatedAt: now };

  if (data.url !== undefined) updateData.url = data.url;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.favicon !== undefined) updateData.favicon = data.favicon;
  if (data.siteName !== undefined) updateData.siteName = data.siteName;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  await db.update(links).set(updateData).where(eq(links.id, linkId));

  console.log('✏️ [UPDATE LINK] Updated link:', { linkId, userId });

  return { ...existing, ...updateData, updatedAt: now } as Link;
}

export async function deleteLink(linkId: string, userId: string): Promise<boolean> {
  const existing = await getLinkById(linkId);
  if (!existing || existing.userId !== userId) return false;

  await db.delete(links).where(eq(links.id, linkId));

  console.log('🗑️ [DELETE LINK] Deleted link:', { linkId, userId });

  return true;
}

// ============================================
// LINK REORDERING
// ============================================

export async function reorderLinks(
  userId: string,
  linkIds: string[]
): Promise<boolean> {
  const now = new Date();

  // Update each link's position based on its index in the array
  for (let i = 0; i < linkIds.length; i++) {
    await db
      .update(links)
      .set({ position: i, updatedAt: now })
      .where(and(eq(links.id, linkIds[i]), eq(links.userId, userId)));
  }

  console.log('🔄 [REORDER LINKS] Reordered links for user:', { userId, count: linkIds.length });

  return true;
}

// ============================================
// CLICK TRACKING
// ============================================

export async function incrementLinkClicks(linkId: string): Promise<Link | null> {
  const existing = await getLinkById(linkId);
  if (!existing) return null;

  const now = new Date();
  const newClicks = existing.clicks + 1;

  await db
    .update(links)
    .set({ clicks: newClicks, updatedAt: now })
    .where(eq(links.id, linkId));

  console.log('📈 [CLICK] Link clicked:', { linkId, clicks: newClicks });

  return { ...existing, clicks: newClicks, updatedAt: now };
}

// ============================================
// STATISTICS
// ============================================

export async function getUserLinkStats(userId: string): Promise<{
  totalLinks: number;
  publicLinks: number;
  totalClicks: number;
}> {
  const userLinks = await getLinksByUserId(userId);

  return {
    totalLinks: userLinks.length,
    publicLinks: userLinks.filter((l) => l.isPublic).length,
    totalClicks: userLinks.reduce((sum, l) => sum + l.clicks, 0),
  };
}
