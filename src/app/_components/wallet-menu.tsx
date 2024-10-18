"use client";
import { useWallet } from "@txnlab/use-wallet-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
// YIAZAYLN73TRG5AKSCQR7E6JMMAMJHJJIWJEGUAJLPMRSZZVQR246Q6RPE
export function WalletMenu() {
  const { wallets, activeWallet, activeAccount, activeWalletAddresses } =
    useWallet();
  console.log({ firstWallet: activeWallet?.activeNetwork });
  const [open, setOpen] = useState(false);
  return (
    <div className="container mx-auto p-4">
      <h2>Wallets</h2>
      <ul className="flex gap-2">
        {wallets.map((wallet) => (
          <li
            className="rounded bg-primary-foreground p-2 text-primary hover:bg-secondary"
            key={wallet.id}
          >
            <button onClick={() => wallet.connect()}>
              {wallet.metadata.name}
            </button>
          </li>
        ))}
      </ul>

      {activeWallet && (
        <div className="flex items-center gap-2">
          {/* <h2>Active Wallet</h2>
          <p>{activeWallet.metadata.name}</p> */}
          <h2>Active Account:</h2>
          <p>{activeAccount?.address}</p>
          <Button variant={"outline"} onClick={() => activeWallet.disconnect()}>
            Disconnect
          </Button>
        </div>
      )}
      <Button
        onClick={() => {
          setOpen(!open);
        }}
      >
        Switch accounts <ChevronDown />
      </Button>
      <div
        className={`grid gap-2 sm:grid-cols-2 overflow-hidden transition-all my-2 ${open ? "max-h-full" : "max-h-0"}`}
      >
        {activeWalletAddresses?.map((address) => {
          if (address == activeAccount?.address) return <></>;
          return (
            <div
              onClick={() => {
                activeWallet?.setActiveAccount(address);
              }}
              className="w-full cursor-pointer overflow-hidden truncate text-wrap rounded bg-gray-900 p-2 text-white"
              key={address}
            >
              <p>{address}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WalletMenu;
