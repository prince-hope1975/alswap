import { z } from "zod";
import { Paystack } from "paystack-sdk";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getDollarRate, trasnferUsdcToAlgo } from "~/lib/wallet/utils";
import { env } from "~/env";
import { readFile } from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import { indexer } from "~/lib/wallet/utils/constants";
import { formatAmount } from "~/lib/utils";
import { db } from "~/server/db";
import { transactionDetails } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Transfer } from "paystack-sdk/dist/transfer/transfer";
import { TransferInitiated } from "paystack-sdk/dist/transfer/interface";
const paystack = new Paystack(env.PAYSTACK_SECRET_KEY);
const projectRoot = process.cwd();
const publicPath = path.join(projectRoot, "public");

export const paymentsRouter = createTRPCRouter({
  makePayment: publicProcedure
    .input(
      z.object({
        paymentId: z.string().min(1),
        receiver: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const transaction = await paystack.transaction.verify(input.paymentId);
      if (
        transaction?.status == false ||
        transaction?.message == "Transaction reference not found."
      )
        return {
          message: transaction?.message,
          success: transaction?.status,
          status: "failed",
        } as const;
      if (!!transaction.data?.amount && !!transaction.data?.reference) {
        const dollarRate = await getDollarRate();
        console.log({ dollarRate });
        const finalAmount = +dollarRate / (transaction?.data?.amount / 100);
        // Transfer transaction
        const response = await trasnferUsdcToAlgo(
          finalAmount * 10 ** 6,
          input?.receiver,
        );
        return {
          message: transaction?.message,
          success: true,
          status: "success",
          response,
          reference: transaction?.data?.reference,
        } as const;
      }
    }),
  pay: publicProcedure
    .input(
      z.object({
        blockchainTransactionId: z.string(),
        amount: z.number(),
        accountNumber: z.string(),
        code: z.string(),
        accountName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const params = JSON.stringify({
        type: "nuban",
        name: input.accountName,
        account_number: input.accountNumber,
        bank_code: input.code,
        currency: "NGN",
      });
      const receiver = await axios.post<TransferRecipientResponse>(
        "https://api.paystack.co/transferrecipient",
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      if (!receiver.data?.data?.active) {
        throw Error("Account not active");
      }
      try {
        const txn = await indexer
          .lookupTransactionByID(input.blockchainTransactionId)
          .do();

        const finalTxn = txn as Txn["txn"];

        if (!finalTxn) throw Error("Transaction not found");

        const instance = await db.query.transactionDetails.findFirst({
          where: eq(transactionDetails.txId, input.blockchainTransactionId),
        });
        if (instance?.txId)
          throw Error("Transaction already exist, don't try gaming the system");

        if (
          finalTxn?.transaction?.["asset-transfer-transaction"]?.amount ==
          formatAmount(input.amount)
        ) {
          await db.insert(transactionDetails).values({
            amount: input.amount?.toString(),
            txId: input.blockchainTransactionId,
            from: finalTxn?.transaction?.sender,
            to: finalTxn?.transaction?.["asset-transfer-transaction"]?.receiver,
            status: "completed",
            createdAt: new Date(),
          });

          const transfer = await paystack.transfer.initiate({
            amount: formatAmount(input.amount),
            recipient: receiver.data?.data?.recipient_code,
            source: "balance",
          });
          paystack.transfer.finalize(transfer.message);
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log(error);
        throw Error("Transaction not found");
      }
    }),


  getBanks: publicProcedure.query(async () => {
    const data = (await readFile(path.join(publicPath, "banks.json"))).toJSON();
    return data;
  }),
  getAccountInfo: publicProcedure
    .input(z.object({ code: z.string(), account: z.string().or(z.number()) }))
    .mutation(async ({ input }) => {
      const RecResponse = z.object({
        status: z.boolean(),
        message: z.string(),
        data: z.object({
          account_number: z.string(),
          account_name: z.string(),
          bank_id: z.number(),
        }),
      });
      const rec = await axios.get<typeof RecResponse._type>(
        `https://api.paystack.co/bank/resolve?account_number=${input.account}&bank_code=${input.code}`,
        {
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      return rec.data;
    }),
});
type TransferRecipientResponse = {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    details: {
      authorization_code: string | null;
      account_number: string;
      account_name: string | null;
      bank_code: string;
      bank_name: string;
    };
  };
};

type Txn = {
  txn: {
    "current-round": number;
    transaction: {
      "asset-transfer-transaction": {
        amount: number;
        receiver: string;
        sender?: string; // Optional if sender is sometimes omitted
        // Add other fields in 'asset-transfer-transaction' if needed
      };
      "close-rewards": number;
      "closing-amount": number;
      "confirmed-round": number;
      fee: number;
      "first-valid": number;
      "genesis-hash": string;
      "genesis-id": string;
      id: string;
      "intra-round-offset": number;
      "last-valid": number;
      "receiver-rewards": number;
      "round-time": number;
      sender: string;
      "sender-rewards": number;
      signature: {
        sig: string; // Assuming it's a base64 or hex encoded signature
        // Add any other fields in 'signature' if necessary
      };
      "tx-type": "axfer" | "pay" | "keyreg" | "acfg" | "afrz" | "appl";
    };
  };
};
