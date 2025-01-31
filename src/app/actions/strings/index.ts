'use server'
import {randomBytes} from "crypto";
import {z} from "zod";
import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {licenseCheck} from "@/fetch/licenses/check";
import {env} from "@/app/environment";
import {Result} from "@/app/actions/checkout-link";
import {Bytes} from "@/components/forms/string-generator-form";
import {updateUsage} from "@/fetch/usage";
import {salableBasicPlanUuid} from "@/app/constants";

const ZodCreateStringRequestBody = z.object({
  bytes: z.union([z.literal('16'), z.literal('32'), z.literal('64'), z.literal('128')]),
});

type CreateStringRequestBody = z.infer<typeof ZodCreateStringRequestBody>

const bytesCredits: Record<Bytes, number> = {
  '16': 1,
  '32': 2,
  '64': 3,
  '128': 4,
}

export const generateString = async (formData: CreateStringRequestBody): Promise<Result<{
  string: string,
  credits: number
}>> =>{
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session?.uuid) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }

    const check = await licenseCheck(session.uuid)
    if (!check.data?.capabilities.find((c) => c.capability === 'random_string_generator')) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }

    const data = ZodCreateStringRequestBody.parse(formData)
    const bytes = Number(data.bytes)
    if (!bytes) {
      return {
        data: null,
        error: 'Invalid bytes size'
      }
    }

    const update = await updateUsage({
      planUuid: salableBasicPlanUuid,
      increment: bytesCredits[formData.bytes]
    })
    if (!update.error) {
      return {
        data: {
          string: randomBytes(bytes).toString('hex'),
          credits: bytesCredits[formData.bytes]
        },
        error: null
      };
    }

    return {
      data: null,
      error: update.error
    }
  } catch (e) {
    console.error(e)
    return {
      data: null,
      error: 'Failed to generate string'
    }
  }
}