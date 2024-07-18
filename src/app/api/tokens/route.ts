import {NextRequest, NextResponse} from "next/server";
import {randomBytes} from "crypto";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, tokensTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {env} from "@/app/environment";

type CreateTokenRequestBody = {
  organisationId: string;
  email: string;
  licenseUuid?: string;
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')

    const existingUsersResult = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email as string))
    if (existingUsersResult.length === 0) return NextResponse.json({status: 404});

    const user = existingUsersResult[0]

    const existingTokensResult = await db.select()
      .from(tokensTable)
      .where(eq(tokensTable.userId, user.id))
    if (existingTokensResult.length === 0) return NextResponse.json({status: 404});

    const token = existingTokensResult[0]

    return NextResponse.json({value: token.value},
      { status: 200 }
    );
  } catch (e) {
    const error = e as Error
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateTokenRequestBody = await req.json()

    console.log(1)

    const existingOrganisationsResult = await db.select().from(organisationsTable).where(eq(organisationsTable.id, Number(body.organisationId)))
    if (existingOrganisationsResult.length === 0) throw new Error("Organisation does not exist")

    const createUser = await db.insert(usersTable).values({
      username: null,
      email: body.email,
      salt: null,
      hash: null,
    }).returning();

    console.log(2)

    const user = createUser[0]

    await db.insert(usersOrganisationsTable).values({
      userId: user.id,
      organisationId: existingOrganisationsResult[0].id,
    }).returning();

    console.log(3)

    const token = randomBytes(32).toString('hex')
    await db.insert(tokensTable).values({
      value: token,
      organisationId: existingOrganisationsResult[0].id,
      userId: user.id
    }).returning();

    console.log(4)

    if (body.licenseUuid) {
      console.log(5)
      const updateLicense = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses/${body.licenseUuid}`, {
        method: "PUT",
        headers: {
          'x-api-key': env.SALABLE_API_KEY,
          version: 'v2',
        },
        body: JSON.stringify({
          granteeId: user.id.toString()
        })
      })
      if (!updateLicense.ok) {
        throw new Error("Failed to assign license")
      }
    }

    console.log(6)

    return NextResponse.json({token},
      { status: 200 }
    );
  } catch (e) {
    const error = e as Error
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}