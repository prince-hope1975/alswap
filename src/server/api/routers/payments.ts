import { z } from "zod";
import { Paystack } from "paystack-sdk";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getDollarRate, trasnferUsdcToAlgo } from "~/lib/wallet/utils";
import { env } from "~/env";
const paystack = new Paystack(env.PAYSTACK_SECRET_KEY);

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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
