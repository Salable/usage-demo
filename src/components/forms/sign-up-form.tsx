'use client'
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import React from "react";
import {useForm} from "react-hook-form";
import {signUp} from "@/app/actions/sign-up";
import {useSearchParams} from "next/navigation";

export const SignUpForm = () => {
  const searchParams = useSearchParams()
  const planUuid = searchParams.get('planUuid')
  const { register, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<{
    username: string;
    email: string;
    password: string;
  }>();
  const onSubmit = handleSubmit(async (data) => {
    const signInAction = await signUp(data, planUuid)
    if (signInAction?.error) {
      setError("root.serverError", {
        type: "400",
        message: signInAction.error
      })
    }
  });
  return (
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
        <button className={`p-4 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-900 transition`}>
          {!isSubmitting ? "Sign up" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
        </button>
      </div>

      {errors.root?.serverError ? (
        <div className='bg-red-500 text-white p-2 rounded-sm'>
          {errors.root?.serverError.message}
        </div>
      ) : null}

      <p>Already got an account? <Link className='text-blue-700 hover:underline' href="/sign-in">Sign in</Link></p>
    </form>
  )
}