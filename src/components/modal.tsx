import LoadingSpinner from "@/components/loading-spinner";
import React, {useRef, useState} from "react";
import {Resolver, useForm} from "react-hook-form";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useOnClickOutside} from "usehooks-ts";
import useSWR from "swr";
import {
  GetAllLicensesResponse,
  GetLicensesCountResponse,
  Session,
  User
} from "@/app/settings/subscriptions/[uuid]/page";

type ModalFormValues = {
  email: string;
};
const resolver: Resolver<ModalFormValues> = async (values) => {
  const errors = () => {
    const obj: Record<string, {
      type: string;
      message: string;
    }> = {}
    if (!values.email) {
      obj.email = {
        type: 'required',
        message: 'Email is required.',
      }
    }
    return obj
  }
  return {
    values: values ?? {},
    errors: errors(),
  };
};

export const Modal = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const licenseUuid = searchParams.get("licenseUuid")
  const subscriptionUuid = searchParams.get("subscriptionUuid")
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<ModalFormValues>({ resolver });
  const [serverError, setServerError] = useState<string | null>(null)
  const ref = useRef(null)
  const clickOutside = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("modalOpen")
    params.delete("licenseUuid")
    params.delete("subscriptionUuid")
    router.push(pathname + '?' + params.toString())
  }
  useOnClickOutside(ref, clickOutside)

  const {data: session} = useSWR<Session>(`/api/session`)
  const {mutate: mutateUsers} = useSWR<User[]>(`/api/organisations/${session?.organisationId}/users`)
  const {mutate: mutateLicenses} = useSWR<GetAllLicensesResponse>(`/api/licenses?subscriptionUuid=${subscriptionUuid}&status=active`)
  const {mutate: mutateLicenseCount} = useSWR<GetLicensesCountResponse>(`/api/licenses/count?subscriptionUuid=${subscriptionUuid}&status=active`)

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        body: JSON.stringify({
          organisationId: session?.organisationId,
          email: values.email,
          licenseUuid
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error)
        return
      }
      const link = `http://localhost:3000/accept-invite?token=${data.token}`
      await navigator.clipboard.writeText(link);
      const params = new URLSearchParams(searchParams.toString())
      params.delete("modalOpen")
      params.delete("licenseUuid")
      params.delete("subscriptionUuid")
      router.push(pathname + '?' + params.toString())
      await mutateUsers()
      await mutateLicenses()
      await mutateLicenseCount()
    } catch (e) {
      console.log(e)
    }
  })

  return (
    <div
      className='bg-gray-500/[.6] p-10 fixed top-0 left-0 w-full h-full flex justify-center items-center'
    >
      <div className='w-[500px] bg-white m-auto rounded-sm shadow p-6' ref={ref}>
        <div className='mb-4'>
          <p>Submit the email of the user you want to invite to the seat.</p>
        </div>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <fieldset>
            <input type="email" className='p-3 w-full border-2' {...register("email")} placeholder="email" onChange={() => {
              setServerError(null)
            }}/>
            {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
          </fieldset>

          <div>
            <button className={`p-4 text-white rounded-md leading-none bg-blue-700`}>{!isSubmitting ? "Invite user" :
              <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}</button>
          </div>
          {serverError && !errors.email ? (
            <div className='bg-red-500 text-white p-2 rounded-sm'>
              {serverError}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )
}