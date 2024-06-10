'use client'
import React from "react";
import {useSalableContext} from "@/components/context";
import Link from "next/link";
import {LockIcon} from "@/components/lock-icon";
import {TickIcon} from "@/components/tick-icon";
import Head from "next/head";
import Image from "next/image";

const activeUser = {
    id: 'userId-1-xxxx',
    name: 'Perry George',
    avatar: '/avatars/perry-avatar.png',
    email: 'pgeorge@adaptavist.com'
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
  const {checkLicense} = useSalableContext()
  if (!checkLicense) return null
  const checkLicensesResponse = checkLicense([activeUser.id])
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 flex justify-end items-center">
          <Link href="/dashboard" className='text-blue-700 mr-2 '>Dashboard</Link>
          <div><Image className='rounded-full' src={activeUser.avatar}  alt={activeUser.name} width={30} height={30} /></div>
        </div>
        <div className='mb-6 flex items-center'>
          <h2 className='text-2xl font-bold text-gray-900 mr-4'>
            User capabilities
          </h2>
        </div>
        <div className='flex flex-col'>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${checkLicensesResponse?.data?.capabilitiesEndDates?.photos ? "bg-green-800" : "bg-gray-500"}`}>
            <span>Photos capability</span> {!checkLicensesResponse?.data?.capabilitiesEndDates?.photos ? (<LockIcon />) : (<TickIcon />)}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${checkLicensesResponse?.data?.capabilitiesEndDates?.videos ? "bg-green-800" : "bg-gray-500"}`}>
            <span>Videos capability</span> {!checkLicensesResponse?.data?.capabilitiesEndDates?.videos ? (<LockIcon />) : (<TickIcon />)}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${checkLicensesResponse?.data?.capabilitiesEndDates?.export ? "bg-green-800" : "bg-gray-500"}`}>
            <span>Export capability</span> {!checkLicensesResponse?.data?.capabilitiesEndDates?.export ? (<LockIcon />) : (<TickIcon />)}
          </div>
          <div
            className={`flex justify-between items-center p-4 text-white mb-2 rounded-md ${checkLicensesResponse?.data?.capabilitiesEndDates?.crop ? "bg-green-800" : "bg-gray-500"}`}>
            <span>Crop capability</span> {!checkLicensesResponse?.data?.capabilitiesEndDates?.crop ? (<LockIcon />) : (<TickIcon />)}
          </div>
        </div>
      </div>
    </>
  )
}