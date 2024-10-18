"use client";
import { useWallet } from "@txnlab/use-wallet-react";
import { useAtom } from "jotai";
import React from "react";
import toast from "react-hot-toast";
import { usePaystackPayment } from "react-paystack";
import ModalTemplate from "~/components/modals/receive-crypto";
import { buttonVariants } from "~/components/ui/button";
import { amountAtom, receipientAtom } from "~/lib/jotai-atoms";
import { type TransactionData } from "~/lib/types/TransactionData";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import NiceModal from "@ebay/nice-modal-react";
import LoadingModal from "~/components/modals/loading-modal";
// import PaystackPop from "@paystack/inline-js";
const PaymentButton = () => {
  const { activeAccount } = useWallet();
  const { mutateAsync: makeCryptoTransfer } =
    api.payments.makePayment.useMutation({});

  const [recipientAddress, setRecipientAddress] = useAtom(receipientAtom);
  const [amount] = useAtom(amountAtom);
  const makePayment = usePaystackPayment({
    publicKey: process?.env?.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",

    amount: +amount * 100,
    email: "amachreeprince8@gmail.com",
  });

  return (
    <ModalTemplate
      onClick={async () => {
        // return await makeCryptoTransfer({
        //   paymentId: "YIAZAYLN73TRG5AKSCQR7E6JMMAMJHJJIWJEGUAJLPMRSZZVQR246Q6RPE",
        //   receiver: "YIAZAYLN73TRG5AKSCQR7E6JMMAMJHJJIWJEGUAJLPMRSZZVQR246Q6RPE",
        // });
        console.log({
          config: {
            amount: +amount * 100,
            email: "user@example.com",
          },
        });
        // const paystackInstance = new PaystackPop({
        //   config: {
        //     amount: +amount * 100,
        //     email: "amachreeprince8@gmail.com",
        //   },
        //   onSuccess: async (data: TransactionData) => {
        //     if (data?.status != "success") return alert(data?.message);
        //     NiceModal.show(LoadingModal);
        //     const val = await makeCryptoTransfer({
        //       paymentId: data?.trxref,
        //       receiver: recipientAddress,
        //     });
        //     NiceModal.remove(LoadingModal);
        //     toast.success(`Payment Successful ${val!}`, {
        //       // position:"c"
        //     });
        //     const notification = new Notification("Payment Successful", {
        //       body: `You received payment of ${amount} usdc to ${recipientAddress} \n
        //     Your crypto transaaction reference is ${val} \n
        //     Your bank transaction reference is ${data?.trxref}`,
        //     });
        //     // notification.show()
        //     console.log({ val });
        //   },
        // });
        makePayment({
          config: {
            amount: +amount * 100,
            email: "amachreeprince8@gmail.com",
          },

          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSuccess: async function (data: TransactionData) {
            if (data?.status != "success") return toast.error(data?.message);
            console.log({ data });
            NiceModal.show(LoadingModal, {}).catch(() => null);
            const val = await makeCryptoTransfer({
              paymentId: data?.trxref,
              receiver: recipientAddress,
            });
            console.log({ val });
            NiceModal.remove(LoadingModal);
            if (val?.status == "failed") {
              return toast.error(`Failed to make payment ${val.message}`, {});
            }

            toast.success(`Payment Successful ${val?.message}`, {});
            // const notification =
            new Notification("Payment Successful", {
              body: `You received payment of ${amount} usdc to ${recipientAddress} \n
            Your crypto transaction reference is ${val?.reference} \n
            Your bank transaction reference is ${data?.trxref}`,
            });
          },
        });
      }}
      className={cn(
        buttonVariants({ variant: "default", size: "lg", className: "" }),
      )}
      type="submit"
      disabled={!activeAccount}
    >
      Send Crypto
    </ModalTemplate>
  );
};

export default PaymentButton;
