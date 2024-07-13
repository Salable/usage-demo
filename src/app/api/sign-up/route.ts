import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../turso";
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {DBOrganisation, DBUser} from "@/app/api/sign-in/route";

type SignUpRequestBody = {
  organisationName: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SignUpRequestBody = await req.json()

    const existingUsers = await turso.execute(`
      SELECT * FROM User WHERE email = '${body.email}';
    `)
    if (existingUsers.rows.length > 1) throw new Error("User already exists")

    const existingOrganisations = await turso.execute(`
      SELECT * FROM Organisation WHERE name = '${body.organisationName}';
    `)
    if (existingOrganisations.rows.length > 1) throw new Error("Organisation already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(body.password, salt)

    await turso.execute(`
      INSERT INTO Organisation (name) VALUES ('${body.organisationName}');
    `)
    await turso.execute(`
      INSERT INTO User (firstName, lastName, email, salt, hash)
      VALUES ('${body.firstName}', '${body.lastName}', '${body.email}', '${salt}', '${hash}');
    `)

    console.log(4)
    const userDBResponse = await turso.execute(`
      SELECT * FROM User WHERE email = '${body.email}';
    `)
    const user = userDBResponse.rows[0] as unknown as DBUser
    if (!user) throw new Error("Sign up failed")

    console.log(5)
    const organisationDBResponse =  await turso.execute(`
      SELECT * FROM Organisation WHERE name = '${body.organisationName}';
    `)
    const organisation = organisationDBResponse.rows[0] as unknown as DBOrganisation
    if (!organisation) throw new Error("Sign up failed")
    console.log(6)

    await turso.execute(`
        INSERT INTO UserOrganisation (UserID, OrganisationID) VALUES (${user.ID}, ${organisation.ID});
    `)

    console.log(7)

    const session = await getIronSession<{id: string; email: string; organisationId: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.id = user.ID.toString();
    session.organisationId = organisation.ID.toString()
    session.email = user.email
    await session.save();

    console.log(8)

    return NextResponse.json({id: user.ID, organisationId: organisation.ID},
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