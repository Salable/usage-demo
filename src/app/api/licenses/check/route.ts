import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {unlink} from "node:fs";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams
  const params =new URLSearchParams(searchParams);
  if (!params.get('granteeIds')) {
    return NextResponse.json(
      { error: 'granteeIds param not found' },
      { status: 400 }
    );
  }
  const granteeIds = params.get('granteeIds')

  try {
    const res = await fetch(`${env.SALABLE_API_BASE_URL}/licenses/check?granteeIds=${granteeIds}&productUuid=${env.PRODUCT_UUID}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY },
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