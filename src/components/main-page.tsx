"use client";

import {
  type ElementRef,
  // type EventHandler,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  // buttonVariants
} from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Landmark, Moon, PiggyBank, Sun, Wallet } from "lucide-react";
// import {  } from "~/app/_components/wallet-menu";
import { api } from "~/trpc/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { useWallet } from "@txnlab/use-wallet-react";
import {} from "@txnlab/use-wallet";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  amountAtom,
  dollarAmountAtom,
  receipientAtom,
  chainAtom,
  accountAtom,
  bankAtom,
  nairaReceiveamountAtom,
  receiveamountAtom,
  receiveMethodtAtom,
} from "../lib/jotai-atoms";
import algosdk from "algosdk2";
import { getAlgorandClients } from "~/lib/wallet/client";
import { poolUtils, SupportedNetwork } from "@tinymanorg/tinyman-js-sdk";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import NiceModal from "@ebay/nice-modal-react";
// import Payment from "~/app/_components/buttons/receive-form-payment"
const Payment = dynamic(
  () => import("~/app/_components/buttons/receive-form-payment"),
  {
    ssr: true,
  },
);

const WalletMenu = dynamic(() => import("~/app/_components/wallet-menu"), {
  ssr: true,
});
const AVM_CHAINS = [
  {
    name: "algo",
    label: "Algo",
  },
  {
    name: "voi",
    label: "Voi",
  },
];
const CHAINS = [
  {
    name: "ethereum",
    label: "Ethereum",
  },
  {
    name: "binance",
    label: "Binance Smart Chain",
  },
  {
    name: "polygon",
    label: "Polygon",
  },
];
const SendForm = ({}: { isWalletConnected: boolean }) => {
  const [amount, setAmount] = useAtom(amountAtom);
  const [dollarAmount, setDollarAmount] = useAtom(dollarAmountAtom);
  const [recipientAddress, setRecipientAddress] = useAtom(receipientAtom);
  const [chain, setChain] = useAtom(chainAtom);

  // const { data: dollarRate } = api.account.getDollarRate.useQuery();
  const { data: dollarRate } = useQuery({
    queryKey: ["dollarRate"],
    queryFn: async () => {
      try {
        const rate = await fetch("/api/getDollarRate");
        return await rate.text();
      } catch (error) {
        console.error({ error });
        return null;
      }
    },
    staleTime: 1000 * 60 * 3,
  });
  const { mutateAsync } = api.account.accountInfoMutation.useMutation({});

  const { activeWalletAddresses } = useWallet();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    console.log("Sending", amount, "to", recipientAddress, "on chain", chain);
    const addrInfo = await mutateAsync({ addr: recipientAddress });
    if (!addrInfo) {
      return alert("Invalid Address");
    }
  };
  const ref = useRef<NonNullable<ElementRef<"div">>>();
  const addressIsValid = useMemo(() => {
    if (recipientAddress?.length == 58) return true;
    return false;
  }, [recipientAddress]);
  const isAvm = activeWalletAddresses?.includes(recipientAddress);

  const updatedollarAmount = (amt?: string) => {
    if (dollarRate && (amt ?? amount)) {
      const val = (+(amt ?? amount) / +dollarRate).toString();
      setDollarAmount(val);
    } else {
      setDollarAmount("");
    }
  };
  const updatebaseAmount = (amt?: string) => {
    if (dollarRate && (amt ?? dollarAmount)) {
      setAmount((+Number(amt ?? dollarAmount) * +dollarRate).toString());
    } else {
      setAmount("");
    }
  };
  useEffect(() => {
    updatedollarAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollarRate]);
  useEffect(() => {
    updatebaseAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollarRate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (in Naira)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(() => e.target.value);
            updatedollarAmount(e.target.value);
          }}
          placeholder="Enter amount in Naira"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dollar-amount">Amount (in Dollar)</Label>
        <Input
          id="dollar-amount"
          type="number"
          value={dollarAmount}
          onChange={(e) => {
            setDollarAmount(() => e.target.value);
            updatebaseAmount(e.target.value);
          }}
          placeholder="Enter amount in $ Dollars"
          required
        />
      </div>
      {/* <div className="space-y-2">
        <Label htmlFor="recipientAddress">Recipient Address</Label>
        <Input
          id="recipientAddress"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient's wallet address"
          required
        />
      </div> */}
      <div>
        <Label htmlFor="recipientAddress">Recipient Address</Label>
        <Command className="group relative">
          <CommandInput
            showIcon={false}
            onValueChange={setRecipientAddress}
            value={recipientAddress}
            onFocus={() => {
              ref?.current?.classList?.add("group-focus-within:block");
            }}
            placeholder="Paste wallet or choose from dropdown"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <CommandList
            // @ts-expect-error ref error
            ref={ref}
            className="absolute top-[100%] z-10 hidden w-full overflow-visible rounded bg-accent group-focus-within:block"
          >
            <CommandEmpty>
              <div className="flex flex-col items-start px-2">
                <p>Unknown bank</p>
                {addressIsValid && (
                  <div
                    onClick={() => {
                      //  setRecipientAddress(str);
                      ref?.current?.classList?.remove(
                        "group-focus-within:block",
                      );
                    }}
                    className="mt-2 w-full cursor-pointer truncate rounded !bg-background p-2"
                  >
                    {" "}
                    <p className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" /> {recipientAddress}
                    </p>
                  </div>
                )}
              </div>
            </CommandEmpty>
            {(activeWalletAddresses?.length ?? 0) > 0 && (
              <CommandGroup
                className="overflow-scroll"
                heading="Connected Wallets"
              >
                {activeWalletAddresses?.map((str, i) => {
                  return (
                    <CommandItem
                      onSelect={() => {
                        setRecipientAddress(str);
                        ref?.current?.classList?.remove(
                          "group-focus-within:block",
                        );
                      }}
                      className="cursor-pointer hover:!bg-accent/50"
                      value={str}
                      key={`${str}_${i}`}
                    >
                      <Wallet className="mr-2 h-4 w-4" /> {str}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
      <div className="space-y-2">
        <Label htmlFor="chain">Blockchain</Label>
        <Select
          // disabled={isAvm}
          onValueChange={setChain}
          defaultValue={AVM_CHAINS?.at(0)?.name}
          required
        >
          <SelectTrigger id="chain">
            <SelectValue placeholder="Select blockchain" />
          </SelectTrigger>
          <SelectContent>
            {AVM_CHAINS?.map((item) => (
              <SelectItem key={item?.name} value={item?.name}>
                {item?.label}
              </SelectItem>
            ))}
            {!isAvm &&
              CHAINS?.map((item) => (
                <SelectItem key={item?.name} value={item?.name}>
                  {item?.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {typeof window !== "undefined" && <Payment />}
    </form>
  );
};

const ReceiveForm = ({}: { isWalletConnected: boolean }) => {
  const { activeAccount } = useWallet();
  const isWalletConnected = !!activeAccount;
  const [dollarAmount, setDollarAmount] = useAtom(receiveamountAtom);
  const [amount, setAmount] = useAtom(nairaReceiveamountAtom);
  const [bank, setBank] = useAtom(bankAtom);
  const [accountNumber, setAccountNumber] = useAtom(accountAtom);
  const [receiveMethod, setReceiveMethod] = useAtom(receiveMethodtAtom);

  const { data: dollarRate } = useQuery({
    queryKey: ["dollarRate"],
    queryFn: async () => {
      try {
        const rate = await fetch("/api/getDollarRate");
        return await rate.text();
      } catch (error) {
        console.error({ error });
        return null;
      }
    },
    staleTime: 1000 * 60 * 3,
  });
  // useEffect(()=>{
  //   // NiceModal.show()
  // },[])
  const updatedollarAmount = (amt?: string) => {
    if (dollarRate && (amt ?? amount)) {
      const val = (+(amt ?? amount) / +dollarRate).toString();
      setDollarAmount(val);
    } else {
      setDollarAmount("");
    }
  };
  const updatebaseAmount = (amt?: string) => {
    if (dollarRate && (amt ?? dollarAmount)) {
      setAmount((+Number(amt ?? dollarAmount) * +dollarRate).toString());
    } else {
      setAmount("");
    }
  };
  useEffect(() => {
    updatedollarAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollarRate]);
  useEffect(() => {
    updatebaseAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollarRate]);
  const { data: banks } = useQuery({
    queryFn: async () => {
      try {
        const rate = await axios.get<
          Array<{
            name: string;
            slug: string;
            code: string;
            ussd: string;
          }>
        >("/banks.json");
        return rate;
      } catch (error) {
        console.error({ error });
        return null;
      }
    },
    queryKey: ["getBanks"],
  });

  const {
    mutate,
    data: accountInfo,
    isPending,
    error,
  } = api.payments.getAccountInfo.useMutation({ gcTime: 10000 });

  // useEffect(()=>{
  //   if(accountNumber?.length ==10){
  //     mut
  //   }
  // },[accountNumber])
  useEffect(() => {
    if (bank?.name && bank?.code && accountNumber?.length >= 10) {
      mutate({
        account: accountNumber,
        code: bank?.code,
      });
    }
  }, [bank?.name, accountNumber]);
  console.log({ accountInfo });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const ref = useRef<NonNullable<ElementRef<"div">>>();
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nairaAmount"> ₦ Naira to receive</Label>
        <Input
          id="nairaAmount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(() => e.target.value);
            updatedollarAmount(e.target.value);
          }}
          placeholder="Enter ₦ naira amount "
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receiveAmount">Amount (In $ Dollars)</Label>
        <Input
          id="receiveAmount"
          type="number"
          value={dollarAmount}
          onChange={(e) => {
            setDollarAmount(() => e.target.value);
            updatebaseAmount(e.target.value);
          }}
          placeholder="Enter amount in $ usdt"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Receive Method</Label>
        <RadioGroup
          value={receiveMethod}
          onValueChange={(e) => setReceiveMethod(e as typeof receiveMethod)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet">Connected Wallet</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="blockchain" id="blockchain" />
            <Label htmlFor="blockchain">Blockchain Transaction</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Command className="group relative">
          <CommandInput
            showIcon={false}
            onValueChange={(e) => {
              const bankData = banks?.data?.find((bank) => {
                return bank.name === e;
              });
              // if (!bankData) return;
              setBank({
                name: e,
                code: bankData?.code,
              });
            }}
            value={bank?.name}
            onFocus={() => {
              ref?.current?.classList?.add("group-focus-within:block");
            }}
            placeholder="Paste wallet or choose from dropdown"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <CommandList
            // @ts-expect-error ref error
            ref={ref}
            className="absolute top-[100%] z-10 hidden max-h-[13rem] w-full overflow-scroll rounded bg-accent group-focus-within:block"
          >
            <CommandEmpty>
              <div className="flex flex-col items-start px-2">
                <p>No Connected wallets found.</p>
              </div>
            </CommandEmpty>
            {banks?.data && (
              <CommandGroup
                className="overflow-scroll"
                heading="Connected Wallets"
              >
                {banks?.data?.map((str, i) => {
                  return (
                    <CommandItem
                      onSelect={() => {
                        setBank({
                          name: str.name,
                          code: str?.code,
                        });
                        ref?.current?.classList?.remove(
                          "group-focus-within:block",
                        );
                      }}
                      className="dark:gover:text-black flex cursor-pointer gap-2 hover:!bg-accent/50 hover:!bg-zinc-900 hover:!text-white dark:hover:bg-gray-200"
                      value={str.name}
                      key={`${str.name}_${i}`}
                    >
                      <Avatar>
                        <AvatarImage
                          className=""
                          src={`/logos/${str.slug}.png`}
                        />
                        <AvatarFallback>
                          <Landmark className="mr-2 h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>{" "}
                      {str.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-nowrap" htmlFor="accountNumber">
            Account Number
          </Label>
          <span className="max-w-[60%] truncate text-sm md:text-base">
            {accountInfo && accountNumber.length === 10 && !isPending && (
              <div className="text-green-500">
                {accountInfo?.data?.account_name}
              </div>
            )}
          </span>
        </div>
        <Input
          id="accountNumber"
          type="text"
          value={accountNumber}
          maxLength={10}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter your account number"
          required
        />
      </div>
      <Button type="submit" disabled={!isWalletConnected}>
        Receive Crypto
      </Button>
    </form>
  );
};

const ThemeToggle = ({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: (...ant: any) => any;
}) => (
  <div className="flex items-center space-x-2">
    <Sun className="h-4 w-4" />
    <Switch checked={isDark} onCheckedChange={onToggle} />
    <Moon className="h-4 w-4" />
  </div>
);

export function MainPage() {
  const {
    activeAccount,
    transactionSigner,
    algodClient,
    // activeWallet,
  } = useWallet();

  // provider?.setActiveProvider();
  //                                 provider?.setActiveAccount(account.address);

  const [isWalletConnected] = useState(!!activeAccount);
  const [isDarkMode, setIsDarkMode] = useState(false);
  async function handleContract() {
    // const { indexerClient } = getAlgorandClients();
    const APP_ID = 723190722;
    const addr = algosdk.getApplicationAddress(APP_ID);
    // const app = await algodClient.getApplicationByID(723190722).do();

    // console.log({addr, app });
    // // const decoded= await Buffer.from(app.params[])
    // return;
    const atc = new algosdk.AtomicTransactionComposer();

    const suggestedParams = await algodClient.getTransactionParams().do();
    const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      to: addr,
      from: activeAccount!.address,
      amount: 1 * 10 ** 6,
    });
    const txn = algosdk.makeApplicationOptInTxnFromObject({
      suggestedParams,
      appIndex: APP_ID,
      from: activeAccount!.address,
      foreignApps: [723190719],
    });
    const optInTxn = algosdk.makeApplicationCloseOutTxnFromObject({
      suggestedParams,
      appIndex: 723190719, // Opt-in to the correct app
      from: activeAccount!.address,
    });
    atc.addTransaction({
      txn: txn2,
      signer: transactionSigner,
    });

    atc.addTransaction({ txn, signer: transactionSigner });
    try {
      await atc.execute(algodClient, 4);
    } catch (error) {
      console.error({ error });
    }
  }
  // const {data:poolD,error}=useQuery({
  //   queryKey:["poolinfos"],
  //   queryFn:async()=>{
  //     const pool = await poolUtils.v2.getPoolInfo({
  //       network: "testnet" as SupportedNetwork,
  //       client: algodClient ,
  //       asset1ID: Number(0),
  //       asset2ID: Number(10458941)
  //     });
  //     console.log({pool})
  //     return pool
  //   }
  // })
  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <WalletMenu />
      <div className="container mx-auto p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            {/* <Button
              className="rounded-full bg-red-400"
              onClick={handleContract}
            >
              Contract
            </Button> */}
            <div>
              <CardTitle>Crypto Exchange</CardTitle>
              <CardDescription>Send or receive crypto easily</CardDescription>
            </div>
            <ThemeToggle isDark={isDarkMode} onToggle={setIsDarkMode} />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="receive">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>
              <TabsContent value="send">
                <SendForm isWalletConnected={isWalletConnected} />
              </TabsContent>
              <TabsContent value="receive">
                <ReceiveForm isWalletConnected={isWalletConnected} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
