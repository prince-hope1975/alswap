"use client";
import { useWallet } from "@txnlab/use-wallet-react";
import { ChevronDown, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "~/components/ui/dialog";

// YIAZAYLN73TRG5AKSCQR7E6JMMAMJHJJIWJEGUAJLPMRSZZVQR246Q6RPE
export function WalletMenu() {
  const { wallets, activeWallet, activeAccount, activeWalletAddresses } =
    useWallet();
  const [open, setOpen] = useState(false);
  return (
    <div className="container mx-auto flex p-4">
      {activeWallet && (
        <div className="flex items-center gap-2">
          {activeAccount?.address && (
            <Popover>
              <PopoverTrigger
                title={activeAccount?.address}
                className="w-[100px] cursor-pointer overflow-hidden truncate rounded bg-gray-300 p-2 text-black dark:bg-slate-900 dark:text-white"
              >
                {/* <Button className="w-[100px] truncate rounded text-start p-2"> */}
                {activeAccount?.address}
                {/* </Button> */}
              </PopoverTrigger>
              <PopoverContent className="grid items-center justify-center gap-2">
                <Button
                  className="dark:text-white"
                  variant={"outline"}
                  onClick={() => activeWallet.disconnect()}
                >
                  Disconnect
                </Button>
                {/* <Button>Disconnect</Button> */}

                <Dialog>
                  <DialogTrigger>
                    <Button
                      onClick={() => {
                        setOpen(!open);
                      }}
                    >
                      Switch accounts <ChevronDown />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div
                      className={`my-2 grid gap-2 overflow-hidden transition-all`}
                    >
                      {activeWalletAddresses?.map((address, idx) => {
                        if (address == activeAccount?.address) return <></>;
                        return (
                          <div
                            onClick={() => {
                              activeWallet?.setActiveAccount(address);
                            }}
                            className="w-full cursor-pointer overflow-hidden truncate text-wrap rounded bg-gray-900 p-2 text-white"
                            key={`${address}-${idx}`}
                          >
                            <DialogClose>{address}</DialogClose>
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Copy address */}
                <Button
                  onClick={async () => {
                    await window.navigator.clipboard.writeText(
                      activeAccount?.address,
                    );
                  }}
                >
                  Copy address <Copy />
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {!activeAccount?.address && (
        <Popover>
          <PopoverTrigger>
            <span className="w-[100px] truncate rounded bg-popover p-2 text-black dark:text-white  ">
              Connect{" "}
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <ul className="flex gap-2">
              {wallets.map((wallet, id) => (
                <li
                  className="rounded bg-primary-foreground p-2 text-primary hover:bg-secondary"
                  key={`${wallet.id}-${id}`}
                >
                  <span
                    className="flex gap-2 items-center"
                    onClick={() => wallet.connect()}
                  >
                    <img className="w-5 h-5" src={wallet?.metadata?.icon} alt={wallet?.metadata?.name} />
                    {wallet.metadata.name}
                  </span>
                </li>
              ))}
            </ul>{" "}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default WalletMenu;
