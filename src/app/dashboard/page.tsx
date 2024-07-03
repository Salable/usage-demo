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
  const [polling, setPolling] = useState(false)
  const [salableEventUuid, setSalableEventUuid] = useState<string | null>(null)
  const [requests, setRequests] = useState<{ [uuid: string]: SalableRequest }>({})
  const [disableButton, setDisableButton] = useState(false)
  const [updatedLicenseCount, setUpdatedLicenseCount] = useState<number | null>(null)

  const {getAllLicenses, getLicensesCount, getSubscription} = useSalableContext()
  const subscription = getSubscription?.data

  const licenseTotalHasChanged = updatedLicenseCount && getLicensesCount?.data && getLicensesCount?.data.count !== updatedLicenseCount

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
      const addSeats = await fetch('/api/subscriptions/seats', {
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
      const removeSeats = await fetch('/api/subscriptions/seats', {
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
        if (getLicensesCount?.data?.count) setUpdatedLicenseCount(getLicensesCount?.data?.count)
      }
    } catch (e) {
      setDisableButton(false)
      console.log(e)
    }
  }

  useEffect(() => {
    if (!getLicensesCount?.isLoading && getLicensesCount?.data?.count && !polling) {
      setUpdatedLicenseCount(getLicensesCount?.data.count)
    }
  }, [getLicensesCount?.isLoading]);

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
            await getAllLicenses?.mutate()
            await getLicensesCount?.mutate()
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
  }, [salableEventUuid, getLicensesCount?.isLoading]);

  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 text-right">
          <Link href="/" className='text-blue-700'>Logged in user</Link>
        </div>
        <div>
          {getAllLicenses?.data?.data?.length && getLicensesCount?.data?.count ? (
            <div>
              <div className='flex justify-between items-center'>
                <div className='mb-6 flex items-center'>
                  <h2 className='text-2xl font-bold text-gray-900 mr-4'>
                    Users
                  </h2>
                  {disableButton ? (
                    <div className='w-[20px]'><LoadingSpinner/></div>
                  ) : null}
                </div>
              </div>
              <div className='grid grid-cols-[2fr_1fr] gap-6'>
                <div>
                  <div className='flex flex-col rounded-md shadow bg-white'>
                    {getAllLicenses?.data?.data?.sort((a, b) => {
                      if (a.granteeId === null) return 1
                      if (b.granteeId === null) return -1
                      const aDate = new Date(a.startTime).getTime()
                      const bDate = new Date(b.startTime).getTime()
                      return aDate - bDate
                    }).map((l, i) => {
                      const assignedUser = users.find((u) => u.id === l.granteeId) ?? null
                      return (
                        <React.Fragment key={`licenses_${i}`}>
                          <div className='border-b-2'>
                            <AssignSeat licenseUuid={l.uuid} assignedUser={assignedUser}/>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className='flex items-start justify-between mt-3'>
                    <div>
                  <span
                    className='mr-4 leading-none text-xs text-gray-500'>{getLicensesCount.data.assigned} out of {getLicensesCount.data.count} seats assigned</span>
                    </div>
                  </div>
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
                    {subscription && updatedLicenseCount && getLicensesCount.data && (
                      <>
                        <div className={`items-center ${licenseTotalHasChanged ? "border-b-2 py-4" : "pt-4"} text-right`}>
                          <Price price={subscription?.plan?.currencies?.[0].price} count={getLicensesCount.data.count}
                                 interval={subscription?.plan?.interval} label="Current total"/>
                        </div>
                        {licenseTotalHasChanged && (
                          <div className='items-center py-4 text-right'>
                            <Price price={subscription?.plan?.currencies?.[0].price} count={updatedLicenseCount}
                                   interval={subscription?.plan.interval} label="New total"/>
                          </div>
                        )}
                      </>
                    )}

                    {licenseTotalHasChanged && (
                      <div className='flex justify-end'>
                        <button
                          className={`w-full p-4 text-white rounded-md leading-none ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`}
                          onClick={async () => {
                            if (updatedLicenseCount && getLicensesCount?.data) {
                              if (updatedLicenseCount > getLicensesCount.data.count) {
                                await addSeats(updatedLicenseCount - getLicensesCount.data.count)
                              }
                              if (updatedLicenseCount < getLicensesCount.data.count) {
                                await removeSeats(getLicensesCount.data.count - updatedLicenseCount)
                              }
                            }
                          }}
                          disabled={disableButton}>
                          Update subscription
                        </button>
                      </div>
                    )}
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

const AssignSeat = ({licenseUuid, assignedUser}: { licenseUuid: string; assignedUser: User | null }) => {
  const [showUsers, setShowUsers] = useState<boolean>(false)
  const ref = useRef(null)
  const clickOutside = () => {
    setShowUsers(false)
  }
  useOnClickOutside(ref, clickOutside)

  const {getAllLicenses, getLicensesCount} = useSalableContext()
  const granteeIds = new Set(getAllLicenses?.data?.data.map((l) => l.granteeId))
  return (
    <div>
      <div className='p-2 flex justify-between'>
        <div ref={ref}>
          <div className='flex items-center p-2 cursor-pointer' onClick={() => setShowUsers(!showUsers)}>
            <div className='rounded-full mr-3'>
              <Image src={assignedUser ? assignedUser.avatar : '/avatars/default-avatar.png'} alt='avatar' width={40}
                     height={40} className='rounded-full'/>
            </div>
            <div>
              <div>{assignedUser ? assignedUser.name : "Assign user"}</div>
              {assignedUser && <div className='text-xs text-gray-500'>{assignedUser.email}</div>}
            </div>
          </div>
          {showUsers && (
            <div className='absolute border-2 bg-white'>
              {users.filter((u) => !granteeIds.has(u.id)).map((user, i) => (
                <div className='flex items-center p-2 cursor-pointer hover:bg-gray-200' key={`${i}_assign_users`}
                     onClick={async () => {
                       await fetch('/api/licenses', {
                         method: 'PUT',
                         body: JSON.stringify([{
                           uuid: licenseUuid,
                           granteeId: user.id
                         }])
                       })
                       await getAllLicenses?.mutate()
                       await getLicensesCount?.mutate()
                       setShowUsers(false)
                     }}>
                  <div className='rounded-full mr-2'>
                    <Image src={user.avatar} alt='avatar' width={24} height={24} className='rounded-full'/>
                  </div>
                  <div>{user.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='flex items-center'>
          {assignedUser ? (
            <button className='p-2 border-2 rounded-md text-gray-500 text-xs' onClick={async () => {
              try {
                const updateLicenses = await fetch('/api/licenses', {
                  method: 'PUT',
                  body: JSON.stringify([{
                    uuid: licenseUuid,
                    granteeId: null
                  }])
                })
                await getAllLicenses?.mutate()
                await getLicensesCount?.mutate()
              } catch (e) {
                console.log(e)
              }
            }}> Unassign user</button>
          ) : null}
        </div>
      </div>
    </div>
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