import {NextRequest, NextResponse} from "next/server";
import {randomBytes, randomUUID} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {z} from "zod";

export const revalidate = 0

const ZodSignUpRequestBody = z.object({
  organisationName: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type SignUpRequestBody = z.infer<typeof ZodSignUpRequestBody>

export async function POST(req: NextRequest) {
  try {
    const body: SignUpRequestBody = await req.json()
    const data = ZodSignUpRequestBody.parse(body);

    const existingOrganisationsResult = await db.select().from(organisationsTable).where(eq(organisationsTable.name, data.organisationName))
    if (existingOrganisationsResult.length > 0) throw new Error("Organisation already exists")

    const existingUserEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
    if (existingUserEmailResult.length > 0) throw new Error("User email already exists")

    const existingUsernameResult = await db.select().from(usersTable).where(eq(usersTable.username, data.username));
    if (existingUsernameResult.length > 0) throw new Error("Username already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(data.password, salt)

    const createOrg = await db.insert(organisationsTable).values({
      uuid: randomUUID(),
      name: data.organisationName}).returning();
    const organisation = createOrg[0]

    const createUser = await db.insert(usersTable).values({
      uuid: randomUUID(),
      username: data.username,
      email: data.email,
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