if (!process.env.SALABLE_API_KEY) throw new Error('Missing env SALABLE_API_KEY')
if (!process.env.DEV_SALABLE_API_KEY) throw new Error('Missing env DEV_SALABLE_API_KEY')
if (!process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL) throw new Error('Missing env NEXT_PUBLIC_SALABLE_API_BASE_URL')
if (!process.env.SUBSCRIPTION_UUID) throw new Error('Missing env SUBSCRIPTION_UUID')
if (!process.env.PRODUCT_UUID) throw new Error('Missing env PRODUCT_UUID')
if (!process.env.TURSO_DATABASE_URL) throw new Error('Missing env TURSO_DATABASE_URL')
if (!process.env.TURSO_AUTH_TOKEN) throw new Error('Missing env TURSO_AUTH_TOKEN')

const SALABLE_API_KEY = process.env.SALABLE_API_KEY
const SALABLE_API_BASE_URL = process.env.SALABLE_API_BASE_URL
const SUBSCRIPTION_UUID = process.env.SUBSCRIPTION_UUID
const PRODUCT_UUID = process.env.PRODUCT_UUID
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN
const DEV_SALABLE_API_KEY = process.env.DEV_SALABLE_API_KEY
const METERED_LICENSE_UUID = process.env.METERED_LICENSE_UUID

export const env = {
  SALABLE_API_KEY,
  SALABLE_API_BASE_URL,
  SUBSCRIPTION_UUID,
  PRODUCT_UUID,
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  DEV_SALABLE_API_KEY,
  METERED_LICENSE_UUID
}