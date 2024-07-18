import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {validateHash} from "@/utils/validate-hash";
import {db} from "@/drizzle/drizzle";
import {usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

type SignInRequestBody = {
  username: string
  password: string
}

export type DBUser = {
  ID: number;
  username: number
  email: string;
  salt: string;
  hash: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequestBody = await req.json()

    const existingUsersResult = await db.select().from(usersTable).where(eq(usersTable.username, body.username));
    if (existingUsersResult.length === 0) throw new Error("User not found")
    const user = existingUsersResult[0]

    const validLogin = validateHash(body.password, user.salt, user.hash)
    if (!validLogin) throw new Error("Incorrect password")

    const existingUsersOrganisationsResult = await db.select().from(usersOrganisationsTable).where(eq(usersOrganisationsTable.userId, user.id));
    const userOrg = existingUsersOrganisationsResult[0]

    const session = await getIronSession<{id: string; email: string; organisationId: string; username: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.id = user.id.toString();
    session.organisationId = userOrg.organisationId.toString();
    await session.save();


    return NextResponse.json({id: user.id, username: user.username, email: user.email},
      { status: 200 }
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