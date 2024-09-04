'use client'
import React from "react";
import LoadingSpinner from "@/components/loading-spinner";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {useRouter} from "next/navigation";
import {GetAllSubscriptionsResponse} from "@/app/api/subscriptions/route";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";

export default function SubscriptionsView() {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main  />
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const router = useRouter()
  const {data: session, isLoading, isValidating} = useSWR<Session>(`/api/session`)
  const {data: subscriptions, isValidating: isValidatingSubscriptions, isLoading: isLoadingSubscriptions } = useSWR<GetAllSubscriptionsResponse>(`/api/subscriptions`)

  if (!isValidating && !isLoading && !session?.uuid) {
    router.push("/")
  }
  return (
    <div className='max-w-[1000px] m-auto'>
      <h1 className='text-3xl mb-6 flex items-center'>Subscriptions</h1>
      {!isValidatingSubscriptions && !isLoadingSubscriptions ? (
        <div>
          {subscriptions?.data.length ? (
            subscriptions.data.sort((a, b) => {
              if (a.status === 'CANCELED') return 1
              if (b.status === 'CANCELED') return -1
              return 0
            }).map((subscription) => (
              <div className='bg-white mb-3 flex justify-between items-center shadow rounded-sm p-3'>
                <div className='flex items-center'>
                  <div className='text-lg mr-2'>{subscription.plan.displayName}</div>
                  {subscription.plan.licenseType === 'perSeat' ? <span
                    className='text-sm'>({subscription.quantity} seat{Number(subscription.quantity) > 1 ? "s" : ""})</span> : null}
                </div>
                <div>
                  {subscription.status === 'CANCELED' ? <span
                    className='bg-red-200 text-red-500 text-xs uppercase p-1 leading-none rounded-sm font-bold mr-2'>{subscription.status}</span> : null}
                  <Link className='text-blue-500' href={`/settings/subscriptions/${subscription.uuid}`}>View</Link>
                </div>
              </div>
            ))
          ) : null}
        </div>
      ) : (
        <div className="ml-3 w-[20px]">
          <LoadingSpinner/>
        </div>
      )}
    </div>
  )
}