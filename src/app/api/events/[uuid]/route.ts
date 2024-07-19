import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";

export const revalidate = 0

export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/events/${params.uuid}`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
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