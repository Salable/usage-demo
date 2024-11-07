import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {salableApiBaseUrl} from "@/app/constants";

export const revalidate = 0

export async function PUT(req: NextRequest,  {params}: {params:{uuid: string}}) {
  try {
    const res = await fetch(`${salableApiBaseUrl}/subscriptions/${params.uuid}/reactivate`, {
      method: 'put',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
    })
    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json(
        { status: res.status, error: data }
      );
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