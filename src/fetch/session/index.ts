import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {env} from "@/app/environment";

export const getSession = async () => {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    return JSON.parse(JSON.stringify(session)) as Session;
  } catch (e) {
    console.error(e);
  }
}