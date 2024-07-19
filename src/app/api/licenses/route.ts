import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";

export const revalidate = 0

export async function GET(req: NextRequest) {
  const subscriptionUuid = req.nextUrl.searchParams.get('subscriptionUuid')
  let url = `${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses?status=active`
  if (subscriptionUuid) url += `&subscriptionUuid=${subscriptionUuid}`;
  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store"
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

export async function PUT(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
      body: JSON.stringify(await req.json())
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