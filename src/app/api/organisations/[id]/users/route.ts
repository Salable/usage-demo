import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../../../turso";
import {DBUser, DBUserOrganisation} from "@/app/api/sign-in/route";

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    const usersOrganisations = await turso.execute(`
      SELECT * FROM UserOrganisation WHERE OrganisationId = '${Number(params.id)}';
    `)
    const usersInOrg = usersOrganisations.rows as unknown as DBUserOrganisation[]
    if (usersInOrg.length === 0) throw new Error("No users found")

    console.log('usersInOrg', usersOrganisations)

    const usersDBResult = await turso.execute(`
      SELECT * FROM User WHERE ID IN (${usersInOrg.map((u) => u.UserID).join(',')});
    `)

    const users = usersDBResult.rows as unknown as DBUser[]
    if (users.length === 0) throw new Error("No users found")

    return NextResponse.json(
      users.map((u) => ({
        id: u.ID,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
      })),
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving session"})
  }
}
