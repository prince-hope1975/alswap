/* eslint-disable no-console */
import { type ReactNode, useState } from "react";
import { type PaymnetClient } from "~/contracts/clients/PaymnetClient";
import { useWallet } from "@txnlab/use-wallet-react";
import * as algokit from "@algorandfoundation/algokit-utils";
import { paymentContractClient } from "~/lib/wallet/client";

/* Example usage
<PaymnetBootstrap
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call bootstrap"
  typedClient={typedClient}
/>
*/
type Props = {
  buttonClass: string;
  buttonLoadingNode?: ReactNode;
  buttonNode: ReactNode;
  typedClient: PaymnetClient;
};

const PaymnetBootstrap = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { activeAddress, transactionSigner } = useWallet();
  const sender = { signer: transactionSigner, addr: activeAddress! };

  const callMethod = async () => {
    setLoading(true);
    console.log(`Calling bootstrap`);
    await paymentContractClient.appClient.fundAppAccount({
      amount: algokit.algos(1),
      sender,
    });

    await props.typedClient.bootstrap(
      {},
      {
        sender,
        sendParams: {
          fee: algokit.microAlgos(2000),
        },
      },
    );
    setLoading(false);
  };

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading
        ? (props.buttonLoadingNode ?? props.buttonNode)
        : props.buttonNode}
    </button>
  );
};

export default PaymnetBootstrap;
