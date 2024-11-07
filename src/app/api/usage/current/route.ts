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
    const planUuid = req.nextUrl.searchParams.get('planUuid')
    const res = await fetch(`${salableApiBaseUrl}/usage/current?planUuid=${planUuid}&granteeId=${session?.uuid}`, {
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

const ZodUpdateUsageRequestBody = z.object({
  increment: z.number()
});

type UpdateUsageBody = z.infer<typeof ZodUpdateUsageRequestBody>

export async function PUT(req: NextRequest) {
  const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session-usage" });
  try {
    const body: UpdateUsageBody = await req.json()
    const data = ZodUpdateUsageRequestBody.parse(body)

    const res = await fetch(`${salableApiBaseUrl}/usage`, {
      method: "PUT",
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        'unique-key': randomUUID()
      },
      body: JSON.stringify({
        planUuid: salableBasicUsagePlanUuid,
        granteeId: session.uuid,
        countOptions: {
          increment: data.increment
        }
      }),
      cache: "no-store",
    })
    return NextResponse.json(
      { status: res.status }
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