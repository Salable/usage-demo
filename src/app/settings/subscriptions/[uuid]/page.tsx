'use client'
import React, {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import {toast, ToastContainer} from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {SalableSubscription} from "@/app/settings/page";
import {AssignUser} from "@/components/assign-user";
import {useRouter, useSearchParams} from "next/navigation";
import {Modal} from "@/components/modal";

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
export type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
}
export type Session = {
  uuid: string;
  organisationUuid: string;
  email: string;
}

export default function SubscriptionView({ params }: { params: { uuid: string } }) {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <ToastContainer />
          <Main uuid={params.uuid} />
        </div>
      </main>
    </>
  );
}

const Main = ({uuid}: {uuid: string}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isModalOpen = searchParams.get("modalOpen")
  const [polling, setPolling] = useState(false)
  const [salableEventUuid, setSalableEventUuid] = useState<string | null>(null)
  const [requests, setRequests] = useState<{ [uuid: string]: SalableRequest }>({})
  const [disableButton, setDisableButton] = useState(false)
  const [updatedLicenseCount, setUpdatedLicenseCount] = useState<number | null>(null)

  const {data: licenseCount, mutate: licenseCountMutate, isLoading: licenseCountLoading} = useSWR<GetLicensesCountResponse>(`/api/licenses/count?subscriptionUuid=${uuid}&status=active`)
  const {data: session, isLoading, isValidating} = useSWR<Session>(`/api/session`)
  const {data: users} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const {data: subscription} = useSWR<SalableSubscription>(`/api/subscriptions/${uuid}`)
  const {data: licenses, mutate: licensesMutate} = useSWR<GetAllLicensesResponse>(`/api/licenses?subscriptionUuid=${uuid}&status=active`)

  const licenseTotalHasChanged = updatedLicenseCount && licenseCount?.count !== updatedLicenseCount

  const fetchSalableEvent = async (eventUuid: string) => {
    try {
      const res = await fetch(`/api/events/${eventUuid}`)
      return await res.json()
    } catch (e) {
      console.log(e)
    }
  }

  const addSeats = async (increment: number) => {
    try {
      setDisableButton(true)
      const addSeats = await fetch(`/api/subscriptions/${uuid}/seats`, {
        method: 'post',
        body: JSON.stringify({increment})
      })
      const data = await addSeats.json()
      if (addSeats.ok) {
        if (data) setSalableEventUuid(data.eventUuid)
        setPolling(true)
      }
      if (data.error) {
        setDisableButton(false)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const removeSeats = async (decrement: number) => {
    try {
      setDisableButton(true)
      const removeSeats = await fetch(`/api/subscriptions/${uuid}/seats`, {
        method: 'put',
        body: JSON.stringify({decrement})
      })
      const data = await removeSeats.json()
      if (removeSeats.ok) {
        if (data) setSalableEventUuid(data.eventUuid)
        setPolling(true)
      }
      if (data.error) {
        toast.error(data.error)
        setDisableButton(false)
        if (licenseCount?.count) setUpdatedLicenseCount(licenseCount?.count)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  useEffect(() => {
    if (!licenseCountLoading && licenseCount?.count && !polling) {
      setUpdatedLicenseCount(licenseCount.count)
    }
  }, [licenseCountLoading]);

  useEffect(() => {
    if (polling && salableEventUuid) {
      const eventPolling = setInterval(async () => {
        const event = await fetchSalableEvent(salableEventUuid)
        if (event) {
          setRequests({
            ...requests,
            [salableEventUuid]: {
              type: event.type,
              status: event.status,
            }
          })
          if (['success', 'failed', 'incomplete'].includes(event.status)) {
            clearInterval(eventPolling)
            setPolling(false)
            await licensesMutate()
            await licenseCountMutate()
            setSalableEventUuid(null)
            setDisableButton(false)
            if (event.status === 'success') {
              toast.success("Subscription successfully updated")
            } else {
              toast.error("Subscription failed to update")
            }
          }
        }
      }, 500);
    }
  }, [salableEventUuid, licenseCountLoading]);

  if (!isValidating && !isLoading && !session?.uuid) {
    router.push("/")
  }
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 text-right">
          <Link href="/settings" className='text-blue-700'>Back to subscriptions</Link>
        </div>
        <div>
          <h1 className='text-3xl mb-6 flex items-center'>Subscription
            {subscription ? <span className='px-2 ml-2 py-2 rounded-md leading-none bg-sky-200 text-sky-500 uppercase text-lg font-bold'>{subscription.plan.displayName}</span> : null}
          </h1>
          {licenses?.data?.length && licenseCount?.count && users?.length ? (
            <div>
              <div className='flex justify-between items-center'>
                <div className='mb-6 flex items-center'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4'>Seats</h2>
                  {disableButton ? (
                    <div className='w-[20px]'><LoadingSpinner/></div>
                  ) : null}
                </div>
              </div>
              <div className='grid grid-cols-[2fr_1fr] gap-6'>
                <div>
                  <div className='flex flex-col rounded-md shadow bg-white'>
                    {licenses?.data?.sort((a, b) => {
                      if (a.granteeId === null) return 1
                      if (b.granteeId === null) return -1
                      const aDate = new Date(a.startTime).getTime()
                      const bDate = new Date(b.startTime).getTime()
                      return aDate - bDate
                    }).map((l, i) => {
                      const assignedUser = users?.find((u) => u.uuid === l.granteeId) ?? null
                      return (
                        <React.Fragment key={`licenses_${i}`}>
                          <AssignUser assignedUser={assignedUser} license={l} subscriptionUuid={uuid} key={`assign_users_${i}`} />
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className='flex items-start justify-between mt-3'>
                    <div>
                      <span className='mr-4 leading-none text-xs text-gray-500'>{licenseCount?.assigned} out of {licenseCount?.count} seats assigned</span>
                    </div>
                  </div>

                  {users?.filter((u) => !u.username && u.email)?.length ? (
                    <div className='mt-6'>
                      <h2 className='text-2xl font-bold text-gray-900 mr-4 mb-6'>Pending invites</h2>

                      <div className='flex flex-col rounded-md shadow bg-white'>
                        {users.filter((u) => !u.username && u.email).map((u, i) => {
                          const licenseUuid = licenses.data.find((l) => l.granteeId === u.uuid )?.uuid
                          return (
                            <div className='p-3 bg-white border-b-2 flex justify-between items-center'>
                              {u.email}
                              <button
                                className='p-2 border-2 rounded-md text-gray-500 text-xs'
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/tokens?email=${u.email}`)
                                    const data = await res.json()
                                    if (res.ok) {
                                      const link = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/accept-invite?token=${data.value}${licenseUuid ? "&licenseUuid="+licenseUuid : ""}`
                                      await navigator.clipboard.writeText(link);
                                    }
                                  } catch (e) {
                                    console.log(e)
                                  }
                                }}
                              >
                                Copy invite link
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                <div className='flex flex-col rounded-md border-gray-300 border-2 p-4'>
                    <div className='text-xl text-center mb-2'>Update seat count</div>
                    <div className='mb-2 text-center'>To change the seat count you will need to update your subscription
                      which will incur a change to your billing.
                    </div>
                    <div className='border-b-2 flex justify-center items-center pb-4'>
                      {updatedLicenseCount && (
                        <>
                          <button
                            className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`}
                            onClick={() => {
                              if (updatedLicenseCount) setUpdatedLicenseCount(updatedLicenseCount - 1);
                            }}>
                            -
                          </button>
                          <div className='px-4 text-xl'>
                            <span>{updatedLicenseCount}</span>
                          </div>
                          <button
                            className={`flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`}
                            onClick={() => {
                              if (updatedLicenseCount) setUpdatedLicenseCount(updatedLicenseCount + 1);
                            }}>
                            +
                          </button>
                        </>
                      )}
                    </div>
                    {subscription && updatedLicenseCount && licenseCount ? (
                      <>
                        <div className='border-b-2 flex justify-between items-end py-4'>
                          <div>
                            <div className='text-gray-500'>Current Plan</div>
                            <div className='text-xl'>{subscription?.plan?.displayName}</div>
                          </div>
                          <div>
                            <div className='text-xl'>£{subscription?.plan?.currencies?.[0].price / 100}
                              <span className='ml-1 text-sm'>seat / {subscription?.plan?.interval}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`items-center ${licenseTotalHasChanged ? "border-b-2 py-4" : "pt-4"} text-right`}>
                          <Price price={subscription.plan?.currencies[0].price} count={licenseCount.count} interval={subscription.plan?.interval} label="Current total"/>
                        </div>
                        {licenseTotalHasChanged ? (
                          <div className='items-center py-4 text-right'>
                            <Price price={subscription.plan.currencies?.[0].price} count={updatedLicenseCount} interval={subscription.plan.interval} label="New total"/>
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {licenseTotalHasChanged ? (
                      <div className='flex justify-end'>
                        <button
                          className={`w-full p-4 text-white rounded-md leading-none ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`}
                          onClick={async () => {
                            if (updatedLicenseCount && licenseCount) {
                              if (updatedLicenseCount > licenseCount.count) {
                                await addSeats(updatedLicenseCount - licenseCount.count)
                              }
                              if (updatedLicenseCount < licenseCount.count) {
                                await removeSeats(licenseCount.count - updatedLicenseCount)
                              }
                            }
                          }}
                          disabled={disableButton}>
                          Update subscription
                        </button>
                      </div>
                    ) : null}
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
      {isModalOpen ? (
        <Modal />
      ) : null}
    </>
  )
}

const Price = ({price, count, interval, label}: { price: number, count: number, interval: string, label: string }) => {
  return (
    <>
      <div className='flex justify-between'>
        <div className='text-xl text-gray-500'>{label}</div>
        <div className='text-xl'>£{(price * count) / 100}
          <span className='ml-1 text-sm'>/ {interval}</span>
        </div>
      </div>
      <div className='text-xs text-gray-500'>
        <span>{count}</span> x
        £{price / 100}
      </div>
    </>
  )
}

type SalableRequest = {
  status: string;
  type: string
}