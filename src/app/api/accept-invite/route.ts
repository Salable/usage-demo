import {NextRequest, NextResponse} from "next/server";
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {db} from "@/drizzle/drizzle";
import {tokensTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {z} from "zod";

export const revalidate = 0

const ZodAcceptInviteRequestBody = z.object({
  token: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  licenseUuid: z.string().uuid(),
});

type AcceptInviteRequestBody = z.infer<typeof ZodAcceptInviteRequestBody>

export async function POST(req: NextRequest) {
  try {
    const body: AcceptInviteRequestBody = await req.json()
    const data = ZodAcceptInviteRequestBody.parse(body)

    const tokensResult = await db.select().from(tokensTable).where(eq(tokensTable.value, data.token));
    if (tokensResult.length === 0) throw new Error("Token does not exist")
    const token = tokensResult[0]

    const existingUsersResult = await db.select().from(usersTable).where(eq(usersTable.username, data.username));
    if (existingUsersResult.length > 1) throw new Error("User already exists")

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(data.password, salt)

    const updateUser = await db.update(usersTable)
      .set({
        username: data.username,
        email: data.email,
        salt,
        hash
      })
      .where(eq(usersTable.uuid, token.userUuid))
      .returning();


    const user = updateUser[0]

    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.uuid = user.uuid;
    session.organisationUuid = token.organisationUuid
    if (user.email) session.email = user.email
    await session.save();

    return NextResponse.json({id: user.uuid, organisationUuid: token.organisationUuid},
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