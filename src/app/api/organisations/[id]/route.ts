import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {organisationsTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export type DBOrganisation = {
  ID: number;
  name: string;
}

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    if (!params.id) NextResponse.json({status: 404})
    const existingOrganisationsResult = await db.select().from(organisationsTable).where(eq(organisationsTable.uuid, params.id))
    if (existingOrganisationsResult.length === 0) throw new Error("No organisation found")
    const organisation = existingOrganisationsResult[0]

    return NextResponse.json(
      organisation,
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving users"})
  }
}
