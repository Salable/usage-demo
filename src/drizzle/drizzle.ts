import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

config({ path: '.env' });

export const client = createClient({
  url: 'file:local.db',
  // url: 'libsql://salable-seats-adapta-perry.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
