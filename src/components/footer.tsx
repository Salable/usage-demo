import Link from "next/link";
import {SalableDemoLogo} from "@/components/icons/salable-demo-logo";
import {DiscordLogo} from "@/components/icons/discord-logo";
import {GithubLogo} from "@/components/icons/github-logo";

export const Footer = () => (
  <footer className='bg-gray-900 mt-auto'>
    <div className='max-w-[1500px] m-auto text-gray-400'>
      <div className='p-9 border border-b-0 border-gray-500 text-white' style={{ backgroundImage: 'linear-gradient(92.59deg, rgba(99,138,255,0.1) 34.33%, rgba(99,138,255,0.7) 99.18%)'}}>
        <div className='mb-3'>
          <SalableDemoLogo />
        </div>
        <p className='mb-3'>This demo illustrates usage billing using Salable.</p>
        <p className='mb-3'>To see how per-seat or flat rate billing can be applied to the same product see the below demos.</p>
        <p><Link href='https://github.com/Salable/flat-rate-demo' className='inline-flex hover:underline'>Flat rate pricing demo</Link></p>
        <p><Link href='https://github.com/Salable/seats-demo' className='inline-flex hover:underline'>Per-seat pricing demo</Link></p>
      </div>
      <div className='md:grid md:grid-cols-3'>
        <div className='p-9 border border-gray-500'>
          <p><span className='font-bold text-white'>Get answers and guidance</span> from our own developers and commercial model consultants. If you have an implementation query or you are not sure which pricing model to use for your app, our people are ready to help. </p>
          <Link
            href='https://discord.com/channels/1064480618546737163/1219751191483781214'
            className='border border-black rounded-md p-4 leading-none inline-flex items-center mt-6 text-purple-400 fill-purple-400 text-sm font-bold transition hover:bg-purple-400 hover:text-gray-900 hover:fill-gray-900'
          >
            <div className='h-[16px] w-[20px] mr-2'>
              <DiscordLogo />
            </div>
            <span>Discord Community</span>
          </Link>
        </div>
        <div className='p-9 border border-gray-500 flex flex-col justify-between'>
          <div>
            <h3 className='text-white text-lg font-bold'>Clone this project</h3>
            <p>We have made this project public to help you get started.</p>
          </div>
          <div>
            <Link
              href='https://github.com/Salable/usage-demo'
              className='border border-black rounded-md p-4 leading-none inline-flex items-center mt-6 text-green-400 fill-green-400 text-sm font-bold transition hover:bg-green-400 hover:text-gray-900 hover:fill-gray-900'
            >
              <div className='h-[20px] w-[20px] mr-2'>
                <GithubLogo />
              </div>
              View project on GitHub
            </Link>
          </div>
        </div>
        <div className='p-9 border border-gray-500'>
        <p><span className='font-bold text-white'>Sign up for free</span> to Salable, the first subscription licensing platform designed for SaaS apps and services. Salable supports many strategic billing models including per seat billing.</p>
          <Link href='https://salable.app/signup' className='inline-flex p-4 text-white rounded-md leading-none font-bold font-bold bg-blue-700 hover:bg-blue-800 transition mt-6 text-sm'>Sign up to Salable</Link>
        </div>
      </div>
    </div>
  </footer>
)