import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../turso";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {hashString} from "@/utils/hash-string";
import {validateHash} from "@/utils/validate-hash";

type SignInRequestBody = {
  email: string
  password: string
}

export type DBUser = {
  ID: number;
  firstName: string;
  lastName: string;
  email: string;
  salt: string;
  hash: string
}

export type DBOrganisation = {
  ID: number;
  name: string;
}

export type DBUserOrganisation = {
  UserID: number;
  OrganisationID: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequestBody = await req.json()
    const users = await turso.execute(`
      SELECT * FROM User WHERE email = '${body.email}';
    `)
    if (users.rows.length === 0) throw new Error("User not found")

    const user = users.rows[0] as unknown as DBUser
    const validLogin = validateHash(body.password, user.salt, user.hash)

    if (!validLogin) throw new Error("Incorrect password")

    const usersOrganisations = await turso.execute(`
      SELECT * FROM UserOrganisation WHERE UserId = '${user.ID}';
    `)
    const userOrg = usersOrganisations.rows[0] as unknown as DBUserOrganisation

    const session = await getIronSession<{id: string; email: string; organisationId: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.id = user.ID.toString();
    session.organisationId = userOrg.OrganisationID.toString();
    session.email = user.email
    await session.save();


    return NextResponse.json({id: user.ID, firstName: user.firstName, lastName: user.lastName},
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