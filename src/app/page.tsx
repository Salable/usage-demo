'use client'
import React, {useRef, useState} from "react";
import {LockIcon} from "@/components/icons/lock-icon";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {useRouter} from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {CrossIcon} from "@/components/icons/cross-icon";

export type LicenseCheckResponse = {
  capabilities: string[],
  publicHash: string,
  signature: string,
  capsHashed: string,
  capabilitiesEndDates: Record<string, string>
}

export default function Home() {
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
  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check`)

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {(!isLoadingSession && !isLoadingLicenseCheck) && (!isValidatingSession && !isValidatingLicenseCheck) ? (
          <>
            {!licenseCheck?.capabilitiesEndDates ? (
              <div className='grid grid-cols-3 gap-6'>

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Basic</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£1</span>
                        <span className='text-xl'> / per seat</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Everything you need to start building.
                  </p>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Photos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Videos
                    </div>
                    <div className='flex items-center line-through'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>Export
                    </div>
                    <div className='flex items-center line-through'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>Crop
                    </div>
                  </div>
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={"/sign-up?planUuid=" + process.env.NEXT_PUBLIC_SALABLE_BASIC_PLAN_UUID}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <button
                        className={`p-4 text-white rounded-md leading-none bg-blue-700 w-full`}
                        onClick={async () => {
                          if (session) {
                            try {
                              const params = new URLSearchParams({
                                customerEmail: session.email,
                                granteeId: session.uuid,
                                member: session.email,
                                successUrl: 'http://localhost:3000',
                                cancelUrl: 'http://localhost:3000/cancel',
                              })
                              const urlFetch = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/plans/${process.env.NEXT_PUBLIC_SALABLE_BASIC_PLAN_UUID}/checkoutlink?${params.toString()}`, {
                                headers: {'x-api-key': process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ as string}
                              })
                              const data = await urlFetch.json()
                              router.push(data.checkoutUrl)
                            } catch (e) {
                              console.log(e)
                            }
                          }
                        }}
                      >
                        Purchase team plan
                      </button>
                    )}
                  </div>
                </div>

                <div className='p-6 rounded-lg bg-white shadow flex-col'>
                  <h2 className='mb-2 font-bold text-2xl'>Pro</h2>
                  <div className='mb-4'>
                    <div className='flex items-end mb-1'>
                      <div className='text-3xl mr-2'>
                        <span className='font-bold'>£4</span>
                        <span className='text-xl'> / per seat</span>
                        <span className='text-sm ml-1'>(min 3 seats)</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Access to every tool you could ever need.
                  </p>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Photos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Videos
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Export
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Crop
                    </div>
                  </div>
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={"/sign-up?planUuid=" + process.env.NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID}
                        className='block p-4 text-white rounded-md leading-none bg-blue-700 w-full text-center'
                      >
                        Sign up
                      </Link>
                    ) : (
                      <button
                        className={`p-4 text-white rounded-md leading-none bg-blue-700 w-full`}
                        onClick={async () => {
                          if (session) {
                            try {
                              const params = new URLSearchParams({
                                customerEmail: session.email,
                                granteeId: session.uuid,
                                member: session.email,
                                successUrl: 'http://localhost:3000',
                                cancelUrl: 'http://localhost:3000/cancel',
                              })
                              const urlFetch = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/plans/${process.env.NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID}/checkoutlink?${params.toString()}`, {
                                headers: {'x-api-key': process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ as string}
                              })
                              const data = await urlFetch.json()
                              router.push(data.checkoutUrl)
                            } catch (e) {
                              console.log(e)
                            }
                          }
                        }}
                      >
                        Purchase team plan
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : null}
            {licenseCheck?.capabilitiesEndDates ? (
              <div className='mt-6'>
                <div className='mb-6 flex items-center flex-shrink-0'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4'>
                    User capabilities
                  </h2>
                </div>
                <div className='flex flex-col'>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.photos || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Photos capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.photos ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.videos || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Videos capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.videos ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.export || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Export capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.export ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                  <div
                    className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.crop || isValidatingLicenseCheck ? "bg-gray-500" : "bg-green-800"}`}>
                    <span>Crop capability</span>
                    {isValidatingLicenseCheck ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
                    </div> : (!licenseCheck?.capabilitiesEndDates?.crop ? (<LockIcon/>) : (<TickIcon/>))}
                  </div>
                </div>
              </div>
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