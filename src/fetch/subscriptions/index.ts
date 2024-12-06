import {env} from "@/app/environment";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {salableApiBaseUrl} from "@/app/constants";
import {Session} from "@/app/actions/sign-in";
import {getErrorMessage} from "@/app/actions/get-error-message";
import { Result } from "@/app/actions/checkout-link";

export type SalableSubscription = {
  uuid: string,
  paymentIntegrationSubscriptionId: string,
  productUuid: string,
  type: string,
  email: string,
  organisation: string,
  status: string,
  cancelAtPeriodEnd: boolean,
  quantity: string,
  createdAt: string,
  updatedAt: string,
  expiryDate: string,
  lineItemIds : string[],
  planUuid: string,
  isTest: boolean,
  plan: {
    uuid: string,
    name: string,
    description: string | null,
    displayName: string,
    slug: string,
    status: string,
    isTest: boolean,
    trialDays: number | null,
    evaluation: boolean,
    evalDays: number,
    organisation: string,
    visibility: string,
    licenseType: string,
    perSeatAmount: number,
    maxSeatAmount: number,
    interval: string,
    length: number,
    active: boolean,
    planType: string,
    pricingType: string,
    environment: string,
    paddlePlanId: string | null,
    productUuid: string,
    salablePlan: boolean,
    updatedAt: string,
    hasAcceptedTransaction: boolean,
    currencies: {
      price: number
    }[]
  }
}

export type GetAllSubscriptionsResponse = {
  first: string;
  last: string;
  data: SalableSubscription[],
}

export async function getAllSubscriptions(params?: {
  status?: string
}): Promise<Result<GetAllSubscriptionsResponse>> {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    const fetchParams = new URLSearchParams({
      ...params,
      email: session.email,
      sort: 'desc',
      expand: 'plan',
    });
    const res = await fetch(`${salableApiBaseUrl}/subscriptions?${fetchParams.toString()}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2', cache: 'no-cache' },
    })
    if (res.ok) {
      const data = await res.json()
      return {
        data: data as GetAllSubscriptionsResponse,
        error: null
      }
    }
    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch subscriptions',
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscriptions',
    }
  }
}

export async function getOneSubscription(uuid: string): Promise<Result<SalableSubscription>> {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${uuid}?expand=plan.currencies`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
    })
    if (res.ok) {
      const data = await res.json()
      return {
        data: data as SalableSubscription,
        error: null,
      }
    }
    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  }
}