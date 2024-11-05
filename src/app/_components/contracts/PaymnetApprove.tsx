/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Paymnet, PaymnetClient } from '../contracts/PaymnetClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<PaymnetApprove
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call approve"
  typedClient={typedClient}
  addr={addr}
  amount={amount}
/>
*/
type PaymnetApproveArgs = Paymnet['methods']['approve(address,uint64)bool']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: PaymnetClient
  addr: PaymnetApproveArgs['addr']
  amount: PaymnetApproveArgs['amount']
}

const PaymnetApprove = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling approve`)
    await props.typedClient.approve(
      {
        addr: props.addr,
        amount: props.amount,
      },
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

export default PaymnetApprove