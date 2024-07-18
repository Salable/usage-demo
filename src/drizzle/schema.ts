import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('Users', {
  id: integer('id').primaryKey(),
  username: text('username').unique(),
  email: text('email').unique(),
  salt: text('salt').unique(),
  hash: text('hash').unique(),
});

export const organisationsTable = sqliteTable('Organisations', {
  id: integer('id').primaryKey(),
  name: text('name').unique().notNull(),
});

export const tokensTable = sqliteTable('Tokens', {
  id: integer('id').primaryKey(),
  value: text('value').unique().notNull(),
  organisationId: integer('organisationId')
    .notNull()
    .references(() => organisationsTable.id),
  userId: integer('userId')
    .notNull()
    .references(() => usersTable.id),
});

export const usersOrganisationsTable = sqliteTable('UsersOrganisations', {
  userId: integer('userId').notNull().references(() => usersTable.id),
  organisationId: integer('organisationId').notNull().references(() => organisationsTable.id),
});


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertOrganisation = typeof organisationsTable.$inferInsert;
export type SelectOrganisation = typeof organisationsTable.$inferSelect;
export type InsertToken = typeof tokensTable.$inferInsert;
export type SelectToken = typeof tokensTable.$inferSelect;
export type InsertUsersOrganisations = typeof usersOrganisationsTable.$inferInsert;
export type SelectUsersOrganisations = typeof usersOrganisationsTable.$inferSelect;
