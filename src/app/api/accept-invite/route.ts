import {NextRequest, NextResponse} from "next/server";
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {db} from "@/drizzle/drizzle";
import {tokensTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {env} from "@/app/environment";

type AcceptInviteRequestBody = {
  token: string
  username: string
  email: string
  password: string
  licenseUuid?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: AcceptInviteRequestBody = await req.json()

    const tokensResult = await db.select().from(tokensTable).where(eq(tokensTable.value, body.token));
    if (tokensResult.length === 0) throw new Error("Token does not exist")
    const token = tokensResult[0]

    const existingUsersResult = await db.select().from(usersTable).where(eq(usersTable.username, body.username));
    if (existingUsersResult.length > 1) throw new Error("User already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(body.password, salt)

    const updateUser = await db.update(usersTable)
      .set({
        username: body.username,
        email: body.email,
        salt,
        hash
      })
      .where(eq(usersTable.id, token.userId))
      .returning();


    const user = updateUser[0]

    const session = await getIronSession<{id: string; organisationId: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.id = user.id.toString();
    session.organisationId = token.organisationId.toString()
    await session.save();

    return NextResponse.json({id: user.id, organisationId: token.organisationId},
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