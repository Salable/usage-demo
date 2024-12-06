'use server'
import Link from "next/link";
import {SalableLogo} from "@/components/salable-logo";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {prismaClient} from "../../prisma";
import {Dropdown} from "@/components/dropdown";
import { Session } from "@/app/actions/sign-in";
import {User} from "@prisma/client"
import { Result } from "@/app/actions/checkout-link";
import {env} from "@/app/environment";

export const Header = async () => {
  const user = await getUser();

  return (
    <header className='bg-white px-6'>
      <div className='max-w-[1000px] m-auto py-4 flex justify-between items-center'>
        <Link className='flex items-center' href='/'>
          <div className='w-[30px] mr-2'><SalableLogo/></div>
          <span>Salable Usage Demo</span>
        </Link>
        <div>
          <div className="flex justify-between items-center">
            {user.data?.user ? (
              <Dropdown user={user.data.user} />
            ) : user.error ? (
              <span className='text-red-600 text-sm'>{user.error}</span>
            ) : (
              <Link className='p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-900 transition w-full text-center text-sm' href="/sign-in">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

async function getUser(): Promise<Result<{
  user: User | null,
} | null>> {
  try {
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session?.uuid) {
      return {
        data: null,
        error: null,
      }
    }
    const user = await prismaClient.user.findUnique({
      where: {uuid: session.uuid}
    })
    return {
      data: {user},
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch user',
    }
  }
}