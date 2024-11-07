import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {validateHash} from "@/utils/validate-hash";
import {db} from "@/drizzle/drizzle";
import {usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {z} from "zod";

const ZodSignInRequestBody = z.object({
  username: z.string(),
  password: z.string(),
});

type SignInRequestBody = z.infer<typeof ZodSignInRequestBody>

export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequestBody = await req.json()
    const data = ZodSignInRequestBody.parse(body)

    const existingUsersResult = await db.select().from(usersTable).where(eq(usersTable.username, data.username));
    if (existingUsersResult.length === 0) throw new Error("User not found")
    const user = existingUsersResult[0]

    if (!user.salt || !user.hash) {
      throw new Error("Sign in failed")
    }

    const validLogin = validateHash(data.password, user.salt, user.hash)
    if (!validLogin) throw new Error("Incorrect password")

    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session-usage" });
    session.uuid = user.uuid;
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