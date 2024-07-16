
'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import {SWRConfig} from "swr";
import {ToastContainer} from "react-toastify";
import {Header} from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SWRConfig value={{fetcher: (url) => fetch(url).then(res => res.json()).catch(() => void 0)}}>
      <html lang="en" className='bg-gray-100'>
        <body className={`${inter.className}`}>
          <Header />
          <div className='py-10'>
            <ToastContainer />
            {children}
          </div>
        </body>
      </html>
    </SWRConfig>
  );
}
