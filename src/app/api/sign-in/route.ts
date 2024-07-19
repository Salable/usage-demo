import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {validateHash} from "@/utils/validate-hash";
import {db} from "@/drizzle/drizzle";
import {usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

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

export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequestBody = await req.json()

    const existingUsersResult = await db.select().from(usersTable).where(eq(usersTable.username, body.username));
    if (existingUsersResult.length === 0) throw new Error("User not found")
    const user = existingUsersResult[0]

    if (!user.salt || !user.hash) {
      throw new Error("Sign in failed")
    }

    const validLogin = validateHash(body.password, user.salt, user.hash)
    if (!validLogin) throw new Error("Incorrect password")

    const existingUsersOrganisationsResult = await db.select().from(usersOrganisationsTable).where(eq(usersOrganisationsTable.userUuid, user.uuid));
    const userOrg = existingUsersOrganisationsResult[0]

    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.uuid = user.uuid;
    session.organisationUuid = userOrg.organisationUuid;
    if (user.email) session.email = user.email
    await session.save();


    return NextResponse.json({uuid: user.uuid, username: user.username, email: user.email},
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