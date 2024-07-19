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

const resolver: Resolver<FormValues> = async (values) => {
  const errors = () => {
    const obj: Record<string, {
      type: string;
      message: string;
    }> = {}
    if (!values.username) {
      obj.email = {
        type: 'required',
        message: 'Username is required.',
      }
    }
    if (!values.password) {
      obj.password = {
        type: 'required',
        message: 'Password is required.',
      }
    }
    return obj
  }
  return {
    values: values ?? {},
    errors: errors(),
  };
};

const Main = () => {
  const { register, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver });
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
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  });
  return (
    <div className='max-w-[500px] m-auto'>
      <h1 className='text-3xl mb-4'>Sign In</h1>
      <form onSubmit={onSubmit} className='grid gap-3'>
        <fieldset>
          <input className='p-3 w-full' {...register("username")} placeholder="Username"/>
          {errors.username && <p className='text-red-600'>{errors.username.message}</p>}
        </fieldset>

        <fieldset>
          <input type="password" className='p-3 w-full' {...register("password")} placeholder="Password"/>
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