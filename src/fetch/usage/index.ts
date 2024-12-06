import {Prisma} from "@prisma/client";
import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";
import {getErrorMessage} from "@/app/actions/get-error-message";
import {Result} from "@/app/actions/checkout-link";
import {randomUUID} from "crypto";

export type CurrentUsage = {
  unitCount: number;
  updatedAt: string
}

export type UsageRecord = {
  unitCount: number;
  type: string;
  recordedAt: string;
  resetAt: string | null;
  createdAt: string;
  updatedAt: string
}

export type GetAllUsageRecords = {
  first: string;
  last: string;
  data: UsageRecord[]
}

export const getAllUsage = async (params?: {
  planUuid?: string
  subscriptionUuid?: string
  status?: string
  sort?: Prisma.SortOrder
}): Promise<Result<GetAllUsageRecords>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }

    const requestParams: Record<string, string> = {}
    if (params) {
      for (const entry of Object.entries(params)) {
        if (entry[1] !== undefined) {
          requestParams[entry[0]] = entry[1]
        }
      }
    }
    requestParams.granteeId = session.uuid
    const searchParams = new URLSearchParams(requestParams);
    const res = await fetch(`${salableApiBaseUrl}/usage?${searchParams.toString()}`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json() as GetAllUsageRecords
      return {
        data,
        error: null
      }
    }

    const error = getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch usage records',
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch usage records',
    }
  }
}

export const getCurrentUsage = async (params: {
  planUuid: string
}): Promise<Result<CurrentUsage>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }

    const requestParams: Record<string, string> = {}
    for (const entry of Object.entries(params)) {
      if (entry[1] !== undefined) {
        requestParams[entry[0]] = entry[1]
      }
    }
    requestParams.granteeId = session.uuid
    const searchParams = new URLSearchParams(requestParams);
    const res = await fetch(`${salableApiBaseUrl}/usage/current?${searchParams.toString()}`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json() as CurrentUsage
      return {
        data,
        error: null
      }
    }

    const error = getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch current usage',
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch current usage',
    }
  }
}

export const updateUsage = async (params: {
  planUuid: string,
  increment: number,
  subscriptionUuid?: string
  status?: string
  sort?: Prisma.SortOrder
}): Promise<Result<null>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }

    const res = await fetch(`${salableApiBaseUrl}/usage`, {
      method: "PUT",
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        'unique-key': randomUUID()
      },
      body: JSON.stringify({
        planUuid: params.planUuid,
        granteeId: session.uuid,
        countOptions: { increment: params.increment }
      }),
      cache: "no-store",
    })
    if (res.ok) {
      return {
        data: null, error: null
      }
    }

    const error = getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to update usage',
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to update usage',
    }
  }
}