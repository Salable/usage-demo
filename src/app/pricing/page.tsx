import {TickIcon} from "@/components/icons/tick-icon";
import Link from "next/link";
import {salableBasicPlanUuid} from "@/app/constants";
import {PlanButton} from "@/components/plan-button";
import React, {Suspense} from "react";
import {getSession} from "@/fetch/session";
import {licenseCheck} from "@/fetch/licenses/check";
import {FetchError} from "@/components/fetch-error";

export const metadata = {
  title: 'Pricing',
}

export default async function Pricing() {
  return (
    <div className='max-w-[1000px] mx-auto'>
      <div className='md:grid md:grid-cols-3 md:gap-6'>
        <div className='p-6 rounded-lg bg-white shadow flex-col mb-6 md:mb-0'>
          <h2 className='mb-2 font-bold text-2xl'>Random String Generator</h2>
          <div className='mb-4'>
            <div className='flex items-end mb-1'>
              <div className='text-3xl mr-2'>
                <span className='font-bold'>£1</span>
                <span className='text-xl'> / per credit</span>
              </div>
            </div>
            <div className='text-xs'>per month</div>
          </div>
          <p className='text-gray-500 text-lg mb-4'>
            Everything you need to start building secure strings.
          </p>
          <div className='mb-6'>
            <div className='flex items-center'>
              <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>16 byte strings
            </div>
            <div className='flex items-center'>
              <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>32 byte strings
            </div>
            <div className='flex items-center'>
              <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>64 byte strings
            </div>
            <div className='flex items-center'>
              <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>128 byte strings
            </div>
          </div>

          <Suspense fallback={<div className='animate-pulse bg-slate-300 h-[46px] w-full rounded-md' />}>
            <BasicPlanPricingTableButton />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

const BasicPlanPricingTableButton = async () => {
  const session = await getSession()
  if (!session?.uuid) {
    return (
      <Link
        href={`/sign-up?planUuid=${salableBasicPlanUuid}`}
        className='block p-4 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-900 transition w-full text-center'
      >
        Sign up
      </Link>
    )
  }
  const check = session?.uuid ? await licenseCheck(session.uuid) : {
    data: null, error: null
  }
  if (check.error) return <FetchError error='Failed to create button' />
  return (
    <>
      {check?.data?.capabilities?.find((a) => a.capability === 'random_string_generator') ? (
        <div className={`p-4 text-white rounded-md leading-none bg-green-700 inline-flex items-center w-full justify-center font-bold`}>
          <div className='mr-1'><TickIcon fill='#FFF' height={14} width={14}/></div>
          Already subscribed
        </div>
      ) : (
        <PlanButton session={session} planUuid={salableBasicPlanUuid}/>
      )}
    </>
  )
}