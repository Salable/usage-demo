import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";
import {appBaseUrl, salableApiBaseUrl, salableApiKeyPlansRead} from "@/app/constants";

export const PlanButton = ({uuid, successUrl = appBaseUrl}: {uuid: string, successUrl?: string}) => {
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
              successUrl,
              cancelUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/usage`,
            })
            const urlFetch = await fetch(`${salableApiBaseUrl}/plans/${uuid}/checkoutlink?${params.toString()}`, {
              headers: {'x-api-key': salableApiKeyPlansRead}
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
      {!isFetchingUrl ? "Purchase plan" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
    </button>
  )
}