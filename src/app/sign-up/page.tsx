import {SignUpForm} from "@/components/forms/sign-up-form";

export const metadata = {
  title: 'Sign up'
}

export default function SignUpPage() {
  return (
    <main>
      <div className='max-w-[500px] m-auto font-sans text-sm'>
        <h1 className='text-3xl mb-4'>Sign up</h1>
        <SignUpForm />
      </div>
    </main>
  );
}