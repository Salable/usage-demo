'use server'
import {randomBytes, randomUUID} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/actions/sign-in";
import {z} from "zod";
import {prismaClient} from "../../../../prisma";
import {redirect} from "next/navigation";
import {getCheckoutLink} from "@/app/actions/checkout-link";
import {env} from "@/app/environment";

const signUpRequestBody = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type SignUpRequestBody = z.infer<typeof signUpRequestBody>

export async function signUp(formData: SignUpRequestBody, planUuid: string | null) {
  let checkoutUrl: string | null = null
  try {
    const data = signUpRequestBody.parse(formData);

    const existingUser = await prismaClient.user.findFirst({
      where: {
        OR: [
          {email: data.email},
          {username: data.username},
        ],
      },
    })

    if (existingUser && existingUser.email === data.email) {
      return {
        data: null,
        error: 'Email already exists'
      }
    }
    if (existingUser && existingUser.username === data.username) {
      return {
        data: null,
        error: 'Username already exists'
      }
    }

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(data.password, salt)

    const user = await prismaClient.user.create({
      data: {
        uuid: randomUUID(),
        username: data.username,
        email: data.email,
        salt,
        hash
      }
    })

    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    session.uuid = user.uuid;
    session.email = user.email
    await session.save();

    if (planUuid) {
      const checkoutUrlData = await getCheckoutLink(session, planUuid)
      if (checkoutUrlData.data) {
        checkoutUrl = checkoutUrlData.data.checkoutUrl
      } else {
        return {
          data: null,
          error: checkoutUrlData.error
        }
      }
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Unknown error'
    }
  }

  redirect(checkoutUrl ?? '/')
}