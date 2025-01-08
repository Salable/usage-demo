export const CurrentUsageLoading = () => {
  return (
    <div>
      <div className='flex items-end mb-1'>
        <span className='h-[29px] w-[20px] bg-slate-300 animate-pulse rounded-md mr-1' />
        <span className='text-xs text-gray-500 font-normal'>credits used</span>
      </div>
      <div className='text-gray-500 flex items-center'>
        Last updated at
        <span className='h-[20px] w-[115px] bg-slate-300 animate-pulse rounded-md ml-1'/>
      </div>
    </div>
  )
}