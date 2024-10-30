import algosdk from "algosdk";

export const token = "";
export const server = "https://testnet-api.4160.nodely.dev";
export const port = 443;
export const client = new algosdk.Algodv2(token, server, port);
export const indexer = new algosdk.Indexer(token, server, port);
