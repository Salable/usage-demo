import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";


export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/licenses?subscriptionUuid=${env.SUBSCRIPTION_UUID}&status=active&take=100`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'beta',
      },
      cache: "no-store"
    })
    const data = await res.json()
    return NextResponse.json(
      data, { status: 200 }
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

export async function PUT(req: NextRequest) {
  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/licenses`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY
      },
      cache: "no-store",
      body: JSON.stringify(await req.json())
    })
    const data = await res.json()
    return NextResponse.json(
      { status: 204 }
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