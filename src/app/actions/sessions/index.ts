'use server'
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/actions/sign-in";
import {env} from "@/app/environment";

export async function destroySession() {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    session.destroy()
  } catch (e) {
    console.log(e)
  }
}