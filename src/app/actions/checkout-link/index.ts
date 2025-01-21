'use server'
import {Session} from "@/app/actions/sign-in";
import {appBaseUrl} from "@/app/constants";
import {salable} from "@/app/salable";
import {PlanCheckout} from "@salable/node-sdk/dist/src/types";

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function getCheckoutLink(session: Session, planUuid: string): Promise<Result<PlanCheckout>> {
  try {
    const data = await salable.plans.getCheckoutLink(planUuid, {
      customerEmail: session.email,
      granteeId: session.uuid,
      member: session.email,
      successUrl: `${appBaseUrl}?planUuid=${planUuid}`,
      cancelUrl: `${appBaseUrl}/pricing`,
    })
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {data: null, error: 'Unknown error'}
  }
}