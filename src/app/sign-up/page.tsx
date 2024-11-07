'use client'
import React from "react";
import Head from "next/head";
import {Resolver, useForm} from "react-hook-form";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/loading-spinner";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {appBaseUrl, salableApiBaseUrl, salableApiKeyPlansRead} from "@/app/constants";

export default function SignUp() {
  return (
    <>
      <Head>
        <title>Salable Seats Demo</title>
      </Head>
      <main>
        <div className="w-full font-sans text-sm">
          <Main />
        </div>
      </main>
    </>
  );
}

type FormValues = {
  username: string;
  email: string;
  password: string;
};

const Main = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planUuid = searchParams.get('planUuid')
  const successUrl = searchParams.get('successUrl')
  const {data: session,} = useSWR<Session>(`/api/session`)
  const { register, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const onSubmit = handleSubmit(async (data) => {
    try {
      const userResponse = await fetch('/api/sign-up', {
        method: 'post',
        body: JSON.stringify(data)
      })
      if (!userResponse.ok) {
        const data = await userResponse.json()
        setError("root.serverError", {
          type: "400",
          message: data.error
        })
        return
      }
      if (userResponse.ok && planUuid) {
        const user = await userResponse.json()
        const params = new URLSearchParams({
          customerEmail: user.email,
          granteeId: user.uuid,
          member: user.organisationUuid,
          successUrl: successUrl ?? appBaseUrl,
          cancelUrl: `${appBaseUrl}/cancel`,
        })
        const urlFetch = await fetch(`${salableApiBaseUrl}/plans/${planUuid}/checkoutlink?${params.toString()}`, {
          headers: {'x-api-key': salableApiKeyPlansRead}
        })
        const data = await urlFetch.json()
        router.push(data.checkoutUrl)
      } else {
        router.push('/')
      }
    } catch (e) {
      console.log(e)
    }
  });
  if (session?.uuid) {
    router.push('/')
  }
  return (
    <>
      <div className='max-w-[500px] m-auto'>
        <h1 className='text-3xl mb-4'>Sign up</h1>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <fieldset>
            <input className='p-3 w-full' {...register("email", {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Please enter a valid email address",
              },
              required: {
                value: true,
                message: 'Email is required'
              },
            })} placeholder="Email"/>
            {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
          </fieldset>

          <fieldset>
            <input className='p-3 w-full' {...register("username", {
              required: {
                value: true,
                message: 'Username is required'
              },
            })} placeholder="Username"/>
            {errors.username && <p className='text-red-600'>{errors.username.message}</p>}
          </fieldset>

          <fieldset>
            <input type="password" className='p-3 w-full' {...register("password", {
              required: {
                value: true,
                message: 'Password is required'
              },
            })} placeholder="Password"/>
            {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
          </fieldset>

          <div className='mb-4'>
            <button className={`p-4 text-white rounded-md leading-none bg-blue-700`}>
              {!isSubmitting ? "Sign up" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
            </button>
          </div>

          {errors.root?.serverError ? (
            <div className='bg-red-500 text-white p-2 rounded-sm'>
              {errors.root?.serverError.message}
            </div>
          ) : null}

          <p>Already got an account? <Link className='text-blue-500' href="/sign-in">Sign in</Link></p>
        </form>
      </div>
    </>
  )
}