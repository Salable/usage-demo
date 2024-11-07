if (!process.env.NEXT_PUBLIC_SALABLE_USAGE_PLAN_UUID) throw new Error('Missing env NEXT_PUBLIC_SALABLE_USAGE_PLAN_UUID')
if (!process.env.NEXT_PUBLIC_SALABLE_USAGE_PRO_PLAN_UUID) throw new Error('Missing env NEXT_PUBLIC_SALABLE_USAGE_PRO_PLAN_UUID')
if(!process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL) throw new Error('Missing env NEXT_PUBLIC_SALABLE_API_BASE_URL')
if(!process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ) throw new Error('Missing env NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ')
if(!process.env.NEXT_PUBLIC_SALABLE_USAGE_PRO_PLAN_UUID) throw new Error('Missing env NEXT_PUBLIC_SALABLE_USAGE_PRO_PLAN_UUID')
if(!process.env.NEXT_PUBLIC_USAGE_PRODUCT_UUID) throw new Error('Missing env NEXT_PUBLIC_USAGE_PRODUCT_UUID')
if(!process.env.NEXT_PUBLIC_APP_BASE_URL) throw new Error('Missing env NEXT_PUBLIC_APP_BASE_URL')

export const salableApiBaseUrl = process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL
export const salableApiKeyPlansRead = process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ
export const salableBasicUsagePlanUuid = process.env.NEXT_PUBLIC_SALABLE_USAGE_PLAN_UUID
export const salableProUsagePlanUuid = process.env.NEXT_PUBLIC_SALABLE_USAGE_PRO_PLAN_UUID
export const salableUsageProductUuid = process.env.NEXT_PUBLIC_USAGE_PRODUCT_UUID
export const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL