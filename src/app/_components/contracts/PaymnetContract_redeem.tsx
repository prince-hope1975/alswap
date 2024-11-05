/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Paymnet, PaymnetClient } from '../contracts/PaymnetClient'
import { useWallet } from '@txnlab/use-wallet'

/* Example usage
<PaymnetContract_redeem
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call contract_redeem"
  typedClient={typedClient}
  amount={amount}
/>
*/
type PaymnetContract_redeemArgs = Paymnet['methods']['contract_redeem(uint64)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: PaymnetClient
  amount: PaymnetContract_redeemArgs['amount']
}

const PaymnetContract_redeem = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling contract_redeem`)
    await props.typedClient.contract_redeem(
      {
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

export default PaymnetContract_redeem