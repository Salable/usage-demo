'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import {getCheckoutLink} from "@/app/actions/checkout-link";
import {Session} from "@/app/actions/sign-in";
import {redirect} from "next/navigation";
import {toast} from "react-toastify";

export const PlanButton = ({session, planUuid}: {session: Session, planUuid: string, successUrl?: string}) => {
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    let url = null
    setError(null)
    try {
      setIsFetchingUrl(true)
      const response = await getCheckoutLink(session, planUuid)
      if (response.error !== null) {
        setError(response.error)
        setIsFetchingUrl(false)
        return
      }
      url = response.data.checkoutUrl
      setIsFetchingUrl(false)
    } catch (e) {
      setIsFetchingUrl(false)
      console.log(e)
    }
    if (url) {
      (redirect(url))
    } else {
      toast.error('Failed to create checkout link')
    }
  }

  return (
    <div className='flex-col w-full'>
      <button
        className={`p-4 text-white rounded-md leading-none font-bold bg-blue-700 transition w-full flex justify-center ${!isFetchingUrl ? 'hover:bg-blue-900' : ''}`}
        onClick={handleClick}
      >
        {isFetchingUrl ? <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div> : null}
        Purchase plan
      </button>
      {error ? (<div className='mt-1 text-red-600'>{error}</div>) : null}
    </div>
  )
}