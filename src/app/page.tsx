'use client'
import React, {useEffect, useRef, useState} from "react";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {GetAllLicensesResponse, Session} from "@/app/settings/subscriptions/[uuid]/page";
import { useForm, SubmitHandler } from "react-hook-form"
import {PlanButton} from "@/components/plan-button";
import {appBaseUrl, salableBasicUsagePlanUuid, salableProUsagePlanUuid, salableUsageProductUuid} from "@/app/constants";
import {format} from "date-fns";
import {LockIcon} from "@/components/icons/lock-icon";
import {CrossIcon} from "@/components/icons/cross-icon";

export type Bytes = '16' | '32' | '64' | '128'
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
  const [isPolling, setIsPolling] = useState(false)
  const [isChangingSubscription, setIsChangingSubscription] = useState<boolean>(false)
  const [changingPlanUuid, setChangingPlanUuid] = useState<string | null>(null)
  const [disableButton, setDisableButton] = useState(false)


  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession, mutate: mutateSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck, mutate: mutateLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check?productUuid=${salableUsageProductUuid}`)
  const {data: currentUsage, isLoading: isLoadingCurrentUsage, isValidating: isValidatingCurrentUsage, mutate: mutateCurrentUsage} = useSWR<{unitCount: number; updatedAt: string}>(`/api/usage/current?planUuid=${licenseCheck?.capabilitiesEndDates?.['128'] ? salableProUsagePlanUuid : salableBasicUsagePlanUuid}`)
  console.log('licenseCheck', licenseCheck)
  console.log('currentUsage', currentUsage)

  const upgradeToPro = async () => {
    try {
      setDisableButton(true)
      setIsChangingSubscription(true)
      const licensesRes = await fetch(`/api/licenses?planUuid=${salableBasicUsagePlanUuid}&status=active&granteeId=${session?.uuid}`)
      const licenses = await licensesRes.json()
      if (!licenses.data.length) {
        // reject here
      }
      const change = await fetch(`/api/subscriptions/${licenses.data[0].subscriptionUuid}/change`, {
        method: 'PUT',
        body: JSON.stringify({planUuid: salableProUsagePlanUuid})
      })
      if (change.ok) {
        setIsPolling(true)
        setChangingPlanUuid(salableProUsagePlanUuid)
      } else {
        setIsChangingSubscription(false)
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      setIsChangingSubscription(false)
      console.log(e)
    }
  }

  useEffect(() => {
    if (isPolling) {
      if (isChangingSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            const res = await fetch(`/api/licenses?planUuid=${changingPlanUuid}&status=active&granteeId=${session?.uuid}`)
            const data = await res.json() as GetAllLicensesResponse
            if (data?.data.length) {
              clearInterval(subscriptionPolling)
              setIsPolling(false)
              setIsChangingSubscription(false)
              setDisableButton(false)
              await mutateSession()
              await mutateLicenseCheck()
              await mutateCurrentUsage()
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
    }
  }, [changingPlanUuid]);

  const usage = currentUsage?.unitCount ?? 0

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

            <label
              htmlFor='128'
              className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md
                ${watch().bytes === '128' ? "border-black bg-black text-white" : ""}
                ${licenseCheck?.capabilitiesEndDates['128'] ? "cursor-pointer" : ""}
                ${!licenseCheck?.capabilitiesEndDates['128'] ? "bg-gray-200" : ""}
              `}
            >
              128
              {!licenseCheck?.capabilitiesEndDates['128'] ? (
                <>
                  <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
                </>
              ) : null}
            </label>
            <input disabled={!licenseCheck?.capabilitiesEndDates['128']} id='128' type="radio" value={'128'} {...register('bytes')} className='hidden'/>

            <button
              className={`p-3 text-white rounded-md leading-none bg-blue-700 text-sm`}
              disabled={disableButton}
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
                    <div className='flex items-center'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>128 byte strings
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

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Pro</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£2</span>
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
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={`/sign-up?planUuid=${salableBasicUsagePlanUuid}&successUrl=${appBaseUrl}/usage`}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <PlanButton uuid={salableBasicUsagePlanUuid} successUrl={`${appBaseUrl}/usage`}/>
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


                {!licenseCheck?.capabilitiesEndDates['128'] ? (
                  <div className='flex justify-center'>
                    <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                      <div>
                        Upgrade to Pro to unlock <span className='font-bold'>128 Byte strings</span>
                      </div>
                      <div className='flex'>
                        <button
                          onClick={async () => {await upgradeToPro()}}
                            className='mt-2 p-2 inline-flex text-white rounded-md leading-none bg-blue-700 items-center justify-center'
                          disabled={disableButton}
                        >
                          Upgrade now
                          {isChangingSubscription ? (
                            <div className='w-[14px] ml-2'><LoadingSpinner fill="white"/></div>
                          ) : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
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