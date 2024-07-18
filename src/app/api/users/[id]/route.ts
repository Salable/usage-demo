import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) NextResponse.json({status: 404})
    const usersResult = await db.select().from(usersTable).where(eq(usersTable.id, Number(params.id)))
    if (usersResult.length === 0) throw new Error("User not found")
    const user = usersResult[0]
    return NextResponse.json(
      {id: user.id, username: user.username, email: user.email}, { status: 200 }
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