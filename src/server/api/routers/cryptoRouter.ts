import algosdk from "algosdk";
import { z } from "zod";
import { getAccountInfo, getDollarRate } from "~/lib/wallet/utils";
import { indexer } from "~/lib/wallet/utils/constants";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const cryptoRouter = createTRPCRouter({
  getAdminAddress: publicProcedure
    // .input(z.object({ addr: z.string().min(58) }))
    .mutation(({}) => {
      const wallet = algosdk.mnemonicToSecretKey(process.env.WALLET_SEED!);
      return wallet.addr;
    }),
  getAssetBalancesMutation: publicProcedure
    .input(z.object({ addr: z.string().min(58) }))
    .mutation(async ({ input }) => {
      const values = await indexer.lookupAccountAssets(input.addr).do();
      return values as AssetHoldingsResponse;
    }),
  getAssetBalances: publicProcedure
    .input(z.object({ addr: z.string().min(58) }))
    .query(async ({ input }) => {
      const values = await indexer.lookupAccountAssets(input.addr).do();
      return values as AssetHoldingsResponse;
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
});
type AssetHolding = {
  amount: number;
  "asset-id": number;
  "is-frozen": boolean;
};

type AssetParams = {
  creator: string;
  decimals: number;
  "default-frozen": boolean;
  name: string;
  "name-b64": string;
  total: number;
  "unit-name": string;
  "unit-name-b64": string;
  url?: string;
  "url-b64"?: string;
  manager?: string;
  freeze?: string;
  reserve?: string;
};

type AssetHoldingsItem = {
  "asset-holding": AssetHolding;
  "asset-params": AssetParams;
};

type AssetHoldingsResponse = {
  "asset-holdings": AssetHoldingsItem[];
  round: number;
};
