'use client'
import React, {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {useRouter, useSearchParams} from "next/navigation";
import {SalableSubscription} from "@/app/api/subscriptions/route";
import {
  appBaseUrl,
  salableBasicUsagePlanUuid,
  salableProUsagePlanUuid
} from "@/app/constants";
import {format} from "date-fns";

export type User = {
  uuid: string;
  username: string;
  email: string;
}
export type GetLicensesCountResponse = {
  assigned: number;
  unassigned: number;
  count: number;
}
export type GetAllLicensesResponse = {
  first: string;
  last: string;
  data: License[]
}
export type GetAllUsageRecordsResponse = {
  first: string;
  last: string;
  data: {
    unitCount: number;
    type: string;
    recordedAt: string;
    resetAt: string;
    createdAt: string;
    updatedAt: string,
  }[]
}
export type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
  productUuid: string;
  subscriptionUuid: string;
  planUuid: string;
  status: string;
}
export type Session = {
  uuid: string;
  email: string;
}

export default function SubscriptionView({ params }: { params: { uuid: string } }) {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main uuid={params.uuid} />
        </div>
      </main>
    </>
  );
}

const Main = ({uuid}: {uuid: string}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPolling, setIsPolling] = useState(false)
  const [salableEventUuid, setSalableEventUuid] = useState<string | null>(null)
  const [disableButton, setDisableButton] = useState(false)
  const [isCancellingSubscription, setIsCancellingSubscription] = useState<boolean>(false)
  const [isReactivatingSubscription, setIsReactivatingSubscription] = useState<boolean>(false)
  const [pollSubscription, setPollSubscription] = useState<boolean>(false)
  const [isChangingSubscription, setIsChangingSubscription] = useState<boolean>(false)
  const [changingPlanUuid, setChangingPlanUuid] = useState<string | null>(null)

  const {data: session, isLoading, isValidating} = useSWR<Session>(`/api/session`)
  const {data: subscription, mutate: mutateSubscription, isValidating: isValidatingSubscription, isLoading: isLoadingSubscription } = useSWR<SalableSubscription>(`/api/subscriptions/${uuid}`)
  const {data: invoices, mutate: mutateInvoices, isLoading: isLoadingInvoices,  isValidating: isValidatingInvoices} = useSWR<{
    first: string;
    last: string;
    hasMore: boolean;
    data: {
      created: number;
      effective_at: number;
      automatically_finalizes_at: number;
      hosted_invoice_url: string;
      invoice_pdf: string;
      lines: {
        data: {
          amount: number;
          price: { unit_amount: 1 }
          quantity: number;
        }[]
      }
    }[]
  }>(`/api/subscriptions/${uuid}/invoices`)
  const {data: currentUsage} = useSWR<{unitCount: number; updatedAt: string}>(`/api/usage/current?granteeId=${session?.uuid}&planUuid=${subscription?.planUuid}`)
  const {data: usageRecords, isLoading: isLoadingUsageRecords, isValidating: isValidatingUsageRecords, mutate: mutateUsageRecords} = useSWR<GetAllUsageRecordsResponse>(`/api/usage?subscriptionUuid=${uuid}`)

  const creditCost = subscription?.planUuid === salableProUsagePlanUuid ? 200 : 100

  const cancelSubscription = async () => {
    try {
      setIsCancellingSubscription(true)
      setDisableButton(true)
      const cancel = await fetch(`/api/subscriptions/${uuid}`, {
        method: 'DELETE',
      })
      if (cancel.ok) {
        setIsPolling(true)
        setPollSubscription(true)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  const reactivateSubscription = async () => {
    try {
      setIsReactivatingSubscription(true)
      setDisableButton(true)
      const reactivate = await fetch(`/api/subscriptions/${uuid}/reactivate`, {
        method: 'PUT',
      })
      if (reactivate.ok) {
        setIsPolling(true)
        setPollSubscription(true)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  const changeSubscription = async (planUuid: string) => {
    try {
      setIsChangingSubscription(true)
      setDisableButton(true)
      const change = await fetch(`/api/subscriptions/${uuid}/change`, {
        method: 'PUT',
        body: JSON.stringify({planUuid})
      })
      if (change.ok) {
        setIsPolling(true)
        setChangingPlanUuid(planUuid)
      } else {
        setDisableButton(false)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  useEffect(() => {
    if (isPolling) {
      if (pollSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            const countRes = await fetch(`/api/subscriptions/${uuid}`)
            const data = await countRes.json()
            if (data?.status === 'CANCELED' || data?.cancelAtPeriodEnd) {
              clearInterval(subscriptionPolling)
              setIsPolling(false)
              await mutateSubscription()
              await mutateInvoices()
              await mutateUsageRecords()
              setDisableButton(false)
              setIsCancellingSubscription(false)
              setPollSubscription(false)
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
      if (isReactivatingSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            const countRes = await fetch(`/api/subscriptions/${uuid}`)
            const data = await countRes.json()
            if (!data?.cancelAtPeriodEnd) {
              clearInterval(subscriptionPolling)
              setIsPolling(false)
              await mutateSubscription()
              setDisableButton(false)
              setIsReactivatingSubscription(false)
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
      if (isChangingSubscription) {
        const subscriptionPolling = setInterval(async () => {
          try {
            const res = await fetch(`/api/licenses?planUuid=${changingPlanUuid}&status=active&granteeId=${session?.uuid}`)
            const data = await res.json() as GetAllLicensesResponse
            if (data?.data.length) {
              clearInterval(subscriptionPolling)
              setIsPolling(false)
              router.push(`/settings/subscriptions/${data?.data[0].subscriptionUuid}`)
            }
          } catch (e) {
            console.log(e)
          }
        }, 500);
      }
    }
  }, [salableEventUuid, pollSubscription, changingPlanUuid, isReactivatingSubscription]);

  if (!isValidating && !isLoading && !session?.uuid) {
    router.push("/")
  }
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div>
          {(!isValidatingSubscription && !isLoadingSubscription) && (!isValidatingInvoices && !isLoadingInvoices) && (!isValidatingUsageRecords && !isLoadingUsageRecords) ? (
            <div>
              <h1 className='text-3xl mb-6 flex items-center'>Subscription
                {subscription?.status === 'ACTIVE' ? <span
                  className='px-2 ml-2 py-2 rounded-md leading-none bg-sky-200 text-sky-500 uppercase text-lg font-bold'>{subscription.plan.displayName}</span> : null}
                {subscription?.status === 'CANCELED' ? <span
                  className='px-2 ml-2 py-2 rounded-md leading-none bg-red-200 text-red-500 uppercase text-lg font-bold'>{subscription.status}</span> : null}
              </h1>

              {subscription?.status === 'CANCELED' ? (
                <div>
                  <div className='flex justify-between items-end py-4 mb-3'>
                    <div>
                      <div className='text-gray-500'>Plan</div>
                      <div className='text-xl'>{subscription?.plan?.displayName}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {subscription?.status !== 'CANCELED' && currentUsage?.unitCount !== undefined ? (
                <>
                  <div className='mb-6 flex justify-between items-center'>
                    <div>
                      <span
                        className='text-2xl font-bold text-gray-900 mr-4'>£{(currentUsage?.unitCount * creditCost) / 100}
                        <span className='text-xs text-gray-500 font-normal'> credits spent</span>
                      </span>
                      <div className='text-gray-500'>Last updated
                        at {format(currentUsage.updatedAt, 'd LLL yyy H:mm')}</div>
                    </div>
                  </div>
                  <div>
                    <div className='flex'>
                      {!subscription?.cancelAtPeriodEnd ? (
                        <>
                          <button
                            className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center justify-center mr-2`}
                            onClick={async () => {
                              await changeSubscription(subscription?.planUuid === salableProUsagePlanUuid ? salableBasicUsagePlanUuid : salableProUsagePlanUuid)
                            }}
                            disabled={disableButton}
                          >
                            {isChangingSubscription ? (
                              <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>
                            ) : ''}
                            Change to {subscription?.planUuid === salableProUsagePlanUuid ? "Basic" : "Pro"}
                          </button>
                          <button
                            className={`p-4 rounded-md leading-none text-white bg-red-600 flex items-center justify-center`}
                            onClick={async () => {
                              await cancelSubscription()
                            }}
                            disabled={disableButton}>
                            {isCancellingSubscription ? (
                              <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
                            Cancel subscription
                          </button>
                        </>
                      ) : (
                        <div className='p-3 bg-gray-200 rounded-md max-w-[400px]'>
                          <p className='mb-2'>Your subscription is set to cancel at the end of the month. If you'd like
                            revert this change you can reactivate your subscription below.</p>
                          <button
                            className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center justify-center mr-2`}
                            onClick={async () => {
                              await reactivateSubscription()
                            }}
                          >
                            {isReactivatingSubscription ? (
                              <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
                            Reactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              {usageRecords && usageRecords.data?.length > 0 ? (
                <div className='mt-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>Usage records</h2>
                  <div className='mt-3 rounded-sm bg-white'>
                    {usageRecords?.data.map((record, index) => {
                      return (
                        <div className='border-b-2 p-3 flex justify-between items-center' key={`usage-record-${index}`}>
                          <div>
                            {record.type === 'current' ? (
                              <>
                                {format(new Date(record.createdAt), "d LLL yyy")} - {format(new Date(record.resetAt), "d LLL yyy")}
                              </>
                            ) : (
                              <>
                                {format(new Date(record.createdAt), "d LLL yyy")} - {format(new Date(record.recordedAt), "d LLL yyy")}
                              </>
                            )}
                          </div>
                          <div className='flex items-center'>
                            {record.type === 'current' ? (
                              <span
                                className='mr-2 p-1 leading-none uppercase rounded-sm bg-green-100 text-green-700 text-xs font-bold'>{record.type}</span>
                            ) : null}
                            <span>{record.unitCount} credits</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {invoices && invoices.data?.length > 0 ? (
                <div className='mt-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>Invoices</h2>
                  <div className='mt-3 rounded-sm bg-white'>
                    {invoices?.data.sort((a, b) => a.created + b.created).map((invoice, index) => {
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
                            <span
                              className='mr-2'>£{(invoice.lines.data[0].quantity * invoice.lines.data[0].price.unit_amount) / 100}</span>
                            {invoice.automatically_finalizes_at && invoice.lines.data[0].price.unit_amount ? (
                              <>
                                <span
                                  className='p-1 leading-none uppercase rounded-sm bg-gray-200 text-gray-500 text-xs font-bold'>DRAFT</span>
                              </>
                            ) : null}
                            {invoice.hosted_invoice_url ? (
                              <Link className='text-blue-700' href={invoice.hosted_invoice_url}>View</Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <LoadingSkeleton/>
          )}
        </div>
      </div>
    </>
  )
}

const LoadingSkeleton = () => {
  return (
    <div>
      <div>
        <div className="animate-pulse flex items-center">
          <div className="mr-2 h-2 bg-slate-300 rounded w-[162px]"></div>
          <div className="mr-2 h-[34px] w-[95px] bg-slate-300 rounded-md"></div>
        </div>
      </div>

      <div className='mt-6 animate-pulse'>
        <div className="h-2 mb-2 bg-slate-300 rounded w-[75px]"></div>
        <div className="h-2 bg-slate-300 rounded w-[200px]"></div>
        <div className='flex items-center mt-6'>
          <div className="mr-2 h-[46px] w-[100px] bg-slate-300 rounded-md"></div>
          <div className="mr-2 h-[46px] w-[160px] bg-slate-300 rounded-md"></div>
        </div>
      </div>

      <div className='mt-6'>
        <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

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

      <div className='mt-6'>
        <div className="mb-4 h-2 bg-slate-300 rounded w-[100px]"></div>

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
    </div>
  )
}