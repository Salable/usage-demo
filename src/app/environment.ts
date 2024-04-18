if (!process.env.SALABLE_API_KEY) throw new Error('Missing env SALABLE_API_KEY')
if (!process.env.SALABLE_API_BASE_URL) throw new Error('Missing env SALABLE_API_BASE_URL')
if (!process.env.SUBSCRIPTION_UUID) throw new Error('Missing env SUBSCRIPTION_UUID')

const SALABLE_API_KEY = process.env.SALABLE_API_KEY
const SALABLE_API_BASE_URL = process.env.SALABLE_API_BASE_URL
const SUBSCRIPTION_UUID = process.env.SUBSCRIPTION_UUID

export const env = {
  SALABLE_API_KEY,
  SALABLE_API_BASE_URL,
  SUBSCRIPTION_UUID
}