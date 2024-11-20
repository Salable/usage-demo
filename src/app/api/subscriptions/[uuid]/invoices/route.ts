import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";

export const revalidate = 0

export async function GET(req: NextRequest,  {params}: {params:{uuid: string}}) {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.uuid}/invoices`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.error }, { status: res.status })
    }
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