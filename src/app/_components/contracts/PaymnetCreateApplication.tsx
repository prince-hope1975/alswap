/* eslint-disable no-console */
import { type ReactNode, useState } from "react";
import { PaymnetClient } from "~/contracts/clients/PaymnetClient";
import { useWallet } from "@txnlab/use-wallet-react";

/* Example usage
<PaymnetCreateApplication
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call createApplication"
  typedClient={typedClient}
/>
*/
type Props = {
  buttonClass: string;
  buttonLoadingNode?: ReactNode;
  buttonNode: ReactNode;
  typedClient: PaymnetClient;
};

const PaymnetCreateApplication = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { activeAddress, transactionSigner } = useWallet();
  const sender = { signer: transactionSigner, addr: activeAddress! };

  const callMethod = async () => {
    setLoading(true);
    console.log(`Calling createApplication`);
await props.typedClient.create.createApplication(
      {},
      { sender },
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

export default PaymnetCreateApplication;
