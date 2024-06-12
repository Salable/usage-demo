'use client'
import React, {useRef, useState} from "react";
import {useSalableContext} from "@/components/context";
import Link from "next/link";
import {LockIcon} from "@/components/lock-icon";
import {TickIcon} from "@/components/tick-icon";
import Head from "next/head";
import Image from "next/image";
import {User} from "@/app/dashboard/page";
import {DownIcon} from "@/components/down-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";

const users: User[] = [
  {
    id: 'userId-1-xxxx',
    name: 'Perry George',
    avatar: '/avatars/perry-avatar.png',
    email: 'pgeorge@adaptavist.com'
  },
  {
    id: 'userId-2-xxxx',
    name: 'Daniel Sturman',
    avatar: '/avatars/DS-4.webp',
    email: 'dsturman@adaptavist.com'
  },
  {
    id: 'userId-3-xxxx',
    name: 'Sean Cooper',
    avatar: '/avatars/sc.png',
    email: 'scooper@adaptavist.com'
  },
  {
    id: 'userId-4-xxxx',
    name: 'Anil Patel',
    avatar: '/avatars/ap.png',
    email: 'apatel@adaptavist.com'
  }
]

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
  const [activeUser, setActiveUser] = useState<User>(users[0])
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false)
  const ref = useRef(null)

  const {checkLicense} = useSalableContext()
  if (!checkLicense) return null
  const checkLicensesResponse = checkLicense([activeUser.id])

  const clickOutside = () => {
    setIsUserDropdownOpen(false)
  }
  useOnClickOutside(ref, clickOutside)

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 flex justify-between items-center">
          <Link href="/dashboard" className='text-blue-700 mr-2 '>Dashboard</Link>
          <div className={`relative hover:bg-white p-2 rounded-md ${isUserDropdownOpen && "bg-white rounded-br-none"}`}>
            <div ref={ref} onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className='cursor-pointer'>
              <div className='leading-none mb-1'>Acting as</div>
              <div className='flex items-center'>
                <div className='flex items-center mr-2'>
                  <Image className='rounded-full mr-2' src={activeUser.avatar} alt={activeUser.name} width={30}
                         height={30}/>
                  <div>{activeUser.name}</div>
                </div>
                <div><DownIcon height={18} width={18}/></div>
              </div>
            </div>
            {isUserDropdownOpen && (
              <div className='absolute flex-col right-0 top-[64px] bg-white width-max-content'>
                {users.filter((u) => u.id !== activeUser.id).map((u, i) => (
                  <div className='flex items-center border-b-2 whitespace-nowrap p-2 hover:bg-gray-200 cursor-pointer' key={`user-${i}`}
                       onClick={() => {
                         setActiveUser(u)
                         setIsUserDropdownOpen(false)
                       }}>
                    <div className='flex-shrink-0'>
                      <Image className='rounded-full mr-2' src={u.avatar} alt={u.name} width={24} height={24}/>
                    </div>
                    <div>{u.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='mb-6 flex items-center flex-shrink-0'>
          <h2 className='text-2xl font-bold text-gray-900 mr-4'>
            User capabilities
          </h2>
        </div>
        <div className='flex flex-col'>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Photos capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.photos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Videos capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.videos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Export capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.export ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Crop capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.crop ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
        </div>
      </div>
    </>
  )
}