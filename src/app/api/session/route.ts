import {NextRequest, NextResponse} from "next/server";
import { cookies } from "next/headers";
import {getIronSession} from "iron-session";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

export const revalidate = 0

export async function GET() {
  try {
    const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session-usage" });
    if (!session) throw new Error("Session not found");
    return NextResponse.json(
      session,
      {status: 200}
    )
  } catch (e) {
    return NextResponse.json({status: 400, message: "Error retrieving session"})
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session-usage" });
  session.destroy()
  return NextResponse.json(
    { status: 204 }
  );
}
