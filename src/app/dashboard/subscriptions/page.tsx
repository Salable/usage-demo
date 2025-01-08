import {getAllSubscriptions} from "@/fetch/subscriptions";
import Link from "next/link";
import React, {Suspense} from "react";
import {FetchError} from "@/components/fetch-error";

export const metadata = {
  title: 'Subscriptions',
}

export default async function SubscriptionPage() {
  return (
    <main>
      <div className='max-w-[1000px] m-auto text-sm'>
        <h1 className='text-3xl mb-4'>Subscriptions</h1>
        <Suspense fallback={<Loading />}>
          <SubscriptionsList />
        </Suspense>
      </div>
    </main>
  );
}

const SubscriptionsList = async () => {
  const subscriptions = await getAllSubscriptions()
  return (
    <div>
      {subscriptions.data ? (
        <div>
          {subscriptions.data.data.length ? (
            subscriptions.data.data.map((subscription, index) => (
              <div className='bg-white mb-3 flex justify-between items-center shadow rounded-sm p-3'
                   key={`subscription-${index}`}>
                <div className='flex items-center'>
                  <div className='text-lg mr-2 leading-none'>{subscription.plan.displayName}</div>
                  {subscription.plan.licenseType === 'perSeat' ? <span
                    className='text-sm'>({subscription.quantity} seat{Number(subscription.quantity) > 1 ? "s" : ""})</span> : null}
                </div>
                <div>
                  {subscription.status === 'CANCELED' ? <span
                    className='bg-red-200 text-red-500 text-xs uppercase p-1 leading-none rounded-sm font-bold mr-2'>{subscription.status}</span> : null}
                  <Link className='text-blue-700 hover:underline'
                        href={`/dashboard/subscriptions/${subscription.uuid}`}>View</Link>
                </div>
              </div>
            ))
          ) : (
            <div>
              <p className='mb-3'>
                No subscriptions found. Subscribe to one of our plans to
                <Link href='/pricing' className={'text-blue-700 hover:underline'}>get started!</Link>
              </p>
            </div>
          )}
        </div>
      ) : subscriptions.error ? (
        <FetchError error={subscriptions.error}/>
      ) : null}
    </div>
  )
}

const Loading = () => {
  return (
    <div>
      {[...new Array(4)].map((_, index) => (
        <div className="shadow rounded-sm p-4 w-full bg-white mx-auto mb-2" key={`loading-${index}`}>
          <div className="animate-pulse flex w-full">
            <div className="flex-1 space-y-6 py-1">
              <div className="flex justify-between">
                <div className='flex'>
                  <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                </div>
                <div className='flex'>
                  <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                  <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}