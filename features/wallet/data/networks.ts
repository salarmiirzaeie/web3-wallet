import type { NetworkConfig } from "../domain/types";

export const SEPOLIA: NetworkConfig = {
  name: "Sepolia",
  chainId: 11155111,
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  explorerUrl: "https://sepolia.etherscan.io",
  nativeSymbol: "ETH",
  tokens: [
    {
      symbol: "USDC",
      name: "USD Coin (Circle testnet)",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
    },
  ],
};
