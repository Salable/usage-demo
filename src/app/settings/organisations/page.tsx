'use client'
import React, {useState} from "react";
import LoadingSpinner from "@/components/loading-spinner";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import useSWR from "swr";
import {Session, User} from "@/app/settings/subscriptions/[uuid]/page";
import {DBOrganisation} from "@/app/api/organisations/[id]/route";
import {Modal} from "@/components/modal";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export default function Dashboard() {
  return (
    <>
      <Head><title>Salable Seats Demo</title></Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main/>
        </div>
      </main>
    </>
  );
}

const Main = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession} = useSWR<Session>(`/api/session`)
  const {
    data: users,
    mutate: mutateUsers,
    isLoading
  } = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const {
    data: organisation,
    isLoading: organisationIsLoading
  } = useSWR<DBOrganisation>(`/api/organisations/${session?.organisationUuid}`)
  const isModalOpen = searchParams.get("modalOpen")
  if (!isValidatingSession && !isLoading && !session?.uuid) {
    router.push("/")
  }
  return (
    <>
      <div className='max-w-[1000px] m-auto'>
        {!organisationIsLoading && organisation ? <h1 className='text-3xl mb-4'>{organisation.name}</h1> : null}
        <div className='mb-6 bg-white shadow rounded-md'>
          {!isLoading && users?.length ? (
            <div>
              {users.map((user, i) => {
                return (
                  <div className='p-3 rounded-sm border-b-2' key={user.uuid}>
                    <div className='flex justify-between items-center'>
                      <p className='mr-2'>{user.username} <span className='text-gray-500 italic text-sm'>({user.email})</span></p>
                      {user.uuid === session?.uuid ? <div className='p-2 border-2 rounded-md text-gray-500 bg-gray-200 text-xs leading-none'>You</div> : null}
                      {user.username && session && user.uuid !== session.uuid ? (
                        <DeleteUser userUuid={user.uuid} />
                      ) : null}
                      {!user.username && user.email ? (
                        <div>
                          <span className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span>
                          <button
                            className='p-2 border-2 rounded-md text-gray-500 text-xs'
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/tokens?email=${user.email}`)
                                const data = await res.json()
                                if (res.ok) {
                                  const link = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/accept-invite?token=${data.value}`
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
                      ) : null}
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

        {session?.organisationUuid ? (
          <div className='flex justify-end'>
            <button
              onClick={async () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("modalOpen", "true")
                router.push(pathname + '?' + params.toString())
              }}
              className={`p-4 text-white rounded-md leading-none bg-blue-700`}
            >
              Invite user
            </button>
          </div>
        ) : null}

        {isModalOpen ? (
          <Modal />
        ) : null}
      </div>
    </>
  )
}

const DeleteUser = ({userUuid}: {userUuid: string}) => {
  const {data: session} = useSWR<Session>(`/api/session`)
  const {mutate: mutateUsers} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  return (
    <>
      <button
        className='text-red-600 p-2 border-2 rounded-md border-red-600 text-xs'
        onClick={async () => {
          try {
            setIsDeletingUser(true)
            await fetch(`/api/users/${userUuid}`, {
              method: 'DELETE',
            })
            await mutateUsers()
          } catch (e) {
            console.log(e)
          }
        }}
      >
        {!isDeletingUser ? "Delete" : (
          <div className='w-[15px]'><LoadingSpinner fill="#dc2726"/></div>
        )}
      </button>
    </>
  )
}