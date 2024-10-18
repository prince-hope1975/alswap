import {
  poolUtils,
  type SupportedNetwork,
  Swap,
  SwapQuoteType,
  SwapType,
} from "@tinymanorg/tinyman-js-sdk";
import algosdk, { type Account } from "algosdk";

import signerWithSecretKey from "./initiatorSigner";
/**
 * Executes a swap with a fixed input amount
 * (Input amount is entered by the user, output amount is to be calculated by the SDK)
 */
export async function fixedInputSwap({
  account,
  client,
  asset_1,
  asset_2,
}: {
  account: Account;
  client: algosdk.Algodv2;
  asset_1: { id: string; unit_name: string };
  asset_2: { id: string; unit_name: string };
}) {
  const initiatorAddr = account.addr;
  const pool = await poolUtils.v2.getPoolInfo({
    network: "testnet" as SupportedNetwork,
    client: client,
    asset1ID: Number(asset_1.id),
    asset2ID: Number(asset_2.id),
  });

  /**
   * This example uses only v2 quote. Similarly, we can use
   * Swap.getQuote method, which will return the best quote (highest rate)
   * after checking both v1 and v2
   */
  const fixedInputSwapQuote = await Swap.v2.getQuote({
    type: SwapType.FixedInput,
    pool,
    amount: 1_000_000,
    assetIn: { id: pool.asset1ID, decimals: 6 },
    assetOut: { id: pool.asset2ID, decimals: 6 },
    network: "testnet" as SupportedNetwork,
    // {assetIn: 6, assetOut: 6}
  });
  type assets = {
    id: number;
    amount: bigint;
  };
  let assetIn: assets, assetOut: assets;
  if (fixedInputSwapQuote.type == SwapQuoteType.Direct) {
    assetIn = {
      id: fixedInputSwapQuote.data?.quote.assetInID,
      amount: fixedInputSwapQuote.data.quote.assetInAmount,
    };
    assetOut = {
      id: fixedInputSwapQuote.data?.quote.assetOutID,
      amount: fixedInputSwapQuote.data.quote.assetOutAmount,
    };
  } else {
    assetIn = {
      id: +fixedInputSwapQuote.data.asset_in_id,
      amount: BigInt(fixedInputSwapQuote.data.amount),
    };
    assetOut = {
      id: +fixedInputSwapQuote.data.asset_out_id,
      amount: BigInt(fixedInputSwapQuote.data.amount),
    };
  }
  const fixedInputSwapTxns = await Swap.v2.generateTxns({
    client: client,
    swapType: SwapType.FixedInput,
    // pool,
    initiatorAddr,
    // assetIn,
    // assetOut,
    slippage: 0.05,
    quote: fixedInputSwapQuote,
    network: "testnet" as SupportedNetwork,
  });

  const signedTxns = await Swap.v2.signTxns({
    txGroup: fixedInputSwapTxns,
    
    initiatorSigner: signerWithSecretKey(account),
  });

  const swapExecutionResponse = await Swap.v2.execute({
    // network: "testnet" as SupportedNetwork,
    client: client,
    signedTxns,
    // pool,
    txGroup: fixedInputSwapTxns,
    quote: fixedInputSwapQuote,
    // assetIn,
  });

  console.log("✅ Fixed Input Swap executed successfully!");
  console.log({ txnID: swapExecutionResponse.txnID });
}
