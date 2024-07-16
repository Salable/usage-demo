'use client'
import React, {useRef, useState} from "react";
import {LockIcon} from "@/components/lock-icon";
import {TickIcon} from "@/components/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {useRouter} from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

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
  const [loggingOut, setLoggingOut] = useState<boolean>(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false)
  const router = useRouter()
  const {data: session} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isValidating: licenseCheckIsValidating} = useSWR<LicenseCheckResponse>(`/api/licenses/check`)

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className='flex justify-between mb-5'>
          <div>
            {!licenseCheck?.capabilitiesEndDates ? (
              <button
                className={`p-4 text-white rounded-md leading-none bg-blue-700`}
                onClick={async () => {
                  if (session) {
                    try {
                      const params = new URLSearchParams({
                        customerEmail: session.email,
                        granteeId: session.id,
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
            ) : null}
          </div>
        </div>

        <div className='mb-6 flex items-center flex-shrink-0'>
          <h2 className='text-2xl font-bold text-gray-900 mr-4'>
            User capabilities
          </h2>
        </div>
        <div className='flex flex-col'>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.photos || licenseCheckIsValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Photos capability</span>
            {licenseCheckIsValidating ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
            </div> : (!licenseCheck?.capabilitiesEndDates?.photos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.videos || licenseCheckIsValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Videos capability</span>
            {licenseCheckIsValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!licenseCheck?.capabilitiesEndDates?.videos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.export || licenseCheckIsValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Export capability</span>
            {licenseCheckIsValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!licenseCheck?.capabilitiesEndDates?.export ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!licenseCheck?.capabilitiesEndDates?.crop || licenseCheckIsValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Crop capability</span>
            {licenseCheckIsValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!licenseCheck?.capabilitiesEndDates?.crop ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
        </div>
      </div>
    </>
  )
}