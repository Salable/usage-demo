import {NextRequest, NextResponse} from "next/server";
import {turso} from "../../../../turso";
import {pbkdf2Sync, randomBytes} from "crypto";

type SignInRequestBody = {
  email: string
  password: string
}

const validatePassword = (password: string, salt: string, hash: string) => {
  const passwordHash = pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return hash === passwordHash;
}

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequestBody = await req.json()
    const users = await turso.execute(`
      SELECT * FROM users WHERE email = '${body.email}';
    `)
    if (users.rows.length === 0) {
      throw new Error("User not found")
    }
    const user = users.rows[0]
    const validLogin = validatePassword(body.password, user.salt as string, user.hash as string)
    if (!validLogin) {
      throw new Error("Incorrect password")
    }
    return NextResponse.json({id: user.ID, firstName: user.firstName, lastName: user.lastName},
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