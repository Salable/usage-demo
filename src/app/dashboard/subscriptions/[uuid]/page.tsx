import {getOneSubscription, SalableSubscription} from "@/fetch/subscriptions";
import React, {Suspense} from "react";
import {getSubscriptionInvoices} from "@/app/actions/subscriptions";
import {format} from "date-fns";
import Link from "next/link";
import {CancelPlanButton} from "@/components/cancel-plan-button";
import {FetchError} from "@/components/fetch-error";
import {getAllUsage, getCurrentUsage} from "@/fetch/usage";
import {getSession} from "@/fetch/session";
import {redirect} from "next/navigation";

export const metadata = {
  title: 'Subscription',
}

export default async function SubscriptionPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const session = await getSession()
  if (!session?.uuid) redirect('/')
  const subscription = await getOneSubscription(uuid)
  if (subscription.error) {
    return (
      <div className='max-w-[1000px] m-auto text-sm'>
        <FetchError error={subscription.error}/>
      </div>
    )
  }
  if (subscription.data?.email !== session.email) redirect('/')

  return (
    <div className='max-w-[1000px] m-auto text-sm'>
      <Subscription uuid={uuid} subscription={subscription.data} />
      <div className='mt-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Usage records</h2>
        <div className='mt-3'>
          <Suspense fallback={<InvoicesLoading />}>
            <UsageRecords subscriptionUuid={uuid} />
          </Suspense>
        </div>
      </div>
      <div className='mt-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Invoices</h2>
        <div className='mt-3'>
          <Suspense fallback={<InvoicesLoading/>}>
            <Invoices uuid={uuid}/>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

const Subscription = async ({uuid, subscription}: { uuid: string, subscription: SalableSubscription }) => {
  return (
    <>
      <h1 className='text-3xl mb-6 flex items-center'>Subscription
        <span className={`px-2 ml-2 py-2 rounded-md leading-none ${subscription.status === 'CANCELED' ? 'bg-red-200 text-red-500' : 'bg-green-200 text-green-700'} uppercase text-lg font-bold`}>
          {subscription.status}
        </span>
      </h1>

      <div className='mb-3'>
        <div className='text-gray-500'>Plan</div>
        <div className='text-xl'>{subscription.plan.displayName}</div>
      </div>

      {subscription.status !== 'CANCELED' ? (
        <>
          <div className='mt-3'>
            <Suspense fallback={<CurrentUsageLoading />}>
              <CurrentUsage planUuid={subscription.planUuid} />
            </Suspense>
          </div>
          <div className='flex mt-3'>
            <CancelPlanButton subscriptionUuid={uuid}/>
          </div>
        </>
      ) : null}
    </>
  )
}

const CurrentUsage = async ({planUuid}: {planUuid: string}) => {
  const currentUsage = await getCurrentUsage({planUuid});
  return (
    <>
      {currentUsage.data ? (
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            <span className='mr-1'>{currentUsage.data.unitCount}</span>
            <span className='text-xs text-gray-500 font-normal'>credit{currentUsage.data.unitCount !== 1 ? 's' : ''} used</span>
          </h2>
          {currentUsage.data.updatedAt ? (
            <div className='text-gray-500'>Last updated at {format(new Date(currentUsage.data.updatedAt), 'd LLL yyy H:mm')}</div>
          ) : null}
        </div>
      ) : currentUsage.error ? (
        <FetchError error={currentUsage.error} />
      ) : null}
    </>
  )
}

const Invoices = async ({uuid}: { uuid: string }) => {
  const invoices = await getSubscriptionInvoices(uuid);
  return (
    <div>
      {invoices.data ? (
        <div className='rounded-sm bg-white'>
          {invoices?.data.data.sort((a, b) => a.created + b.created).map((invoice, index) => {
            return (
              <div className='border-b-2 p-3 flex justify-between items-center' key={`invoice-${index}`}>
                <div>
                  {invoice.effective_at ? (
                    <span>{format(new Date(invoice.effective_at * 1000), "d LLL yyy")}</span>
                  ) : null}
                  {invoice.automatically_finalizes_at ? (
                    <span>Finalises at {format(new Date(invoice.automatically_finalizes_at * 1000), 'd LLL yyy H:mm')}</span>
                  ) : null}
                </div>
                <div className='flex items-center'>
                  <span className='mr-2'>£{(invoice.lines.data[0].quantity * invoice.lines.data[0].price.unit_amount) / 100}</span>
                  {invoice.automatically_finalizes_at && invoice.lines.data[0].price.unit_amount ? (
                    <span className='p-1 leading-none uppercase rounded-sm bg-gray-200 text-gray-500 text-xs font-bold'>DRAFT</span>
                  ) : null}
                  {invoice.hosted_invoice_url ? (
                    <Link className='text-blue-700 hover:underline' href={invoice.hosted_invoice_url}>View</Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : invoices.error ? (
        <FetchError error={invoices.error}/>
      ) : null}
    </div>
  )
}

const UsageRecords = async ({subscriptionUuid}: {subscriptionUuid: string}) => {
  const usageRecords = await getAllUsage({
    subscriptionUuid
  })
  return (
    <div className='rounded-sm bg-white'>
      {usageRecords.data ? (
        <>
          {usageRecords.data.data.map((record, index) => (
            <div className='border-b-2 p-3 flex justify-between items-center' key={`usage-record-${index}`}>
              <div>
                {record.type === 'current' ? (
                  <>From {format(new Date(record.createdAt), "d LLL yyy")}</>
                ) : (
                  <>{format(new Date(record.createdAt), "d LLL yyy")} - {format(new Date(record.recordedAt), "d LLL yyy")}</>
                )}
              </div>
              <div className='flex items-center'>
                {record.type !== 'recorded' ? (
                  <span
                    className='mr-2 p-1 leading-none uppercase rounded-sm bg-green-100 text-green-700 text-xs font-bold'>{record.type}</span>
                ) : null}
                <span>{record.unitCount} credit{record.unitCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </>
      ) : usageRecords.error ? (
        <FetchError error={usageRecords.error} />
      ) : null}
    </div>
  )
}

const InvoicesLoading = () => {
  return (
    <div>
      {[...new Array(2)].map((_, index) => (
        <div className="shadow rounded-sm p-4 w-full bg-white mx-auto border-b-2" key={`loading-${index}`}>
          <div className="animate-pulse flex justify-between w-full">
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
            </div>
            <div className='flex'>
              <div className="mr-2 h-2 bg-slate-300 rounded w-[20px]"></div>
              <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const CurrentUsageLoading = () => {
  return (
    <div>
      <div className='flex items-end mb-1'>
        <span className='h-[29px] w-[20px] bg-slate-300 animate-pulse rounded-md mr-1' />
        <span className='text-xs text-gray-500 font-normal'>credits used</span>
      </div>
      <div className='text-gray-500 flex items-center'>
        Last updated at
        <span className='h-[20px] w-[115px] bg-slate-300 animate-pulse rounded-md ml-1'/>
      </div>
    </div>
  )
}