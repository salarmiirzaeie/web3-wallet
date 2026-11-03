export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  tokens: TokenConfig[];
}

export type Balance =
  | { symbol: string; name: string; status: "ok"; raw: bigint; formatted: string }
  | { symbol: string; name: string; status: "error"; error: string };

export interface Portfolio {
  address: string;
  native: Balance;
  tokens: Balance[];
  fetchedAt: number;
}
