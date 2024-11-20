import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {randomUUID} from "crypto";
import {getIronSession} from "iron-session";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {cookies} from "next/headers";
import {z} from "zod";
import {salableApiBaseUrl, salableBasicUsagePlanUuid} from "@/app/constants";


export async function GET(req: NextRequest) {
  const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session-usage" });
  try {
    const requestParams: Record<string, string | null> = {
      planUuid: req.nextUrl.searchParams.get('planUuid'),
      subscriptionUuid: req.nextUrl.searchParams.get('subscriptionUuid'),
      status: req.nextUrl.searchParams.get('status'),
      sort: req.nextUrl.searchParams.get('sort'),
    }
    const paramsObj: Record<string, string> = {}
    for (const entry of Object.entries(requestParams)) {
      if (entry[1]) paramsObj[entry[0]] = entry[1];
    }
    paramsObj.granteeId = session?.uuid
    const params = new URLSearchParams(paramsObj);
    const res = await fetch(`${salableApiBaseUrl}/usage?${params.toString()}`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(
      data,{ status: res.status }
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