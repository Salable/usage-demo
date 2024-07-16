'use client'
import React, {useRef, useState} from "react";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";
import {LicenseCheckResponse} from "@/app/page";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";
import {useRouter} from "next/navigation";
import {useOnClickOutside} from "usehooks-ts";
import {SalableLogo} from "@/components/salable-logo";

export const Header = () => {
  const router = useRouter();
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef(null);
  const {data: session, mutate: mutateSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isValidating: licenseCheckIsValidating} = useSWR<LicenseCheckResponse>(`/api/licenses/check`)
  const {data: user} = useSWR<User>(`/api/users/${session?.id}`)

  const clickOutside = () => {
    setDropDownOpen(false)
  }
  useOnClickOutside(ref, clickOutside)

  return (
    <header className='bg-white'>
      <div className='max-w-[1000px] m-auto py-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <div className='w-[30px] mr-2'><SalableLogo/></div>
          <span>Salable Seats Demo</span>
        </div>
        <div>
          <div className="flex justify-between items-center">
            {session?.id ? (
              <div ref={ref} className={`relative hover:bg-white ${dropDownOpen && "bg-white rounded-br-none"}`}>
                <div onClick={() => setDropDownOpen(!dropDownOpen)} className='w-[38px] h-[38px] cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                  <span>{user?.firstName?.[0]}</span>
                  <span>{user?.lastName?.[0]}</span>
                </div>
                {dropDownOpen && (
                  <div className='absolute flex flex-col right-0 top-[45px] bg-white width-max-content text-right w-[200px] rounded-sm shadow'>
                    <Link className='p-3 block f-full border-b hover:bg-gray-50 text-sm' href={'/settings'}>Subscriptions</Link>
                    <Link className='p-3 block f-full border-b hover:bg-gray-50 text-sm' href={'/settings/organisations'}>Organisations</Link>
                    <Link className='p-3 block f-full border-b hover:bg-gray-50 text-sm' href={'/'}>Capabilities</Link>
                    <button className='p-3 block f-full text-right hover:bg-gray-50 text-sm' onClick={async () => {
                      try {
                        setLoggingOut(true)
                        await fetch('/api/sign-out', {
                          method: 'POST',
                          body: JSON.stringify({id: session.id})
                        })
                        await mutateSession()
                        setLoggingOut(false)
                      } catch (e) {
                        console.log(e)
                      }
                      router.push('/sign-in')
                    }}>{!loggingOut ? "Sign out" :
                      <div className='w-[15px]'><LoadingSpinner fill="#1e4fd8"/></div>}</button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}