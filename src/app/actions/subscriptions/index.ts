'use server'
import {salableApiBaseUrl} from "@/app/constants";
import {env} from "@/app/environment";
import {revalidatePath} from "next/cache";
import {getOneSubscription} from "@/fetch/subscriptions";
import {getErrorMessage} from "@/app/actions/get-error-message";
import { Result } from "../checkout-link";

export type GetAllInvoicesResponse = {
  first: string;
  last: string;
  hasMore: boolean;
  data: {
    created: number;
    effective_at: number;
    automatically_finalizes_at: number;
    hosted_invoice_url: string;
    invoice_pdf: string;
    lines: {
      data: {
        amount: number;
        price: { unit_amount: 1 }
        quantity: number;
      }[]
    }
  }[]
}

export const getSubscriptionInvoices = async (subscriptionUuid: string): Promise<Result<GetAllInvoicesResponse>> => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${subscriptionUuid}/invoices`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (res.ok) {
      const data = await res.json() as GetAllInvoicesResponse
      return {
        data, error: null
      }
    }
    const error = await getErrorMessage(res, 'Subscription')
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription invoices'
    }
  }
}

export const cancelSubscription = async (subscriptionUuid: string) => {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${subscriptionUuid}/cancel?when=now`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (!res.ok) {
      const error = getErrorMessage(res, 'Subscription')
      console.log(error)
      return {
        data: null,
        error: 'Failed to cancel subscription'
      }
    }

    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.status === 'CANCELED') {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to cancel subscription'
    }
  }
  revalidatePath(`/settings/subscriptions/${subscriptionUuid}`)
}