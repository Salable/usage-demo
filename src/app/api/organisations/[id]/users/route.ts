import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export const revalidate = 0

export async function GET(req: NextRequest, {params}: {params: {id: string | undefined}}) {
  try {
    if (!params.id) return NextResponse.json({status: 404})

    const users = await db.select()
      .from(usersOrganisationsTable)
      .rightJoin(usersTable, eq(usersOrganisationsTable.userUuid, usersTable.uuid))
      .where(eq(usersOrganisationsTable.organisationUuid, params.id))
    if (users.length === 0) throw new Error("No users found")

    return NextResponse.json(
      users.map((u) => {
        const {uuid, email, username} = u.Users
        return ({uuid, email, username});
      }),
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving users"})
  }
}