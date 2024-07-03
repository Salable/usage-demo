import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {turso} from "../../../../turso";
import {pbkdf2Sync, randomBytes} from "crypto";

type SignUpRequestBody = {
  firstName: string
  lastName: string
  email: string
  password: string
}

const hashPassword = (password: string, salt: string) => {
  return pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
}

export async function POST(req: NextRequest) {
  try {
    const body: SignUpRequestBody = await req.json()
    const salt = randomBytes(16).toString('hex');
    const hash = hashPassword(body.password, salt)
    await turso.execute(`
      INSERT INTO users (firstName, lastName, email, salt, hash)
      VALUES ('${body.firstName}', '${body.lastName}', '${body.email}', '${salt}', '${hash}');
    `)
    const users = await turso.execute(`
      SELECT * FROM users WHERE email = '${body.email}';
    `)
    const user = users.rows[0]
    if (!user) {
      throw new Error("Sign up failed")
    }
    console.log(user)
    return NextResponse.json({id: user.ID},
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