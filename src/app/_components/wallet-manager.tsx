"use client";
import { NetworkId, WalletId, WalletManager } from "@txnlab/use-wallet";
import { WalletProvider } from "@txnlab/use-wallet-react";
import { ReactNode } from "react";
import toast, { Toaster } from 'react-hot-toast';

export const walletManager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    // {
    //   id: WalletId.CUSTOM,
    //   options: {
    //     provider: new ExampleProvider()
    //   },
    //   metadata: {
    //     name: 'Pera wallet',
    //     icon: '/pera.png'
    //   }
    // }
    // WalletId.EXODUS,
    // WalletId.KIBISIS,
    // {
    //   id: WalletId.WALLETCONNECT,
    //   options: { projectId: '<YOUR_PROJECT_ID>' }
    // },
    // {
    //   id: WalletId.MAGIC,
    //   options: { apiKey: '<YOUR_API_KEY>' }
    // },
    // {
    //   id: WalletId.LUTE,
    //   options: { siteName: '<YOUR_SITE_NAME>' }
    // }
  ],
  network: NetworkId.TESTNET,
});

export const WalletProviderWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <WalletProvider manager={walletManager}>
    <Toaster />
    {children}</WalletProvider>;
};
