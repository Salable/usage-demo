'use server'
import {Session} from "@/app/actions/sign-in";
import {appBaseUrl, salableApiBaseUrl, salableApiKeyPlansRead} from "@/app/constants";
import {getErrorMessage} from "@/app/actions/get-error-message";

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

type CheckoutLink = {
  checkoutUrl: string
}

export async function getCheckoutLink(session: Session, planUuid: string): Promise<Result<CheckoutLink>> {
  try {
    const params = new URLSearchParams({
      customerEmail: session.email,
      granteeId: session.uuid,
      member: session.email,
      successUrl: `${appBaseUrl}?planUuid=${planUuid}`,
      cancelUrl: `${appBaseUrl}/pricing`,
    })
    const res = await fetch(
      `${salableApiBaseUrl}/plans/${planUuid}/checkoutlink?${params.toString()}`,
      {headers: {'x-api-key': salableApiKeyPlansRead}}
    )
    if (res.ok) {
      const data = await res.json() as CheckoutLink
      return {data, error: null}
    }
    const error = await getErrorMessage(res, 'Plan')
    return {data: null, error}
  } catch (e) {
    console.log(e)
    return {data: null, error: 'Unknown error'}
  }
}