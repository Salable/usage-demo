import {CurrentUsageLoading} from "@/components/loading/current-usage-loading";

export const SubscriptionLoading = () => {
  return (
    <div>
      <div>
        <div className="flex items-center mb-6">
          <h1 className='text-3xl flex items-center'>
            Subscription
            <div className="ml-2 h-[34px] w-[95px] bg-slate-300 rounded-md animate-pulse"></div>
          </h1>
        </div>

        <div className='mb-3'>
          <div className='flex justify-between items-end'>
            <div>
              <div className='text-gray-500'>Plan</div>
              <div className="mr-2 h-[28px] bg-slate-300 rounded w-[100px]"></div>
            </div>
          </div>
        </div>

        <div>
          <CurrentUsageLoading />
        </div>
      </div>
    </div>
  )
}