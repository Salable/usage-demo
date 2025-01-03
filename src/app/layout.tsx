import { Inter } from "next/font/google";
import "./globals.css";
import {ToastContainer} from "react-toastify";
import {Header} from "@/components/header";
import "react-toastify/dist/ReactToastify.css";
import {Footer} from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='bg-gray-100 font-sans antialiased'>
    <body className={`${inter.className} flex flex-col min-h-screen`}>
      <Header/>
      <div className='p-6 md:py-10 md:px-6 text-sm'>
        <ToastContainer autoClose={2000} hideProgressBar={true}/>
        {children}
      </div>
      <Footer />
    </body>
    </html>
  );
}
