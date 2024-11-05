import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { WalletProviderWrapper } from "./_components/wallet-manager";
import ModalProvider from "./providers/modal-provider";
import Navbar from "./_components/nav";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LOGO_DARK from "./_components/svgs/bg-logo";
export const metadata: Metadata = {
  title: "Alswap",
  description:
    "Best on-ramp and off-ramp solution. Swap from naira to all blockchains",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="relative">
      <LOGO_DARK className="absolute bottom-0 left-0"/>
      <LOGO_DARK className="hidden sm:block absolute bottom-0 right-0 scale-x-[-1]" />

        <ModalProvider> 
          <WalletProviderWrapper>
            <TRPCReactProvider>
              <Navbar />
              {children}
            </TRPCReactProvider>
          </WalletProviderWrapper>
        </ModalProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
