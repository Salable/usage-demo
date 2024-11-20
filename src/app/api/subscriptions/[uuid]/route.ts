import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";

export const revalidate = 0

export async function GET(req: NextRequest, { params } : {params: {uuid: string}}) {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.uuid}?expand=[plan.currencies]`, {
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

export async function DELETE(req: NextRequest, { params } : {params: {uuid: string}}) {
  try {
    // const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.uuid}/cancel?when=end`, {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.uuid}/cancel?when=now`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json(error, { status: res.status })
    }
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