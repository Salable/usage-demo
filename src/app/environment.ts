if (!process.env.SALABLE_API_KEY) throw new Error('Missing env SALABLE_API_KEY')
if (!process.env.SESSION_COOKIE_NAME) throw new Error('Missing env SESSION_COOKIE_NAME')
if (!process.env.SESSION_COOKIE_PASSWORD) throw new Error('Missing env SESSION_COOKIE_PASSWORD')
if (!process.env.DATABASE_URL) throw new Error('Missing env DATABASE_URL')

const SALABLE_API_KEY = process.env.SALABLE_API_KEY
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME
const DATABASE_URL = process.env.DATABASE_URL
const SESSION_COOKIE_PASSWORD = process.env.SESSION_COOKIE_PASSWORD

export const env = {
  SALABLE_API_KEY,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_PASSWORD,
  DATABASE_URL
}