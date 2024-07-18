import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export async function GET(req: NextRequest, {params}: {params: {id: string | undefined}}) {
  try {
    if (!params.id) NextResponse.json({status: 404})
    // TODO filter out null users in query
    const users = await db.select()
      .from(usersOrganisationsTable)
      .rightJoin(usersTable, eq(usersOrganisationsTable.userId, usersTable.id))
      .where(eq(usersOrganisationsTable.organisationId, Number(params.id)))
    if (users.length === 0) throw new Error("No users found")

    return NextResponse.json(
      users.map((u) => {
        const {id, email, username} = u.Users
        return ({id, email, username});
      }),
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving users"})
  }
}
