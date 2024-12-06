import {SignInForm} from "@/components/forms/sign-in-form";
import React from "react";

export const metadata = {
  title: 'Sign in',
}

export default async function SignInPage() {
  return (
    <main>
      <div className='max-w-[500px] m-auto font-sans text-sm'>
        <h1 className='text-3xl mb-4'>Sign In</h1>
        <SignInForm/>
      </div>
    </main>
  );
}