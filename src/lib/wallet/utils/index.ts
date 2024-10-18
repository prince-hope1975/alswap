import algosdk, {
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import { exec } from "child_process";
import path from "path";

const token = "";
const server = "https://testnet-api.4160.nodely.dev";
const port = 443;
const client = new algosdk.Algodv2(token, server, port);
const projectRoot = process.cwd();
const scraperPath = path.join(projectRoot, "src", "lib", "wallet", "google");

function runScraper() {
  return new Promise<string>((resolve, reject) => {
    exec(scraperPath, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result.value as string);
      } catch (parseError: any) {
        reject(`Error parsing JSON: ${parseError.message}`);
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
export async function trasnferUsdcToAlgo(amount: number, receiver: string) {
  const atc = new algosdk.AtomicTransactionComposer();
  const wallet = algosdk.mnemonicToSecretKey(process.env.WALLET_SEED!);
  const signer = algosdk.makeBasicAccountTransactionSigner(wallet);

  const suggestedParams = await client.getTransactionParams().do();
  const txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
    to: receiver,
    amount: +amount,
    suggestedParams: suggestedParams,
    from: wallet.addr.toString(),
    assetIndex: 10458941,
  });
  atc.addTransaction({
    txn: txn,
    signer: signer,
  });
  const signed = await atc.execute(client, 4);

  // const result = await client.statusAfterBlock(+tx["txid"]).do();
  return signed;
}
