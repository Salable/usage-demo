import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('Users', {
  uuid: text('uuid').unique().primaryKey(),
  username: text('username').unique(),
  email: text('email').unique(),
  salt: text('salt').unique(),
  hash: text('hash').unique(),
});

export const organisationsTable = sqliteTable('Organisations', {
  uuid: text('uuid').unique().primaryKey(),
  name: text('name').unique().notNull(),
});

export const tokensTable = sqliteTable('Tokens', {
  uuid: text('uuid').unique().primaryKey(),
  value: text('value').unique().notNull(),
  organisationUuid: text('organisationUuid')
    .notNull()
    .references(() => organisationsTable.uuid, {onDelete: "cascade"}),
  userUuid: text('userUuid')
    .notNull()
    .references(() => usersTable.uuid, {onDelete: "cascade"}),
});

export const usersOrganisationsTable = sqliteTable('UsersOrganisations', {
  userUuid: text('userUuid').notNull().references(() => usersTable.uuid, {onDelete: "cascade"}),
  organisationUuid: text('organisationUuid').notNull().references(() => organisationsTable.uuid, {onDelete: "cascade"}),
});


export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertOrganisation = typeof organisationsTable.$inferInsert;
export type SelectOrganisation = typeof organisationsTable.$inferSelect;
export type InsertToken = typeof tokensTable.$inferInsert;
export type SelectToken = typeof tokensTable.$inferSelect;
export type InsertUsersOrganisations = typeof usersOrganisationsTable.$inferInsert;
export type SelectUsersOrganisations = typeof usersOrganisationsTable.$inferSelect;
