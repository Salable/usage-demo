'use client'
import React, {useState} from "react";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {useRouter} from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {LicenseCheckResponse} from "@/app/page";
import { useForm, SubmitHandler } from "react-hook-form"
import {PlanButton} from "@/components/plan-button";

export type Bytes = '16' | '32' | '64'

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
  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check?productUuid=${process.env.NEXT_PUBLIC_USAGE_PRODUCT_UUID}`)
  const {data: usageOnLicense} = useSWR<{unitCount: number; updatedAt: string}>(`/api/usage`)
  const date = usageOnLicense?.updatedAt ? new Date(new Date(usageOnLicense.updatedAt)).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: '2-digit',
    minute:'2-digit',
    second: "2-digit"
  }) : ''

  const hasRequiredPlanSlug = licenseCheck?.capabilities?.includes("secure_strings")
  const usage = usageOnLicense?.unitCount ?? 0

  const StringGenerator = () => {
    const {register, handleSubmit, getValues, watch, formState: {isSubmitting}} = useForm<{
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
              onClick={() => navigator.clipboard.writeText(randomString)}
            >
              Copy
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  if (!isLoadingSession && !isValidatingSession && !session) {
    router.push("/")
  }

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {(!isLoadingSession && !isLoadingLicenseCheck) && (!isValidatingSession && !isValidatingLicenseCheck) ? (
          <>
            {!licenseCheck?.capabilitiesEndDates ? (
              <div className='grid grid-cols-3 gap-6'>

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Secure strings</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£0.01</span>
                        <span className='text-xl'> / per credit</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Everything you need to start building.
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
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={"/sign-up?planUuid=" + process.env.NEXT_PUBLIC_SALABLE_USAGE_PLAN_UUID}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <PlanButton uuid={process.env.NEXT_PUBLIC_SALABLE_USAGE_PLAN_UUID as string} />
                    )}
                  </div>
                </div>

              </div>
            ) : null}
            {hasRequiredPlanSlug ? (
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
                  <div className='text-gray-500 text-center'>Last updated at {date.toString()}</div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="w-[20px]">
            <LoadingSpinner/>
          </div>
        )}
      </div>
    </>
  )
}