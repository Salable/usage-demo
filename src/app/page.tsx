'use client'
import React, {useEffect, useState} from "react";
import useSWR, {SWRConfig} from "swr";

export default function Home() {
  return (
    <SWRConfig value={{fetcher: (url) => fetch(url).then(res => res.json())}}>
      <main className="min-h-screen p-24 bg-gray-50">
        <div className="w-full font-sans text-sm">
          <Main />
        </div>
      </main>
    </SWRConfig>
  );
}

const Main = () => {
  const [polling, setPolling] = useState(false)
  const [salableEventUuid, setSalableEventUuid] = useState<string | null>(null)
  const [requests, setRequests] = useState<{ [uuid: string]: SalableRequest }>({})
  const [disableButton, setDisableButton] = useState(false)

  const { data: licensesData, mutate: mutateLicenses, isLoading: isLicensesLoading } = useSWR<GetAllLicensesResponse>('/api/licenses')
  const { data: licensesCount, mutate: mutateLicensesCount } = useSWR<GetLicensesCountResponse>('/api/licenses/count')

  const fetchSalableEvent = async (eventUuid: string) => {
    try {
      const res = await fetch(`/api/events/${eventUuid}`)
      return await res.json()
    } catch (e) {
      console.log(e)
    }
  }

  const addSeats = async () => {
    setDisableButton(true)
    const addSeats = await fetch('/api/subscriptions/seats', {
      method: 'post'
    })
    const data = await addSeats.json()
    if (data) setSalableEventUuid(data.eventUuid)
    setPolling(true)
  }

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
            await mutateLicenses()
            await mutateLicensesCount()
            setSalableEventUuid(null)
            setDisableButton(false)
          }
        }
      }, 500);
    }
  }, [polling, salableEventUuid]);

  return (
    <div className='max-w-[1000px] m-auto'>
      <div className='mb-4'>
        <button className={`p-3 text-white rounded-md leading-none ${!disableButton ? "bg-blue-700" : "bg-gray-700"}`} onClick={() => addSeats()}
                disabled={disableButton}>{!disableButton ? "Add a seat" : "Adding seat..."}
        </button>
      </div>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          {licensesData?.data.length && licensesCount ? (
            <div>
              <div className='mb-6 flex items-center'>
                <h2 className='text-2xl font-bold text-gray-900 mr-4'>
                  Licenses ({licensesCount.count})
                </h2>
                <span className='mr-4 leading-none'>Assigned: {licensesCount.assigned}</span>
                <span className='leading-none'>Unassigned: {licensesCount.unassigned}</span>
              </div>
              <div className='grid grid-cols-2 rounded-md shadow bg-white'>

                <div className='p-3 font-bold border-b-2'>UUID</div>
                <div className='p-3 font-bold border-b-2'>Grantee ID</div>

                {licensesData.data.sort((a, b) => {
                  const aDate = new Date(a.startTime).getTime()
                  const bDate = new Date(b.startTime).getTime()
                  return aDate - bDate
                }).map((l, i) => (
                  <>
                    <div className='p-3 font-mono border-b-2'>{l.uuid}</div>
                    <div className='p-3 border-b-2'>{l.granteeId}</div>
                  </>
                ))}
              </div>
            </div>
          ) : <p>Loading...</p>}
        </div>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Requests</h2>
            <div className='grid grid-cols-3 rounded-md shadow bg-white'>
              <div className='p-3 font-bold border-b-2'>UUID</div>
              <div className='p-3 font-bold border-b-2'>Type</div>
              <div className='p-3 font-bold border-b-2'>Status</div>

              {Object.keys(requests).length > 0 && Object.keys(requests).map((uuid, i) => (
                <>
                  <div className='p-3 border-b-2 font-mono'>{uuid}</div>
                  <div className='p-3 border-b-2'>{requests[uuid].type}</div>
                  <div className='p-3 border-b-2'>{requests[uuid].status}</div>
                </>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}

type SalableRequest = {
  status: string;
  type: string
}

type GetLicensesCountResponse = {
  assigned: string;
  unassigned: string;
  count: string;
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