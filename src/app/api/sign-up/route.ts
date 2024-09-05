import {NextRequest, NextResponse} from "next/server";
import {randomBytes, randomUUID} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

type SignUpRequestBody = {
  organisationName: string
  username: string
  email: string
  password: string
}

export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body: SignUpRequestBody = await req.json()

    const existingOrganisationsResult = await db.select().from(organisationsTable).where(eq(organisationsTable.name, body.organisationName))
    if (existingOrganisationsResult.length > 0) throw new Error("Organisation already exists")

    const existingUserEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
    if (existingUserEmailResult.length > 0) throw new Error("User email already exists")

    const existingUsernameResult = await db.select().from(usersTable).where(eq(usersTable.username, body.username));
    if (existingUsernameResult.length > 0) throw new Error("Username already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(body.password, salt)

    const createOrg = await db.insert(organisationsTable).values({
      uuid: randomUUID(),
      name: body.organisationName}).returning();
    const organisation = createOrg[0]

    const createUser = await db.insert(usersTable).values({
      uuid: randomUUID(),
      username: body.username,
      email: body.email,
      salt,
      hash
    }).returning();
    const user = createUser[0]

    await db.insert(usersOrganisationsTable).values({userUuid: user.uuid, organisationUuid: organisation.uuid});

    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.uuid = user.uuid;
    session.organisationUuid = organisation.uuid
    if (user.email) session.email = user.email
    await session.save();

    return NextResponse.json({uuid: user.uuid, email: user.email, organisationUuid: organisation.uuid},
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