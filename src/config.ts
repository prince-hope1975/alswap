export const testnetConfig = {
  network: "TESTNET",
  clients: {
    indexer: "https://testnet-idx.algonode.cloud",
    main: "https://testnet-api.4160.nodely.dev",
  },

  tokens: {
    algo: 0,
    usdc: 10458941,
    naira: 728460178,
  },
  admin: "WHGPBQEBPFBH4CFZWV6HYYYLWAXGQTEJ7Y5C7E7CYBWAYAAFQPP4YYWAC4",
};
export const mainnetConfig = {
  network: "MAINNET",
};

const config = testnetConfig;

export default config;
