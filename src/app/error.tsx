'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='max-w-[1000px] mx-auto'>
      <h2 className='text-3xl'>Something went wrong!</h2>
      <button
        className='p-4 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-900 transition flex items-center justify-center mr-2 mt-6'
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}