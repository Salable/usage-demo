'use client'
import React from "react";
import Head from "next/head";
import {Resolver, useForm} from "react-hook-form";
import {useRouter, useSearchParams} from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";

export default function AcceptInvite() {
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  const errors = () => {
    const obj: Record<string, {
      type: string;
      message: string;
    }> = {}
    if (!values.firstName) {
      obj.firstName = {
        type: 'required',
        message: 'First name is required.',
      }
    }
    if (!values.lastName) {
      obj.lastName = {
        type: 'required',
        message: 'Last name is required.',
      }
    }
    if (!values.email) {
      obj.email = {
        type: 'required',
        message: 'Email is required.',
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver });
  const onSubmit = handleSubmit(async (data) => {
    console.log("=== submit")
    try {
      const userResponse = await fetch('/api/accept-invite', {
        method: 'post',
        body: JSON.stringify({...data, token})
      })
      if (userResponse.ok) {
        router.push('/')
      }
    } catch (e) {
      console.log(e)
    }
  });
  return (
    <>
      <div className='max-w-[500px] m-auto'>
        <h1 className='text-3xl mb-4'>Sign up</h1>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <fieldset>
            <input className='p-3 w-full' {...register("firstName")} placeholder="First name"/>
            {errors.firstName && <p className='text-red-600'>{errors.firstName.message}</p>}
          </fieldset>

          <fieldset>
            <input className='p-3 w-full' {...register("lastName")} placeholder="Last name"/>
            {errors.lastName && <p className='text-red-600'>{errors.lastName.message}</p>}
          </fieldset>

          <fieldset>
            <input
              className='p-3 w-full'
              placeholder="Email"
              {...register("email", {
                required: "required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Entered value does not match email format"
                }
              })}
              type="email"
            />
            {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
          </fieldset>

          <fieldset>
            <input type="password" className='p-3 w-full' {...register("password")} placeholder="Password"/>
            {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
          </fieldset>

          <div>
            <button
              className={`p-4 text-white rounded-md leading-none bg-blue-700`}
            >
              {!isSubmitting ? "Sign up" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}