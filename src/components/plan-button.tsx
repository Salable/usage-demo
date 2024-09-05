import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";

export const PlanButton = ({uuid}: {uuid: string}) => {
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const router = useRouter()
  return (
    <button
      className={`p-4 text-white rounded-md leading-none bg-blue-700 w-full flex justify-center`}
      onClick={async () => {
        if (session) {
          try {
            setIsFetchingUrl(true)
            const params = new URLSearchParams({
              customerEmail: session.email,
              granteeId: session.uuid,
              member: session.email,
              successUrl: process.env.NEXT_PUBLIC_APP_BASE_URL as string,
              cancelUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/cancel`,
            })
            const urlFetch = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/plans/${uuid}/checkoutlink?${params.toString()}`, {
              headers: {'x-api-key': process.env.NEXT_PUBLIC_SALABLE_API_KEY_PLANS_READ as string}
            })
            const data = await urlFetch.json()
            router.push(data.checkoutUrl)
            setIsFetchingUrl(false)
          } catch (e) {
            setIsFetchingUrl(false)
            console.log(e)
          }
        }
      }}
    >
      {!isFetchingUrl ? "Purchase team plan" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
    </button>
  )
}