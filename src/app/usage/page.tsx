'use client'
import React, {useEffect, useRef, useState} from "react";
import useSWR, {SWRConfig} from "swr";
import LoadingSpinner from "@/components/loading-spinner";
import {useRouter, useParams, useSearchParams} from 'next/navigation';
import Image from "next/image";
import {SalableProvider, useSalableContext} from "@/components/context";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {subscription} from "swr/subscription";
import Link from "next/link";
import Head from "next/head";
import {useOnClickOutside} from "usehooks-ts";

const users: User[] = [
  {
    id: 'userId-1-xxxx',
    name: 'Perry George',
    avatar: '/avatars/perry-avatar.png',
    email: 'pgeorge@adaptavist.com'
  },
]

export default function Dashboard() {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main className="min-h-screen p-24 bg-gray-100">
        <div className="w-full font-sans text-sm">
          <ToastContainer/>
          <Main/>
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const router = useRouter();
  const [polling, setPolling] = useState(false)
  const [disableButton, setDisableButton] = useState(false)
  const [incrementUsage, setIncrementUsage] = useState<number>(0)
  const [updatedUnitCount, setUpdatedUnitCount] = useState<number | null>(null)

  const {data: usage, isLoading, mutate} = useSWR('/api/licenses/11ea24c2-b57f-432b-a203-91740369fe16/usage')

  const updateUsage = async (increment: number) => {
    try {
      setDisableButton(true)
      const res = await fetch(`/api/licenses/11ea24c2-b57f-432b-a203-91740369fe16/usage`, {
        method: 'PUT',
        body: JSON.stringify({increment}),
      })
      if (res.ok) {
        setPolling(true)
        setUpdatedUnitCount(usage.unitCount + incrementUsage)
      }
      if (!res.ok) setDisableButton(false)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (polling) {
      const getUsage = async () => {
        try {
          const res = await fetch(`/api/licenses/11ea24c2-b57f-432b-a203-91740369fe16/usage`)
          return await res.json()
        } catch (e) {
          console.log(e)
        }
      }
      const eventPolling = setInterval(async () => {
        const updatedUsage = await getUsage()
        if (updatedUsage.unitCount === updatedUnitCount) {
          clearInterval(eventPolling)
          setUpdatedUnitCount(null)
          setDisableButton(false)
          setIncrementUsage(0)
          setPolling(false)
          await mutate()
        }
      }, 500);
    }
  }, [updatedUnitCount]);

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 text-right">
          <Link href="/" className='text-blue-700'>Logged in user</Link>
        </div>
        <div>
          {!isLoading ? (
            <div>
              <div className='flex justify-between items-center'>
                <div className='mb-6 flex-col items-center'>
                  <div className='text-xl mb-4'>Current billed units: {usage.unitCount}</div>
                  <div className='border-b-2 flex justify-center items-center pb-4'>
                    <button
                      className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] ${!disableButton ? "bg-blue-700" : "bg-gray-700"} disabled:bg-gray-700`}
                      disabled={incrementUsage === 0}
                      onClick={() => {
                        setIncrementUsage(incrementUsage - 1);
                      }}>
                      -
                    </button>
                    <div className='px-4 text-xl'>
                      <span>{incrementUsage}</span>
                    </div>
                    <button
                      className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`}
                      onClick={() => {
                        setIncrementUsage(incrementUsage + 1);
                      }}>
                      +
                    </button>
                  </div>
                  <div className='mt-4'>
                    <button
                      disabled={incrementUsage === 0}
                      className={`w-full flex justify-center p-4 text-white rounded-md leading-none ${!disableButton ? "bg-blue-700" : "bg-gray-700"} disabled:bg-gray-700`}
                      onClick={async () => {
                        await updateUsage(incrementUsage)
                      }}
                    >
                      {disableButton ? (
                        <div className="w-[20px]">
                          <LoadingSpinner fill="white"/>
                        </div>
                      ) : "Update usage"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="ml-3 w-[20px]">
              <LoadingSpinner/>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


type SalableRequest = {
  status: string;
  type: string
}

type GetLicensesCountResponse = {
  assigned: number;
  unassigned: number;
  count: number;
}

type GetAllLicensesResponse = {
  first: string;
  last: string;
  data: License[]
}

type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
}
type SelectedLicenseUuids = {
  [uuid: string]: {
    granteeId: string | null
  }
}

export type User = {
  id: string;
  name: string;
  avatar: string;
  email: string;
}