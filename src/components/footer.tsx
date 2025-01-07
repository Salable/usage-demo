import Link from "next/link";
import {SalableDemoLogo} from "@/components/icons/salable-demo-logo";
import {DiscordLogo} from "@/components/icons/discord-logo";
import {GithubLogo} from "@/components/icons/github-logo";
import {SalableIcon} from "@/components/icons/salable-icon";

export const Footer = () => (
  <footer className='bg-gray-900 mt-auto text-xs'>
    <div className='max-w-[1500px] m-auto text-gray-400'>
      <div className='md:flex justify-between items-center p-6 md:p-0 md:py-4'>
        <div className='flex justify-center md:mr-4'>
          <SalableDemoLogo />
        </div>
        <div className='flex md:block flex-col items-center'>
          <Link
            href='https://github.com/Salable/usage-demo'
            className='md:mr-4 mt-3 md:mt-0 border border-black rounded-md p-4 leading-none inline-flex items-center text-green-400 fill-green-400 text-sm font-bold transition hover:bg-green-400 hover:text-gray-900 hover:fill-gray-900'
          >
            <div className='h-[16px] w-[16px] mr-2'>
              <GithubLogo height={16} width={16} />
            </div>
            View project on GitHub
          </Link>
          <Link
            href='https://discord.com/channels/1064480618546737163/1219751191483781214'
            className='md:mr-4 mt-4 md:mt-0 border border-black rounded-md p-4 leading-none inline-flex items-center text-purple-400 fill-purple-400 text-sm font-bold transition hover:bg-purple-400 hover:text-gray-900 hover:fill-gray-900'
          >
            <div className='h-[16px] w-[20px] mr-2'>
              <DiscordLogo/>
            </div>
            <span>Join the Salable Discord</span>
          </Link>
          <Link
            href='https://salable.app/signup'
            className='md:mr-4 mt-3 md:mt-0 border border-black rounded-md p-4 leading-none inline-flex items-center text-blue-400 fill-blue-400 text-sm font-bold transition hover:bg-white hover:text-gray-900 hover:fill-white'
          >
            <div className='h-[16px] w-[16px] mr-2'>
              <SalableIcon height={16} width={16} />
            </div>
            Sign up to Salable
          </Link>
        </div>
      </div>
    </div>
  </footer>
)