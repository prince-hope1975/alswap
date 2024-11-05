"server-only";
import algosdk, {
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { exec } from "node:child_process";
import path from "path";
import { client } from "./constants";

const projectRoot = process.cwd();
const scraperPath = path.join(projectRoot, "src", "lib", "wallet", "google");

function runScraper() {
  return new Promise<string>((resolve, reject) => {
    exec(scraperPath, (error, stdout, stderr) => {
      if (error) {
        reject(Error(`Error: ${error.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`Stderr: ${stderr}`));
        return;
      }
      try {
        const result = JSON?.parse(stdout) as unknown as { value: string };
        resolve(result.value);
      } catch (parseError) {
        reject(Error(`Error parsing JSON: ${parseError?.message}`));
      }
    });
  });
}
export async function getAccountInfo(params: string) {
  return await client.accountInformation(params).do();
}
export async function getMockDollarRate() {
  return 1560;
}
export async function getDollarRate() {
  return await runScraper();
}

// trasnferToAlgo
export async function trasnferNativeToAlgo(amount: number, receiver: string) {
  const atc = new algosdk.AtomicTransactionComposer();

  const wallet = algosdk.mnemonicToSecretKey(process.env.WALLET_SEED!);
  const signer = algosdk.makeBasicAccountTransactionSigner(wallet);

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makePaymentTxnWithSuggestedParamsFromObject({
    from: receiver,
    amount: +amount,
    suggestedParams: suggestedParams,
    to: wallet.addr.toString(),
  });

  atc.addTransaction({
    txn: txn,
    signer: signer,
  });

  const signed = await atc.execute(client, 4);
  return signed;
}
export async function trasnferAssetToAlgo(
  amount: number,
  receiver: string,
  options?: {
    signer: algosdk.TransactionSigner;
    wallet: algosdk.Account;
    asset?: number;
  },
) {
  let signer: algosdk.TransactionSigner | undefined = options?.signer;
  let wallet = options?.wallet;
  const atc = new algosdk.AtomicTransactionComposer();
  if (!wallet) {
    wallet = algosdk.mnemonicToSecretKey(process.env.WALLET_SEED!);
  }
  if (!signer) {
    signer = algosdk.makeBasicAccountTransactionSigner(wallet);
  }

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
    to: receiver,
    amount: +amount,
    suggestedParams: suggestedParams,
    from: wallet.addr.toString(),
    assetIndex: options?.asset ?? 10458941,
  });
  atc.addTransaction({
    txn: txn,
    signer: signer,
  });
  const signed = await atc.execute(client, 4);

  // const result = await client.statusAfterBlock(+tx["txid"]).do();
  return signed;
}
