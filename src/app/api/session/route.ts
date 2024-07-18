import {NextRequest, NextResponse} from "next/server";
import { cookies } from "next/headers";
import {getIronSession} from "iron-session";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

export async function GET() {
  try {
    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
    if (!session) throw new Error("Session not found");
    return NextResponse.json(
      session,
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving session"})
  }
}

export async function POST(req: NextRequest) {
  // const session = await getIronSession<{email: string}>(cookies(), { password: "...", cookieName: "..." });
  // session.email = "Alison";
  // await session.save();
  return NextResponse.json(
    { status: 201 }
  );
}
