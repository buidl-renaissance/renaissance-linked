import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// User roles
export type UserRole = 'user' | 'organizer' | 'admin';

// User status enum values
export const USER_STATUSES = ['active', 'inactive', 'banned'] as const;
export type UserStatus = typeof USER_STATUSES[number];

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  renaissanceId: text('renaissanceId').unique(), // Renaissance app user ID
  phone: text('phone').unique(), // Primary login method
  email: text('email'), // Optional
  username: text('username'),
  name: text('name'), // Display name
  pfpUrl: text('pfpUrl'), // Profile picture URL
  displayName: text('displayName'), // App-specific name (editable)
  profilePicture: text('profilePicture'), // App-specific profile picture (editable)
  accountAddress: text('accountAddress'), // Wallet address
  pinHash: text('pinHash'), // bcrypt hash of 4-digit PIN
  failedPinAttempts: integer('failedPinAttempts').default(0), // Failed PIN attempts counter
  lockedAt: integer('lockedAt', { mode: 'timestamp' }), // Timestamp when account was locked
  status: text('status').$type<UserStatus>().default('active'), // User status: active, inactive, banned
  role: text('role').$type<UserRole>().default('user').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Links table for storing user's managed links
export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(), // Original link URL
  title: text('title'), // SEO title (auto-fetched or custom)
  description: text('description'), // SEO description
  imageUrl: text('imageUrl'), // OG image URL
  favicon: text('favicon'), // Site favicon
  siteName: text('siteName'), // Site name from OG tags
  position: integer('position').default(0).notNull(), // Display order
  isPublic: integer('isPublic', { mode: 'boolean' }).default(true).notNull(), // Visibility on public profile
  clicks: integer('clicks').default(0).notNull(), // Click tracking counter
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Device types for analytics
export const DEVICE_TYPES = ['desktop', 'mobile', 'tablet', 'unknown'] as const;
export type DeviceType = typeof DEVICE_TYPES[number];

// Link clicks table for detailed analytics
export const linkClicks = sqliteTable('link_clicks', {
  id: text('id').primaryKey(),
  linkId: text('linkId').notNull().references(() => links.id, { onDelete: 'cascade' }),
  clickedAt: integer('clickedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  ipAddress: text('ipAddress'), // For geo lookup (consider hashing for privacy)
  country: text('country'), // Derived from IP
  city: text('city'), // Derived from IP
  userAgent: text('userAgent'), // Raw user agent string
  deviceType: text('deviceType').$type<DeviceType>().default('unknown'), // mobile/desktop/tablet
  browser: text('browser'), // Chrome/Safari/Firefox etc
  os: text('os'), // iOS/Android/Windows etc
  referrer: text('referrer'), // Full referrer URL
  referrerDomain: text('referrerDomain'), // Extracted domain from referrer
});

// Profile views table for tracking profile page visits
export const profileViews = sqliteTable('profile_views', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewedAt: integer('viewedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  ipAddress: text('ipAddress'), // For geo lookup
  country: text('country'), // Derived from IP
  city: text('city'), // Derived from IP
  userAgent: text('userAgent'), // Raw user agent string
  deviceType: text('deviceType').$type<DeviceType>().default('unknown'), // mobile/desktop/tablet
  browser: text('browser'), // Chrome/Safari/Firefox etc
  os: text('os'), // iOS/Android/Windows etc
  referrer: text('referrer'), // Full referrer URL
  referrerDomain: text('referrerDomain'), // Extracted domain from referrer
});
