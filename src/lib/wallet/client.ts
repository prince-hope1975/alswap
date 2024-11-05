"use client";
//import { PROVIDER_ID } from '@txnlab/use-wallet-react'
import algosdk, {
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk2";
import { client, indexer } from "./utils/constants";
import config from "~/config";
import { formatAmount } from "../utils";
import { PaymnetClient } from "~/contracts/clients/PaymnetClient";
import * as algokit from "@algorandfoundation/algokit-utils";

// const getDynamicDeflyWalletConnect = async () => {
//   const DeflyWalletConnect = (await import("@blockshake/defly-connect"))
//     .DeflyWalletConnect;
//   return DeflyWalletConnect;
// };

// const getDynamicPeraWalletConnect = async () => {
//   const PeraWalletConnect = (await import("@perawallet/connect"))
//     .PeraWalletConnect;
//   return PeraWalletConnect;
// };

// const getDynamicDaffiWalletConnect = async () => {
//   const DaffiWalletConnect = (await import("@daffiwallet/connect"))
//     .DaffiWalletConnect;
//   return DaffiWalletConnect;
// };

export const getProviderInit: unknown = () => {
  do {
    try {
      return {
        // providers
        //  algorand
        //  algorand-testnet
        //    pera
        //    daffi
        //    exodus
        //    defly
        //    kibisis
        //  voi-testnet
        //    defly (A-Wallet)
        //    kibisis
        //    lute
        providers: [
          // {
          //   id: PROVIDER_ID.DEFLY,
          //   getDynamicClient: getDynamicDeflyWalletConnect,
          // },
          // {
          //   id: PROVIDER_ID.LUTE,
          //   getDynamicClient: getDynamicLuteConnect,
          //   clientOptions: { siteName: "HumbPact" },
          // },
          // { id: PROVIDER_ID.KIBISIS },
        ],
        nodeConfig: {
          network: "voi-testnet",
          nodeServer: "https://mainnet-api.voi.nodly.dev",
          nodeToken: "",
          nodePort: "443",
        },
        algosdkStatic: algosdk,
        debug: true,
      };
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {}, 4000);
  } while (true);
};

export const getCurrentNode = () => {
  const [node, customNode, customIndexer] = (
    localStorage.getItem("node") ?? "::"
  ).split(":");
  return [node, customNode, customIndexer];
};

export const getCurrentNodeEnv = () => {
  const [node, customNode, customIndexer] = getCurrentNode();
  let ALGO_SERVER;
  let ALGO_INDEXER_SERVER;
  switch (node) {
    default:
    case "voi":
      ALGO_SERVER = "https://mainnet-api.voi.nodely.dev";
      ALGO_INDEXER_SERVER = "https://mainnet-idx.voi.nodely.dev";
      break;
    case "voi-testnet":
      ALGO_SERVER = "https://testnet-api.voi.nodly.io";
      ALGO_INDEXER_SERVER = "https://testnet-idx.voi.nodly.io";
      break;
    case "algorand-testnet":
      ALGO_SERVER = "https://testnet-api.algonode.cloud";
      ALGO_INDEXER_SERVER = "https://testnet-idx.algonode.cloud";
      break;
    case "algorand":
      ALGO_SERVER = "https://mainnet-api.algonode.cloud";
      ALGO_INDEXER_SERVER = "https://mainnet-idx.algonode.cloud";
      break;
    case "custom":
      ALGO_SERVER = customNode;
      ALGO_INDEXER_SERVER = customIndexer;
      break;
  }
  return {
    ALGO_SERVER,
    ALGO_INDEXER_SERVER,
  };
};

export const getAlgorandClients = () => {
  const { ALGO_SERVER: algodServer, ALGO_INDEXER_SERVER: indexerServer } =
    getCurrentNodeEnv();
  const algodToken = ""; // Your Algod API token
  const algodPort = ""; // Port of your Algod node
  const algodClient = new algosdk.Algodv2(algodToken, algodServer!, algodPort);
  const token = "";
  const port = "";
  const indexerClient = new algosdk.Indexer(token, indexerServer, port);
  return {
    algodClient,
    indexerClient,
  };
};

export async function trasnferNativeToAlgo(
  amount: number,
  receiver: string,
  options: {
    signer: algosdk.TransactionSigner;
    wallet: algosdk.Account;
  },
) {
  const atc = new algosdk.AtomicTransactionComposer();

  const signer = algosdk.makeBasicAccountTransactionSigner(options?.wallet);

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makePaymentTxnWithSuggestedParamsFromObject({
    from: receiver,
    amount: +amount,
    suggestedParams: suggestedParams,
    to: options?.wallet.addr.toString(),
  });

  atc.addTransaction({
    txn: txn,
    signer: signer,
  });

  const signed = await atc.execute(client, 4);
  return signed;
}

export async function trasnferUsdc(
  amount: number,
  receiver: string,
  options: {
    signer: algosdk.TransactionSigner;
    address: string;
    assetIndex?: number;
  },
) {
  const signer: algosdk.TransactionSigner | undefined = options?.signer;
  const atc = new algosdk.AtomicTransactionComposer();

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
    to: receiver,
    amount: +formatAmount(+amount)?.toFixed(0),
    suggestedParams: suggestedParams,
    from: options?.address,
    assetIndex: options?.assetIndex ?? config.tokens.usdc,
  });
  atc.addTransaction({
    txn: txn,
    signer: signer,
  });
  const signed = await atc.execute(client, 4);

  // const result = await client.statusAfterBlock(+tx["txid"]).do();
  return signed;
}
export async function trasnferNaira(
  amount: number,
  receiver: string,
  options: {
    signer: algosdk.TransactionSigner;
    address: string;
    assetIndex?: number;
  },
) {
  const signer: algosdk.TransactionSigner | undefined = options?.signer;
  const atc = new algosdk.AtomicTransactionComposer();

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
    to: receiver,
    amount: +formatAmount(+amount,2)?.toFixed(0),
    suggestedParams: suggestedParams,
    from: options?.address,
    assetIndex: options?.assetIndex ?? config.tokens.usdc,
  });
  atc.addTransaction({
    txn: txn,
    signer: signer,
  });
  const signed = await atc.execute(client, 4);

  // const result = await client.statusAfterBlock(+tx["txid"]).do();
  return signed;
}
// const fixture = await algokit.getTransactionParams(undefined, client);

// export const paymentContractClient = new PaymnetClient(
//   {
//     resolveBy: "id",
//     id: 728439463,
//     params: {
//       ...fixture,
//       fee: algokit.algos(1).microAlgos,
//     },
//   },
//   client,
// );
