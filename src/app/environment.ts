if (!process.env.SALABLE_API_KEY) throw new Error('Missing env SALABLE_API_KEY')
if (!process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL) throw new Error('Missing env NEXT_PUBLIC_SALABLE_API_BASE_URL')
if (!process.env.TURSO_DATABASE_URL) throw new Error('Missing env TURSO_DATABASE_URL')
if (!process.env.TURSO_AUTH_TOKEN) throw new Error('Missing env TURSO_AUTH_TOKEN')

const SALABLE_API_KEY = process.env.SALABLE_API_KEY
const SALABLE_API_BASE_URL = process.env.SALABLE_API_BASE_URL
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

export const env = {
  SALABLE_API_KEY,
  SALABLE_API_BASE_URL,
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
}