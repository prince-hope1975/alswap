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
      z.object({ blockchainTransactionId: z.string(), amount: z.number() }),
    )
    .mutation(async ({ input }) => {
      const txn = await indexer
        .lookupTransactionByID(input.blockchainTransactionId)
        .do();
      console.log({ txn });
      if(!txn) throw Error("Transaction not found")
        
      return txn
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
