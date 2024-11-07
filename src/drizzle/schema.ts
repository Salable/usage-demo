import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('Users', {
  uuid: text('uuid').unique().primaryKey(),
  username: text('username').unique(),
  email: text('email').unique(),
  salt: text('salt').unique(),
  hash: text('hash').unique(),
});


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
