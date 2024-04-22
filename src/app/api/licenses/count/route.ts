import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";


export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/licenses/count?subscriptionUuid=${env.SUBSCRIPTION_UUID}&status=active`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
      },
      cache: "no-store"
    })
    const data = await res.json()
    console.log(data)
    return NextResponse.json(
      data, { status: 200 }
    );
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 200 }
    );
  }
}