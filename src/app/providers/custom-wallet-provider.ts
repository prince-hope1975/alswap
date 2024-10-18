import { CustomProvider, WalletAccount } from "@txnlab/use-wallet"; // Or any framework adapter
import { PeraWalletConnect } from "@perawallet/connect";

export class ExampleProvider
  extends PeraWalletConnect
  implements CustomProvider
{
  pc: unknown;
  accounts: unknown[];

  constructor(pc: unknown = false) {
    super();
    this.pc = pc;
    this.accounts = [];
  }

  connect(options?: { selectedAccount?: string; }): Promise<string[]> {
      
  }
  ensurePC = async () => {
    if (this.pc) {
      // console.log({ starting: true });
      const Peraconnect_Wallet = window.localStorage.getItem(
        "PeraWallet.Wallet" satisfies LocalStorageItem,
      );
      const Peraconnect_Wallet_Obj = JSON.parse(Peraconnect_Wallet!);
      try {
        let item = LocalStorageItems.omit({ walletconnect: true }).parse({
          "PeraWallet.Wallet": Peraconnect_Wallet_Obj,
        });
        this.accounts = item["PeraWallet.Wallet"].accounts;
        // console.log({ switching: this.accounts });
      } catch (error) {
        console.error(error);
      }
      return this.accounts;
    }
    this.pc = new PeraWalletConnect(options);
    this.pc.reconnectSession().then((accts: any) => {
      this.accounts = accts;
    });
  };

  disconnect = async () => {
    this.pc.disconnect();
    this.accounts = [];
  };

  ensureSession = async () => {
    await this.ensurePC();
    if (this.accounts.length === 0) {
      return new Promise<any>(async (resolve) => {
        this.pc
          .connect()
          .then((accounts: any) => {
            this.accounts = accounts;
            resolve(this.accounts[0]);
          })
          .catch((error: any) => {
            console.error(error);
            this.accounts = [];
            resolve(this.accounts[0]);
          });
      });
    }
  };

  getAddr = async (): Promise<string> => {
    await this.ensureSession();
    return this.accounts[0];
  };

  signTxns = async (txns: string[]): Promise<string[]> => {
    let userWallet = await this.ensureSession();
    // console.log({ userWallet, accts: this.accounts[0] });
    let ntxns: any[] = txns.map((x: any) => {
      let txn = algosdk.decodeUnsignedTransaction(Buffer.from(x, "base64"));

      return { txn, signers: [this.accounts[0]] };
    });
    let stxns = await this.pc.signTransaction([ntxns]);
    const result: any[] = [];
    stxns.forEach((txn: any) => {
      result.push(Buffer.from(txn, "base64"));
    });
    return result;
  };
}
