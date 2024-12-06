'use client'
import Link from "next/link";
import {useRef, useState} from "react";
import {useOnClickOutside} from "usehooks-ts";
import {destroySession} from "@/app/actions/sessions";
import {useRouter} from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";

export type User = {
  uuid: string;
  username: string;
  email: string;
}

export const Dropdown = ({user}: {user: User | null}) => {
  const router = useRouter();
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef(null);
  const clickOutside = () => {
    setDropDownOpen(false)
  }
  useOnClickOutside(ref, clickOutside)

  return (
    <>
      {user?.username ? (
        <div className={`relative hover:bg-white bg-white rounded-br-none`}>
          <button
            className='w-[38px] h-[38px] cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'
            onClick={() => setDropDownOpen(true)}
          >
            <span>{user.username[0].toUpperCase()}</span>
          </button>
          {dropDownOpen && (
            <div ref={ref} className='absolute flex flex-col right-0 top-[45px] bg-white width-max-content text-right w-[200px] rounded-sm shadow z-10'>
              <div className='p-3 block f-full border-b text-sm text-center'>Hello, {user.username}</div>
              <Link className='p-3 block f-full border-b hover:bg-gray-50 text-sm' href={'/settings/subscriptions'} onClick={() => setDropDownOpen(false)}>Subscriptions</Link>
              <Link className='p-3 block f-full border-b hover:bg-gray-50 text-sm' href={'/pricing'} onClick={() => setDropDownOpen(false)}>Pricing</Link>
              <button className='p-3 block f-full text-right hover:bg-gray-50 text-sm' onClick={async () => {
                try {
                  setLoggingOut(true)
                  await destroySession()
                  router.push('/sign-in')
                  setLoggingOut(false)
                  setDropDownOpen(false)
                } catch (e) {
                  console.log(e)
                }
              }}>{!loggingOut ? "Sign out" :
                <div className='w-[15px]'><LoadingSpinner fill="#1e4fd8"/></div>}</button>
            </div>
          )}
        </div>
      ) : (
        <Link className='p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-900 transition w-full text-center text-sm' href="/sign-in">Sign in</Link>
      )}
    </>
  )
}