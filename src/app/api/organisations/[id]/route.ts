import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../../turso";

export type DBOrganisation = {
  ID: number;
  name: string;
}

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    const organisationsDBResult = await turso.execute(`
      SELECT * FROM Organisation WHERE ID = '${params.id}';
    `)
    const organisations = organisationsDBResult.rows as unknown as DBOrganisation[]
    if (organisations.length === 0) throw new Error("No organisation found")

    const organisation = organisations[0]

    return NextResponse.json(
      organisation,
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving users"})
  }
}
