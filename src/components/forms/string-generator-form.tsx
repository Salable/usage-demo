'use client'
import React, {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {LockIcon} from "@/components/icons/lock-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {generateString} from "@/app/actions/strings";
import {toast} from "react-toastify";
import {CurrentUsage} from "@/fetch/usage";
import {format} from "date-fns";

export type Bytes = '16' | '32' | '64' | '128'
export type LicenseCheckResponse = {
  capabilities: {
    capability: string;
    expiry: string
  }[],
  signature: string,
}

export const StringGeneratorForm = (
  {
    check,
    currentUsage
  }:
  {
    check: LicenseCheckResponse | null,
    currentUsage: CurrentUsage | null
  }
) => {
  const [creditsUsedInSession, setCreditsUsedInSession] = useState<number>(0)
  const [randomString, setRandomString] = useState<string | null>(null)
  const {register, handleSubmit, watch, formState: {isSubmitting}} = useForm<{
    bytes: Bytes
  }>({
    ...(check && {defaultValues: {bytes: '16'}}),
    mode: 'onChange'
  })

  const onSubmit: SubmitHandler<{
    bytes: Bytes
  }> = async (formData) => {
    const result = await generateString(formData)
    if (result.data) {
      setRandomString(result.data.string)
      setCreditsUsedInSession(creditsUsedInSession + result.data.credits)
    }
    if (result.error) {
      toast.error(result.error)
    }
  }

  const bytes: Bytes[] = ['16', '32', '64', '128']
  const isLicensed = check?.capabilities.find((c) => c.capability === 'basic')

  const Byte = ({size, capability}: {size: string; capability: boolean}) => {
    return (
      <>
        <label
          htmlFor={size}
          className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md
            ${watch().bytes === size ? "border-black bg-black text-white" : ""}
            ${capability ? "cursor-pointer" : ""}
            ${!capability ? "bg-gray-200" : ""}
          `}
        >
          {size}
          {!capability ? (
            <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
          ) : null}
        </label>
        <input disabled={!capability} id={size} type="radio" value={size} {...register('bytes')} className='hidden'/>
      </>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex justify-center items-center'>
          <h2 className='text-center mr-3'>Bytes</h2>
          {bytes.map((byte, index) => (
            <Byte size={byte} capability={!!isLicensed} key={`${byte}-${index}`}/>
          ))}

          {check ? (
            <button
              className={`p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-900 transition text-sm`}
              disabled={isSubmitting}
            >{!isSubmitting ? "Generate" :
              <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}</button>
          ) : null}

        </div>
      </form>

      {randomString ? (
        <div className='mt-6 relative text-center flex justify-center'>
          <pre className='p-2 leading-none truncate text-lg text-center bg-white rounded-l-full'>{randomString}</pre>
          <CopyButton text={randomString}/>
        </div>
      ) : null}


      {currentUsage ? (
        <div className='mt-6'>
          <h2 className='text-2xl font-bold text-gray-900 mr-4 text-center'>
            <span className='mr-1'>{currentUsage.unitCount + creditsUsedInSession}</span>
            <span className='text-xs text-gray-500 font-normal'>credit{currentUsage.unitCount !== 1 ? 's' : ''} used</span>
          </h2>
          {currentUsage.updatedAt ? (
            <div className='text-gray-500 text-center'>Last updated at {format(new Date(currentUsage.updatedAt), 'd LLL yyy H:mm')}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

const CopyButton = ({text}: { text: string }) => {
  const [showMessage, setShowMessage] = useState(false)
  return (
    <button
      className='rounded-r-full font-bold bg-blue-700 hover:bg-blue-900 transition uppercase px-2 pr-[12px] text-white text-xs relative'
      onClick={() => {
        navigator.clipboard.writeText(text)
        setShowMessage(true)
        setTimeout(() => {
          setShowMessage(false)
        }, 600)
      }}
    >
      Copy
      <span
        aria-disabled={true}
        className={`absolute p-2 leading-none bg-black text-white top-[-30px] right-0 ${showMessage ? 'opacity-100' : 'opacity-0'} transition rounded-sm pointer-events-none normal-case`}
      >
        Copied!
      </span>
    </button>
  )
}

