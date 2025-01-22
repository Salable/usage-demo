import {env} from "@/app/environment";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/actions/sign-in";
import { Result } from "@/app/actions/checkout-link";
import {PaginatedSubscriptionInvoice, Plan, PlanCurrency, Subscription} from "@salable/node-sdk/dist/src/types";
import {salable} from "@/app/salable";
import {SalableResponseError} from "@salable/node-sdk";
import {salableProductUuid} from "@/app/constants";

export type SubscriptionExpandedPlan = Subscription & {
  plan: Plan
}

export type GetAllSubscriptionsExpandedPlan = {
  first: string;
  last: string;
  data: SubscriptionExpandedPlan[]
}

export async function getAllSubscriptions(): Promise<Result<GetAllSubscriptionsExpandedPlan>> {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    const data = await salable.subscriptions.getAll({
      email: session.email,
      expand: ['plan'],
      sort: 'desc',
      productUuid: salableProductUuid
    }) as GetAllSubscriptionsExpandedPlan
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscriptions',
    }
  }
}

export type SubscriptionExpandedPlanCurrency = Subscription & {
  plan: Plan & {
    currencies: PlanCurrency[]
  }
}

export async function getOneSubscription(uuid: string): Promise<Result<SubscriptionExpandedPlanCurrency | null>> {
  try {
    const data = await salable.subscriptions.getOne(uuid, {expand: ['plan.currencies']}) as SubscriptionExpandedPlanCurrency
    return {
      data, error: null
    }
  } catch (e) {
    if (e instanceof SalableResponseError && e.code === 'S1002') {
      return {
        data: null,
        error: null
      }
    }
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  }
}

export const getSubscriptionInvoices = async (subscriptionUuid: string): Promise<Result<PaginatedSubscriptionInvoice>> => {
  try {
    const data = await salable.subscriptions.getInvoices(subscriptionUuid)
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  }
}