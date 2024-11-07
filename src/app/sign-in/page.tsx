'use client'
import React, {useRef, useState} from "react";
import Link from "next/link";
import {LockIcon} from "@/components/icons/lock-icon";
import {TickIcon} from "@/components/icons/tick-icon";
import Head from "next/head";
import Image from "next/image";
import {DownIcon} from "@/components/icons/down-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {useOnClickOutside} from "usehooks-ts";
import {Resolver, useForm} from "react-hook-form";
import {pbkdf2Sync, randomBytes} from "crypto";
import {useRouter} from "next/navigation";
import useSWR from "swr";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";



export default function SignIn() {
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
  password: string;
};

const Main = () => {
  const {data: session, isLoading: isLoadingSession, isValidating: isValidatingSession, mutate} = useSWR<Session>(`/api/session`)
  const { register, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const router = useRouter()
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await fetch('/api/sign-in', {
        method: 'post',
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const data = await res.json()
        setError("root.serverError", {
          type: "400",
          message: data.error
        })
        return
      }
      await mutate()
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  });
  if (session?.uuid) {
    router.push('/')
  }
  return (
    <div className='max-w-[500px] m-auto'>
      <h1 className='text-3xl mb-4'>Sign In</h1>
      <form onSubmit={onSubmit} className='grid gap-3'>
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
          <button className={`p-4 text-white rounded-md leading-none bg-blue-700`}>{!isSubmitting ? "Sign in" : <div className='w-[15px]'><LoadingSpinner fill="white" /></div>}</button>
        </div>

        {errors.root?.serverError ? (
          <div className='bg-red-500 text-white p-2 rounded-sm'>
            {errors.root?.serverError.message}
          </div>
        ) : null}

        <p>Haven't got an account? <Link className='text-blue-500' href="/sign-up">Sign up</Link></p>

      </form>
    </div>
  )
}