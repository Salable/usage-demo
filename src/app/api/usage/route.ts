import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {randomUUID} from "crypto";


export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/licenses`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
      body: JSON.stringify(await req.json())
    })
    const data = await res.json()
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

export async function PUT(req: NextRequest) {
  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/usage`, {
      method: "PUT",
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        'unique-key': randomUUID()
      },
      cache: "no-store",
      body: JSON.stringify(await req.json())
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