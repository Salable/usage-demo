
'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import {SWRConfig} from "swr";
import React from "react";
import {ToastContainer} from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SWRConfig value={{fetcher: (url) => fetch(url).then(res => res.json()).catch(() => void 0)}}>
      <html lang="en">
        <body className={inter.className}>
          <ToastContainer/>
          {children}
        </body>
      </html>
    </SWRConfig>
  );
}
