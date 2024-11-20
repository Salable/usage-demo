'use client'
import React, {useState} from "react";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import { useForm, SubmitHandler } from "react-hook-form"
import {PlanButton} from "@/components/plan-button";
import {appBaseUrl, salableBasicUsagePlanUuid, salableProUsagePlanUuid, salableUsageProductUuid} from "@/app/constants";
import {format} from "date-fns";
import {toast} from "react-toastify";

export type Bytes = '16' | '32' | '64'
export type LicenseCheckResponse = {
  capabilities: string[],
  publicHash: string,
  signature: string,
  capsHashed: string,
  capabilitiesEndDates: Record<string, string>
}

export default function Usage() {
  return (
    <>
      <Head>
        <title>Salable Seats Demo</title>
      </Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main />
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const [creditsUsedInSession, setCreditsUsedInSession] = useState<number>(0)
  const [randomString, setRandomString] = useState<string | null>(null)
  const [defaultBytes, setDefaultBytes] = useState<Bytes>('16')

  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession, mutate: mutateSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck, mutate: mutateLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check?productUuid=${salableUsageProductUuid}`)
  const {data: currentUsage, isLoading: isLoadingCurrentUsage, isValidating: isValidatingCurrentUsage, mutate: mutateCurrentUsage} = useSWR<{unitCount: number; updatedAt: string}>(`/api/usage/current?planUuid=${licenseCheck?.capabilitiesEndDates?.['128'] ? salableProUsagePlanUuid : salableBasicUsagePlanUuid}`)

  const usage = currentUsage?.unitCount ?? 0

  const StringGenerator = () => {
    const {register, handleSubmit, watch, formState: {isSubmitting}} = useForm<{
      bytes: Bytes
    }>({
      defaultValues: {bytes: defaultBytes},
      mode: 'onChange'
    })

    const onSubmit: SubmitHandler<{
      bytes: Bytes
    }> = async (formData) => {
      const res = await fetch('/api/strings', {
        method: 'POST',
        body: JSON.stringify({bytes: Number(formData.bytes)})
      })
      setDefaultBytes(formData.bytes)
      if (res.ok) {
        const data = await res.json()
        setRandomString(data.randomString)
        setCreditsUsedInSession(creditsUsedInSession + data.credits)
      }
    }

    if (!licenseCheck?.capabilitiesEndDates) return null

    return (
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex justify-center items-center'>
            <h2 className='text-center mr-3'>Bytes</h2>
            <label htmlFor='16_bytes'
                   className={`p-3 inline-flex flex-col leading-none border-2 mr-2 rounded-md cursor-pointer ${watch().bytes === '16' ? "border-black bg-black text-white" : ""}`}>
              16
            </label>
            <input id='16_bytes' type="radio" value={'16'} {...register('bytes')} className='hidden'/>

            <label htmlFor='32_bytes'
                   className={`p-3 inline-flex flex-col leading-none border-2 mr-2 rounded-md cursor-pointer ${watch().bytes === '32' ? "border-black bg-black text-white" : ""}`}>
              32
            </label>
            <input id='32_bytes' type="radio" value={'32'} {...register('bytes')} className='hidden'/>

            <label htmlFor='64'
                   className={`p-3 inline-flex flex-col leading-none border-2 mr-2 rounded-md cursor-pointer ${watch().bytes === '64' ? "border-black bg-black text-white" : ""}`}>
              64
            </label>
            <input id='64' type="radio" value={'64'} {...register('bytes')} className='hidden'/>

            <button
              className={`p-3 text-white rounded-md leading-none bg-blue-700 text-sm`}
            >{!isSubmitting ? "Generate" :
              <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}</button>
          </div>
        </form>
        {randomString ? (
          <div className='mt-6 relative text-center flex justify-center'>
          <pre
            className='p-2 leading-none truncate text-lg text-center bg-white rounded-l-full'>{randomString}</pre>
            <button
              className='rounded-r-full bg-blue-700 uppercase px-2 pr-[12px] text-white text-xs'
              onClick={() => {
                navigator.clipboard.writeText(randomString)
                toast.success('Successfully copied')
              }}
            >
              Copy
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {(!isLoadingSession && !isValidatingSession) && (!isLoadingLicenseCheck && !isValidatingLicenseCheck) && (!isLoadingCurrentUsage && !isValidatingCurrentUsage) ? (
          <>
            {!licenseCheck?.capabilitiesEndDates ? (
              <div className='grid grid-cols-3 gap-6'>
                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Basic</h2>
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
                  </div>
                  <div className='flex'>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={`/sign-up?planUuid=${salableBasicUsagePlanUuid}&successUrl=${appBaseUrl}`}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <PlanButton uuid={salableBasicUsagePlanUuid} successUrl={appBaseUrl} />
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            {licenseCheck?.capabilitiesEndDates ? (
              <>
                <div>
                  <div className='mb-6'>
                    <h2 className='text-4xl font-bold text-gray-900 mr-4 text-center'>
                      Random String Generator
                    </h2>
                  </div>
                </div>
                <div className='mt-6'>
                  <StringGenerator/>
                </div>
                <div className='mt-6'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4 text-center'>{usage + creditsUsedInSession} <span
                    className='text-xs text-gray-500 font-normal'>credits used</span></h2>
                  {currentUsage?.updatedAt ? (
                    <div className='text-gray-500 text-center'>Last updated
                      at {format(new Date(currentUsage?.updatedAt), 'd LLL yyy H:mm')}</div>
                  ) : null}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="w-[20px]">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div className='animate-pulse'>
      <div className="animate-pulse items-center flex justify-center">
        <div className="h-2 bg-slate-300 rounded w-[300px]"></div>
      </div>

      <div className='animate-pulse flex justify-center items-center mt-6'>
        <div className="mr-2 h-2 bg-slate-300 rounded w-[40px]"></div>
        {[...new Array(4)].map((_, i) => (
          <div className="mr-2 h-[43px] w-[43px] bg-slate-300 rounded-md"></div>
        ))}
        <div className="mr-2 h-[43px] w-[84px] bg-slate-300 rounded-md"></div>
      </div>

      <div className='animate-pulse mt-6 flex flex-col justify-center items-center'>
        <div className="h-2 mb-3 bg-slate-300 rounded w-[100px]"></div>
        <div className="h-2 bg-slate-300 rounded w-[200px]"></div>
      </div>
    </div>
  )
}