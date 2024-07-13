import {NextRequest, NextResponse} from "next/server";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";

type SignOutRequestBody = {
  id: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<{email: string}>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    session.destroy();
    return NextResponse.json(
      { status: 201 }
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