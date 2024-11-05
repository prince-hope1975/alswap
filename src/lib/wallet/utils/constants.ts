import algosdk from "algosdk";
import config from "~/config";

export const token = "";
export const server = "https://testnet-api.4160.nodely.dev";
export const port = 443;
export const client = new algosdk.Algodv2(token, config.clients.main, port);
export const indexer = new algosdk.Indexer(token, config.clients.indexer, port);
