import {licenseCheck} from "@/fetch/licenses/check";
import React, {Suspense} from "react";
import {StringGeneratorForm} from "@/components/forms/string-generator-form";
import {getSession} from "@/fetch/session";
import {bytes, salableApiBaseUrl, salableBasicPlanUuid} from "@/app/constants";
import {env} from "@/app/environment";
import { Result } from "./actions/checkout-link";
import { Session } from "./actions/sign-in";
import {getErrorMessage} from "@/app/actions/get-error-message";
import {FetchError} from "@/components/fetch-error";
import Link from "next/link";
import {LockIcon} from "@/components/icons/lock-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {getCurrentUsage} from "@/fetch/usage";

export const metadata = {
  title: 'Salable Usage Demo',
}

export type GetAllLicenses = {
  first: string;
  last: string;
  data: {
    uuid: string;
    granteeId: string;
    planUuid: string;
    subscriptionUuid: string;
  }[]
}

export default async function Home({searchParams}: {
  searchParams: Promise<Record<string, string>>
}) {
  return (
    <main>
      <div className='max-w-[1000px] m-auto text-sm'>
        <div>
          <div className='mb-6'>
            <h1 className='text-4xl font-bold text-gray-900 mr-4 text-center'>
              Random String Generator
            </h1>
            <div className='mt-6'>
              <Suspense fallback={<Loading />}>
                <StringGenerator search={await searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const StringGenerator = async ({search}: {search: Record<string, string>}) => {
  const session = await getSession();
  const currentUsage = await getCurrentUsage({
    planUuid: salableBasicPlanUuid
  });

  if (search.planUuid && session?.uuid) {
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const licenses = await getLicenses(session, search.planUuid);
          if (licenses.error) break
          if (licenses.data?.data?.[0]?.planUuid === search.planUuid) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  }
  const check = session?.uuid ? await licenseCheck(session.uuid) : {
    data: null, error: null
  }

  return (
    <>
      {!check.error ? (
        <>
          <StringGeneratorForm check={check.data} currentUsage={currentUsage.data} />

          {!check.data ? (
            <div className='flex justify-center max-w-[400px] mx-auto'>
              <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>To start creating secure strings subscribe to a plan from our pricing table and get started!</p>
                <div className='mt-3'>
                  <Link href='/pricing' className='inline-block p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-900 transition'>
                    Pricing
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : check.error ? (
        <FetchError error={check.error} />
      ) : currentUsage.error ? (
        <FetchError error={currentUsage.error} />
      ) : null}
    </>
  )
}

const Loading = () => {
  return (
    <div>
      <div className='flex justify-center items-center'>
        <h2 className='text-center mr-2'>Bytes</h2>
        {bytes.map((size, i) => (
          <div
            className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md bg-gray-200`}
            key={`loading-${i}`}
          >
            {size}
            <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
          </div>
        ))}
        <div className='h-[20px] w-[20px]'>
          <LoadingSpinner fill='#000' />
        </div>
      </div>
      <div className='mt-6'>
        <div className='flex flex-col items-center'>
        <div className='flex items-end mb-1'>
            <span className='h-[29px] w-[20px] bg-slate-300 animate-pulse rounded-md mr-1'/>
            <span className='text-xs text-gray-500 font-normal'>credits used</span>
          </div>
          <div className='text-gray-500 flex items-center'>
            Last updated at
            <span className='h-[20px] w-[115px] bg-slate-300 animate-pulse rounded-md ml-1'/>
          </div>
        </div>
      </div>
    </div>
  )
}


async function getLicenses(session: Session, planUuid: string): Promise<Result<GetAllLicenses>> {
  try {
    const res = await fetch(`${salableApiBaseUrl}/licenses?granteeId=${session.uuid}&planUuid=${planUuid}&status=active`, {
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        cache: 'no-cache',
      },
    })
    if (res.ok) {
      const data = await res.json() as GetAllLicenses
      return {
        data,
        error: null
      }
    }

    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  }
}