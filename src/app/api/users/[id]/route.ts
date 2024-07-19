import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {env} from "@/app/environment";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses/granteeId/${params.id}`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2'
      },
      cache: "no-store"
    })

    if (res.status !== 204) {
      const licenses = await res.json() as {uuid: string, granteeId: string | null}[]
      await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses`, {
        method: 'PUT',
        headers: {
          'x-api-key': env.SALABLE_API_KEY,
          version: 'v2'
        },
        cache: "no-store",
        body: JSON.stringify(licenses.map((l) => ({
          granteeId: null,
          uuid: l.uuid
        })))
      })
    }
    await db.delete(usersTable).where(eq(usersTable.uuid, params.id));
    return NextResponse.json({status: 204})
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) NextResponse.json({status: 404})
    const usersResult = await db.select().from(usersTable).where(eq(usersTable.uuid, params.id))
    if (usersResult.length === 0) throw new Error("User not found")
    const user = usersResult[0]
    return NextResponse.json(
      {uuid: user.uuid, username: user.username, email: user.email}, { status: 200 }
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