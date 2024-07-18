'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";
import {DBOrganisation} from "@/app/api/organisations/[id]/route";

export default function Dashboard() {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <ToastContainer/>
          <Main/>
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isFetchingInviteLink, setIsFetchingInviteLink] = useState(false);
  const {data: session} = useSWR<Session>(`/api/session`)
  const {data: users, isLoading} = useSWR<User[]>(`/api/organisations/${session?.organisationId}/users`)
  const {data: organisation, isLoading: organisationIsLoading} = useSWR<DBOrganisation>(`/api/organisations/${session?.organisationId}`)
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {!organisationIsLoading && organisation ? <h1 className='text-3xl mb-4'>{organisation.name}</h1> : null}
        <div className='mb-6'>
          {!isLoading && users?.length ? (
            <div>
              {users.filter((u) => u.username).map((user, i) => {
                return (
                  <div className='mb-1 p-2 bg-white rounded-sm shadow' key={user.id}>
                    <div className='flex justify-between'>
                      <p className='mr-2'>{user.username} <span className='text-gray-500 italic text-sm'>({user.email})</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ml-3 w-[20px]">
              <LoadingSpinner/>
            </div>
          )}
        </div>

        {session?.organisationId ? (
          <div className='flex justify-end'>
            <button
              onClick={async () => {
                try {
                  setIsFetchingInviteLink(true)
                  const res = await fetch('/api/tokens', {
                    method: 'POST',
                    body: JSON.stringify({organisationId: session.organisationId})
                  })
                  const data = await res.json() as {token: string}
                  if (!res.ok) {
                    toast.error("Error creating invite link")
                    setIsFetchingInviteLink(false)
                    return
                  }
                  const link = `http://localhost:3000/accept-invite?token=${data.token}`
                  setInviteLink(link)
                  await navigator.clipboard.writeText(link);
                  toast.success("Invite link copied")
                  setIsFetchingInviteLink(false)
                } catch (e) {
                  setIsFetchingInviteLink(false)
                  console.log(e)
                }
              }}
              className={`p-4 text-white rounded-md leading-none bg-blue-700`}
            >{!isFetchingInviteLink ? "Invite user" : <div className='w-[20px]'><LoadingSpinner fill="white"/></div>}
            </button>
          </div>
        ) : null}

        {inviteLink ? (
          <div className='mt-6 p-2 border-2 truncate text-ellipsis overflow-hidden bg-white'>
            <p>{inviteLink}</p>
          </div>
        ) : null}
      </div>
    </>
  )
}