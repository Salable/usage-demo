'use client'
import React, {useEffect, useRef, useState} from "react";
import {useSalableContext} from "@/components/context";
import {LockIcon} from "@/components/lock-icon";
import {TickIcon} from "@/components/tick-icon";
import Head from "next/head";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {useRouter} from "next/navigation";
import {log} from "node:util";

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
  const {user, checkLicense, setUser} = useSalableContext()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false)
  const [logOut, setLogOut] = useState(false)
  const router = useRouter()
  const ref = useRef(null)
  if (!checkLicense) return null
  if (!setUser) return null
  const checkLicensesResponse = checkLicense([user ? user.id : ''])

  const clickOutside = () => {
    setIsUserDropdownOpen(false)
  }
  useOnClickOutside(ref, clickOutside)

  useEffect(() => {
    if (logOut) window.localStorage.setItem('salable_user_id', '')
  }, [logOut]);

  console.log('logOut', logOut)

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

        {!checkLicensesResponse?.data && (
          <div className='mb-5'>
            <button
              className={`p-4 text-white rounded-md leading-none bg-blue-700`}
              onClick={async () => {
                if (user) {
                  const urlFetch = await fetch(`https://api.salable.app/plans/a22c646e-3e6b-44c4-82be-55ad0176f796/checkoutlink?granteeId=${user.id}&member=${user.id}&cancelUrl=https://www.example.com&successUrl=http://localhost:3000`, {
                    headers: {
                      'x-api-key': process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ as string
                    }
                  })
                  const data = await urlFetch.json()
                  router.push(data.checkoutUrl)
                }
              }}
            >
              Create a team
            </button>
          </div>
        )}

        {checkLicensesResponse?.data && (
         <button className={`p-4 text-white rounded-md leading-none bg-blue-700 `} onClick={() => {
           setLogOut(true)
           router.push('/sign-in')
         }}>Log out</button>
        )}

        <div className='mb-6 flex items-center flex-shrink-0'>
          <h2 className='text-2xl font-bold text-gray-900 mr-4'>
            User capabilities
          </h2>
        </div>
        <div className='flex flex-col'>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Photos capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white"/>
            </div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.photos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.photos || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Videos capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.videos ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.export || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Export capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.export ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${!checkLicensesResponse?.data?.capabilitiesEndDates?.crop || checkLicensesResponse?.isValidating ? "bg-gray-500" : "bg-green-800"}`}>
            <span>Crop capability</span>
            {checkLicensesResponse?.isValidating ? <div className='w-[24px]'><LoadingSpinner fill="white" /></div> : (!checkLicensesResponse?.data?.capabilitiesEndDates?.crop ? (<LockIcon/>) : (<TickIcon/>))}
          </div>
        </div>
      </div>
    </>
  )
}