import React, {useRef, useState} from "react";
import {
  GetAllLicensesResponse,
  GetLicensesCountResponse, License,
  Session,
  User
} from "@/app/settings/subscriptions/[uuid]/page";
import useSWR from "swr";
import {useOnClickOutside} from "usehooks-ts";
import {toast} from "react-toastify";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export const AssignUser = (
  {assignedUser, subscriptionUuid, license}: {assignedUser: User | null, subscriptionUuid: string; license: License}
) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const {data: session} = useSWR<Session>(`/api/session`)
  const {data: users, isLoading: usersIsLoading} = useSWR<User[]>(`/api/organisations/${session?.organisationUuid}/users`)
  const {data: licenses, mutate: licensesMutate} = useSWR<GetAllLicensesResponse>(`/api/licenses?subscriptionUuid=${subscriptionUuid}&status=active`)
  const {data: licenseCount, mutate: licenseCountMutate, isLoading: licenseCountLoading} = useSWR<GetLicensesCountResponse>(`/api/licenses/count?subscriptionUuid=${subscriptionUuid}&status=active`)
  const granteeIds = new Set(licenses?.data.map((l) => l.granteeId))
  const ref = useRef(null)
  const clickOutside = () => {
    setShowUsers(false)
  }
  useOnClickOutside(ref, clickOutside)
  const isPending = assignedUser && !assignedUser.username

  const nonLicensedUsers = users?.filter((u) => !granteeIds.has(u.uuid) && u.username)

  return (
    <div className={`border-b-2`} ref={ref}>
      <div className='p-3 flex justify-between'>
        <div>
          <div className='flex items-center cursor-pointer' onClick={() => setShowUsers(!showUsers)}>
            <div className='rounded-full mr-3'>
              <div className='w-[38px] h-[38px] cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                <span>{!isPending ? assignedUser?.username?.[0].toUpperCase() : "?"}</span>
              </div>
            </div>
            <div>
              {assignedUser?.username ? (
                <div>{assignedUser.username}</div>
              ) : null}
              {!assignedUser && nonLicensedUsers?.length ? (
                <div>Assign Seat</div>
              ) : null}
              {assignedUser ? <div className='text-xs text-gray-500'>{assignedUser.email}</div> : null}
            </div>
          </div>
          {!usersIsLoading && showUsers && users?.length ? (
            <div className='absolute border-2 bg-white'>
              {nonLicensedUsers?.map((user, i) => (
                <div
                  className='flex items-center p-2 cursor-pointer hover:bg-gray-200' key={`${i}_assign_users`}
                  onClick={async () => {
                   await fetch('/api/licenses', {
                     method: 'PUT',
                     body: JSON.stringify([{
                       uuid: license.uuid,
                       granteeId: user.uuid
                     }])
                   })
                   await licensesMutate()
                   await licenseCountMutate()
                   setShowUsers(false)
                  }}
                >
                  <div className='rounded-full mr-3'>
                    <div className='w-[24px] h-[24px] text-sm cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                      <span className='text-xs'>{user.username?.[0].toUpperCase()}</span>
                    </div>
                  </div>
                  <div>{user.username}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className='flex items-center'>
          {isPending ? (
            <div className='mb-1'><span className='p-1 bg-yellow-300 text-xs rounded-sm mr-2 uppercase font-bold'>Pending</span></div>
          ) : null}
          {assignedUser?.uuid === session?.uuid ? <div className='p-2 border-2 rounded-md text-gray-500 bg-gray-200 text-xs leading-none'>You</div> : null}
          {assignedUser?.uuid && assignedUser?.uuid !== session?.uuid ? (
            <button className='p-2 border-2 rounded-md text-gray-500 text-xs'
              onClick={async () => {
                try {
                  await fetch('/api/licenses', {
                    method: 'PUT',
                    body: JSON.stringify([{
                      uuid: license.uuid,
                      granteeId: null
                    }])
                  })
                  await licensesMutate()
                  await licenseCountMutate()
                } catch (e) {
                  console.log(e)
                }
              }}> Unassign user</button>
          ) : null}
          {!assignedUser ? (
            <button className='p-2 border-2 rounded-md text-gray-500 text-xs'
                    onClick={async () => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.set("modalOpen", "true")
                      params.set("licenseUuid", license.uuid)
                      params.set("subscriptionUuid", subscriptionUuid)
                      router.push(pathname + '?' + params.toString())
                    }}
            > Invite user</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}