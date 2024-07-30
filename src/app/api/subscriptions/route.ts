import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

export const revalidate = 0

export type SalableSubscription = {
  uuid: string,
  paymentIntegrationSubscriptionId: string,
  productUuid: string,
  type: string,
  email: string,
  organisation: string,
  status: string,
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

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    const res = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/subscriptions?email=${session.email}&expand=plan`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
    })
    const data = await res.json()
    return NextResponse.json(
      data, { status: res.status }
    );
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}