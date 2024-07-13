import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../turso";
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {DBUser} from "@/app/api/sign-in/route";

type AcceptInviteRequestBody = {
  token: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type DBToken = {
  ID: number;
  Token: string;
  OrganisationID: number
}

export async function POST(req: NextRequest) {
  try {
    const body: AcceptInviteRequestBody = await req.json()

    const tokensResult = await turso.execute(`
      SELECT * FROM Token WHERE Token = '${body.token}';
    `)
    if (tokensResult.rows.length === 0) throw new Error("Token does not exist")
    const token = tokensResult.rows[0] as unknown as DBToken

    const existingUsers = await turso.execute(`
      SELECT * FROM User WHERE email = '${body.email}';
    `)
    if (existingUsers.rows.length > 1) throw new Error("User already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(body.password, salt)

    await turso.execute(`
      INSERT INTO User (firstName, lastName, email, salt, hash)
      VALUES ('${body.firstName}', '${body.lastName}', '${body.email}', '${salt}', '${hash}');
    `)

    const userDBResponse = await turso.execute(`
      SELECT * FROM User WHERE email = '${body.email}';
    `)
    const user = userDBResponse.rows[0] as unknown as DBUser
    if (!user) throw new Error("Sign up failed")

    await turso.execute(`
        INSERT INTO UserOrganisation (UserID, OrganisationID) VALUES (${user.ID}, ${token.OrganisationID});
    `)

    const session = await getIronSession<{id: string; email: string; organisationId: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.id = user.ID.toString();
    session.organisationId = token.OrganisationID.toString()
    session.email = user.email
    await session.save();

    return NextResponse.json({id: user.ID, organisationId: token.OrganisationID},
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