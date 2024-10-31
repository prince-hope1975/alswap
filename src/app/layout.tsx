import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { WalletProviderWrapper } from "./_components/wallet-manager";
import ModalProvider from "./providers/modal-provider";
import Navbar from "./_components/nav";

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
      <body>
        <ModalProvider>
          <WalletProviderWrapper>
            <TRPCReactProvider>
              <Navbar />
              {children}
            </TRPCReactProvider>
          </WalletProviderWrapper>
        </ModalProvider>
      </body>
    </html>
  );
}
