import {InvoicesLoading} from "@/components/loading/invoices-loading";
import {SubscriptionLoading} from "@/components/loading/subscription-loading";

export default async function SubscriptionPageLoading() {
  return (
    <div className='max-w-[1000px] m-auto text-sm'>
      <SubscriptionLoading />
      <div className='mt-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Invoices</h2>
        <div className='mt-3'>
          <InvoicesLoading />
        </div>
      </div>
    </div>
  )
}