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
      <main className="min-h-screen p-24 bg-gray-100">
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
  const ref = useRef(null)
  const {data: session} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isValidating: licenseCheckIsValidating} = useSWR<LicenseCheckResponse>(`/api/licenses/check`)

  const clickOutside = () => {
    setIsUserDropdownOpen(false)
  }
  useOnClickOutside(ref, clickOutside)

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {/*<div className="mb-4 flex justify-between items-center">*/}
        {/*  <Link href="/dashboard" className='text-blue-700 mr-2 '>Dashboard</Link>*/}
        {/*  <div ref={ref} className={`relative hover:bg-white p-2 rounded-md ${isUserDropdownOpen && "bg-white rounded-br-none"}`}>*/}
        {/*    <div onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className='cursor-pointer'>*/}
        {/*      <div className='leading-none mb-1'>Acting as</div>*/}
        {/*      <div className='flex items-center'>*/}
        {/*        <div className='flex items-center mr-2'>*/}
        {/*          <Image className='rounded-full mr-2' src={activeUser.avatar} alt={activeUser.name} width={30}*/}
        {/*                 height={30}/>*/}
        {/*          <div>{activeUser.name}</div>*/}
        {/*        </div>*/}
        {/*        <div><DownIcon height={18} width={18}/></div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    {isUserDropdownOpen && (*/}
        {/*      <div className='absolute flex-col right-0 top-[64px] bg-white width-max-content'>*/}
        {/*        {users.filter((u) => u.id !== activeUser.id).map((u, i) => (*/}
        {/*          <div className='flex items-center border-b-2 whitespace-nowrap p-2 hover:bg-gray-200 cursor-pointer' key={`user-${i}`}*/}
        {/*               onClick={() => {*/}
        {/*                 setActiveUser(u)*/}
        {/*                 setIsUserDropdownOpen(false)*/}
        {/*               }}>*/}
        {/*            <div className='flex-shrink-0'>*/}
        {/*              <Image className='rounded-full mr-2' src={u.avatar} alt={u.name} width={24} height={24}/>*/}
        {/*            </div>*/}
        {/*            <div>{u.name}</div>*/}
        {/*          </div>*/}
        {/*        ))}*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}

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
                        successUrl: 'http://localhost:3001',
                        cancelUrl: 'http://localhost:3001/cancel',
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

          <div className='flex items-center'>
            {licenseCheck?.capabilitiesEndDates ? (
              <Link className='text-blue-500 mr-4' href="/settings">Settings</Link>
            ) : null}
            {session ? (
              <button className={`p-4 text-white rounded-md leading-none bg-blue-700 `} onClick={async () => {
                try {
                  setLoggingOut(true)
                  await fetch('/api/sign-out', {
                    method: 'POST',
                    body: JSON.stringify({id: session.id})
                  })
                  setLoggingOut(false)
                } catch (e) {
                  console.log(e)
                }
                router.push('/sign-in')
              }}>{!loggingOut ? "Sign out" : <div className='w-[15px]'><LoadingSpinner fill="white" /></div>}</button>
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