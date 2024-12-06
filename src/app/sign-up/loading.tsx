import React from "react";

export default function Loading() {
  return (
    <div className='max-w-[500px] mx-auto text-sm'>
      <h1 className='text-3xl mb-4'>Sign Up</h1>

      {[...new Array(3)].map((_, index) => (
        <div className="rounded-sm p-4 w-full mx-auto mb-3 bg-slate-300" key={`loading-${index}`}>
          <div className="animate-pulse flex w-full">
            <div className="flex-1 space-y-6 py-1">
              <div className="flex justify-between">
                <div className='flex'>
                  <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                </div>
                <div className='flex'>
                  <div className="mr-2 h-2 bg-slate-300 rounded w-[100px]"></div>
                  <div className="h-2 bg-slate-300 rounded w-[50px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className='h-[46px] w-[75px] bg-slate-300 rounded-md'></div>
    </div>
  )
}