/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Paymnet, PaymnetClient } from '../contracts/PaymnetClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<PaymnetReceive
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call receive"
  typedClient={typedClient}
/>
*/
type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: PaymnetClient
}

const PaymnetReceive = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling receive`)
    await props.typedClient.receive(
      {},
      { sender },
    )
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default PaymnetReceive