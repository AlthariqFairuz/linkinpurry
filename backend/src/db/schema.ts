import { pgTable, bigint, varchar, text, timestamp, json, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
});

export const feed = pgTable('feed', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  content: text('content').notNull(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull()
});

export const chat = pgTable('chat', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  fromId: bigint('from_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  toId: bigint('to_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull()
});

export const connectionRequest = pgTable('connection_request', {
  fromId: bigint('from_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  toId: bigint('to_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull()
}, (table) => ({
  pk: primaryKey(table.fromId, table.toId)
}));

export const connection = pgTable('connection', {
  fromId: bigint('from_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  toId: bigint('to_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull()
}, (table) => ({
  pk: primaryKey(table.fromId, table.toId)
}));

export const pushSubscriptions = pgTable('push_subscriptions', {
  endpoint: text('endpoint').primaryKey().notNull(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
  keys: json('keys').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  feeds: many(feed),
  sentChats: many(chat, { relationName: 'sender' }),
  receivedChats: many(chat, { relationName: 'receiver' }),
  sentRequests: many(connectionRequest, { relationName: 'sender' }),
  receivedRequests: many(connectionRequest, { relationName: 'receiver' }),
  connections: many(connection),
  pushSubscriptions: many(pushSubscriptions)
}));