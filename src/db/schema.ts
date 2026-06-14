import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  login: text('login').notNull(), // Character account login/username
  role: text('role').default('PLAYER').notNull(), // 'PLAYER', 'MODERATOR', 'GM', 'ADMIN'
  cashBalance: integer('cash_balance').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Characters Table for Rankings
export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  nick: text('nick').notNull().unique(),
  level: integer('level').default(1).notNull(),
  kingdom: text('kingdom').notNull(), // 'Shinsoo', 'Chunjo', 'Jinno'
  className: text('class_name').notNull(), // 'Guerreiro', 'Ninja', 'Shura', 'Shaman'
  playedTime: text('played_time').default('0h').notNull(),
  league: text('league').default('Bronze').notNull(),
  leagueIcon: text('league_icon').default('⚔️').notNull(),
  rank: integer('rank'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Guilds Table for Rankings
export const guilds = pgTable('guilds', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  leaderNick: text('leader_nick').notNull(),
  level: integer('level').default(1).notNull(),
  kingdom: text('kingdom').notNull(), // 'Shinsoo', 'Chunjo', 'Jinno'
  rank: integer('rank'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. News Table for CMS
export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(), // 'update', 'event', 'maintenance', 'community'
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url').notNull(),
  date: text('date').notNull(),
  author: text('author').default('GM_Staff').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Videos Table for Trailer Playlist
export const videos = pgTable('videos', {
  id: text('id').primaryKey(), // YouTube Video ID
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  category: text('category').notNull(), // 'server', 'costumes', 'tutorial'
  duration: text('duration'),
  rarity: text('rarity'),
  author: text('author'),
  views: text('views'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Coupons Table
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  value: integer('value').notNull(), // Cash value
  expiration: timestamp('expiration'),
  limitUse: integer('limit_use'), // Max times redeemable globally
  usedCount: integer('used_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Coupon Redemptions Table (History)
export const couponRedemptions = pgTable('coupon_redemptions', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').references(() => coupons.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
});

// 8. Cash Transactions Table
export const cashTransactions = pgTable('cash_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(), // 'Pendente', 'Pago', 'Cancelado', 'Reembolsado'
  provider: text('provider').notNull(), // 'Mercado Pago', 'Asaas', 'Stripe'
  externalId: text('external_id'), // Payment provider ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Events Table
export const events = pgTable('events', {
  id: text('id').primaryKey(), // e.g. 'event-ox'
  title: text('title').notNull(),
  time: text('time'),
  days: text('days').notNull(), // Comma-separated or JSON string, e.g. 'Segunda, Quarta'
  status: text('status').notNull(), // 'active', 'upcoming', 'completed'
  emoji: text('emoji'),
  description: text('description').notNull(),
  howItWorks: text('how_it_works'),
  dynamics: text('dynamics'),
  elimination: text('elimination'),
  victory: text('victory'),
  rewards: text('rewards'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Server Status Table
export const serverStatus = pgTable('server_status', {
  id: serial('id').primaryKey(),
  status: text('status').default('online').notNull(), // 'online', 'maintenance', 'offline'
  playerCount: integer('player_count').default(128).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Admin Logs Table for Auditing
export const adminLogs = pgTable('admin_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relational Definitions
export const usersRelations = relations(users, ({ many }) => ({
  characters: many(characters),
  couponRedemptions: many(couponRedemptions),
  cashTransactions: many(cashTransactions),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  redemptions: many(couponRedemptions),
}));

export const couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponRedemptions.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponRedemptions.userId],
    references: [users.id],
  }),
}));

export const cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
  user: one(users, {
    fields: [cashTransactions.userId],
    references: [users.id],
  }),
}));
