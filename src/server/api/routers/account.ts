import { z } from "zod";
import { getAccountInfo, getDollarRate } from "~/lib/wallet/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const accountRouter = createTRPCRouter({
  getDollarRate: publicProcedure
    .query(() => {
      return getDollarRate();
    }),
  getDollarRateMutation: publicProcedure
    .mutation(() => {
      return getDollarRate();
    }),
  accountInfo: publicProcedure
    .input(z.object({ addr: z.string().min(58) }))
    .query(({ input }) => {
      
      return getAccountInfo(input.addr);
    }),
  accountInfoMutation: publicProcedure
    .input(z.object({ addr: z.string().min(58) }))
    .mutation(({ input }) => {
      return getAccountInfo(input.addr);
    }),
  validateAddress: publicProcedure
    .input(z.object({ addr: z.string() }))
    .query(({ input }) => {

      return getAccountInfo(input.addr);
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
