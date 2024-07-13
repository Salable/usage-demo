'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Head from "next/head";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";

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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isFetchingInviteLink, setIsFetchingInviteLink] = useState(false);
  const {data: session} = useSWR<Session>(`/api/session`)
  const {data: users, isLoading} = useSWR<User[]>(`/api/organisations/${session?.organisationId}/users`)
  console.log(inviteLink)
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        <div className="mb-4 text-right">
          <Link href="/" className='text-blue-700'>View capabilities</Link>
        </div>
        <h1 className='text-3xl mb-4'>Organisation</h1>
        <div className='mb-6'>
          {!isLoading && users ? (
            <div>
              {users.map((user, i) => {
                return (
                  <div className='mb-1 p-2 bg-white rounded-sm shadow' key={user.id}>
                    <div className='flex justify-between'>
                      <p className='mr-2'>{user.firstName} {user.lastName}</p>
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
                  setInviteLink(`http://localhost:3001/accept-invite?token=${data.token}`)
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
          <p>{inviteLink}</p>
        ): null}
      </div>
    </>
  )
}