import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../../turso";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const users = await turso.execute(`
      SELECT * FROM User WHERE ID = '${params.id}';
    `)
    if (!users.rows[0]) {
      throw new Error("User not found")
    }
    const user = users.rows[0]
    return NextResponse.json(
      {id: user.ID, firstName: user.firstName, lastName: user.lastName}, { status: 200 }
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