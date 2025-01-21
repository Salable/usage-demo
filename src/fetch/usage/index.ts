import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {env} from "@/app/environment";
import {Result} from "@/app/actions/checkout-link";
import {randomUUID} from "crypto";
import {salable} from "@/app/salable";
import {GetUsageOptions, PaginatedUsageRecords} from "@salable/node-sdk/dist/src/types";

export type CurrentUsage = {
  unitCount: number;
  updatedAt: string
}

export const getAllUsage = async (params?: GetUsageOptions): Promise<Result<PaginatedUsageRecords>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }
    const data = await salable.usage.getAllUsageRecords(session.uuid, params)
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch usage records',
    }
  }
}

export const getCurrentUsage = async (planUuid: string): Promise<Result<CurrentUsage>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }
    const data = await salable.usage.getCurrentUsageRecord(session.uuid, planUuid)
    return {
      data, error: null
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
}): Promise<Result<null>> => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if(!session?.uuid) {
      return {
        data: null,
        error: 'Unauthenticated'
      }
    }
    await salable.usage.updateLicenseUsage(session.uuid, params.planUuid, params.increment, randomUUID())
    return {
      data: null, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to update usage',
    }
  }
}