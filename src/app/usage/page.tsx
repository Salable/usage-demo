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
import {License, Session} from "@/app/settings/subscriptions/[uuid]/page";
import {CrossIcon} from "@/components/icons/cross-icon";
import {LicenseCheckResponse} from "@/app/page";
import {isArray} from "node:util";

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
  const [generatedNumber, setGeneratedNumber] = useState<number>(0)
  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {data: licenseCheck, isLoading: isLoadingLicenseCheck, isValidating: isValidatingLicenseCheck} = useSWR<LicenseCheckResponse>(`/api/licenses/check?productUuid=${process.env.NEXT_PUBLIC_USAGE_PRODUCT_UUID}`)
  const {data: licensesForGranteeId, isLoading: isLoadingLicensesForGranteeId, isValidating: isValidatingLicensesForGranteeId} = useSWR<License[]>(`/api/licenses/granteeId`)

  const usageLicenses = Array.isArray(licensesForGranteeId) && licensesForGranteeId?.filter((l) => l.productUuid === process.env.NEXT_PUBLIC_USAGE_PRODUCT_UUID && l.status !== 'CANCELED' )
  const basicUsageLicense = Array.isArray(usageLicenses) && usageLicenses?.find((l) => l.planUuid === process.env.NEXT_PUBLIC_SALABLE_BASIC_USAGE_PLAN_UUID)

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
                        <span className='font-bold'>£0.10</span>
                        <span className='text-xl'> / per unit</span>
                      </div>
                    </div>
                    <div className='text-xs'>per month</div>
                  </div>
                  <p className='text-gray-500 text-lg mb-4'>
                    Everything you need to start building.
                  </p>
                  <div className='mb-6'>
                    <div className='flex items-center'>
                      <span className='mr-1'><TickIcon fill="#000" width={15} height={15}/></span>Number generator
                    </div>
                    <div className='flex items-center'>
                      <span className='mr-1'><CrossIcon fill="#000" width={15} height={15}/></span>Name generator
                    </div>
                  </div>
                  <div>
                    {!isLoadingSession && !session?.uuid ? (
                      <Link
                        href={"/sign-up?planUuid=" + process.env.NEXT_PUBLIC_SALABLE_BASIC_USAGE_PLAN_UUID}
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
                                successUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/usage`,
                                cancelUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/cancel`,
                              })
                              const urlFetch = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/plans/${process.env.NEXT_PUBLIC_SALABLE_BASIC_USAGE_PLAN_UUID}/checkoutlink?${params.toString()}`, {
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
                        Purchase plan
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : null}
            {licenseCheck?.capabilitiesEndDates?.basic_usage && basicUsageLicense ? (
              <div className='mt-6'>
                <div className='mb-6 flex items-center flex-shrink-0'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4'>
                    Random number generator
                  </h2>
                </div>
                <div>
                  <div className='text-4xl'>{generatedNumber}</div>
                  <button
                    className={`p-4 text-white rounded-md leading-none bg-blue-700 mt-4`}
                    onClick={async () => {
                      try {
                        setGeneratedNumber(Math.floor(Math.random() * 99))
                        await fetch(`/api/licenses/${basicUsageLicense.uuid}/usage`, {
                          method: 'PUT',
                          body: JSON.stringify({increment: 1})
                        })
                      } catch (e) {
                        console.log(e)
                      }
                    }}
                  >
                    Generate number
                  </button>
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