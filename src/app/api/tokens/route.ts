import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../turso";
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {DBOrganisation, DBUser} from "@/app/api/sign-in/route";

type CreateTokenRequestBody = {
  organisationId: string
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateTokenRequestBody = await req.json()

    const existingOrganisations = await turso.execute(`
      SELECT * FROM Organisation WHERE ID = '${body.organisationId}';
    `)
    if (existingOrganisations.rows.length === 0) throw new Error("Organisation does not exist")

    const token = randomBytes(64).toString('hex')

    await turso.execute(`
      INSERT INTO Token (Token, OrganisationID) VALUES ('${token}', '${body.organisationId}');
    `)

    return NextResponse.json({token},
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