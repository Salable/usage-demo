
'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import {SWRConfig} from "swr";
import {SalableProvider} from "@/components/context";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SWRConfig value={{fetcher: (url) => fetch(url).then(res => res.json()).catch(() => void 0)}}>
      <SalableProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </SalableProvider>
    </SWRConfig>
  );
}
