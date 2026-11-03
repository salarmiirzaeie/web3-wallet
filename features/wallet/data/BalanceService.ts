import { Contract, JsonRpcProvider } from "ethers";
import { formatAmount } from "../domain/format";
import type { Balance, NetworkConfig, Portfolio, TokenConfig } from "../domain/types";

const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

export interface ChainReader {
  getNativeBalance(address: string): Promise<bigint>;
  getTokenBalance(token: TokenConfig, owner: string): Promise<bigint>;
}

/** Read-only chain access through a JSON-RPC endpoint. No keys, no signing. */
export class RpcChainReader implements ChainReader {
  private readonly provider: JsonRpcProvider;

  constructor(network: NetworkConfig) {
    // staticNetwork skips the chain-id probe on every call
    this.provider = new JsonRpcProvider(network.rpcUrl, network.chainId, { staticNetwork: true });
  }

  getNativeBalance(address: string) {
    return this.provider.getBalance(address);
  }

  async getTokenBalance(token: TokenConfig, owner: string): Promise<bigint> {
    const contract = new Contract(token.address, ERC20_ABI, this.provider);
    return (await contract.balanceOf(owner)) as bigint;
  }
}

const describe = (e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);
  return /network|fetch|timeout|ECONN/i.test(message) ? "Network error. Pull to retry." : "Could not load balance.";
};

export class BalanceService {
  constructor(
    readonly network: NetworkConfig,
    private readonly reader: ChainReader
  ) {}

  /** Loads all balances in parallel. One failing token does not hide the others. */
  async getPortfolio(address: string): Promise<Portfolio> {
    const nativeTask = this.reader.getNativeBalance(address);
    const tokenTasks = this.network.tokens.map((t) => this.reader.getTokenBalance(t, address));
    const [native, ...tokens] = await Promise.allSettled([nativeTask, ...tokenTasks]);

    const toBalance = (r: PromiseSettledResult<bigint>, symbol: string, name: string, decimals: number): Balance =>
      r.status === "fulfilled"
        ? { symbol, name, status: "ok", raw: r.value, formatted: formatAmount(r.value, decimals) }
        : { symbol, name, status: "error", error: describe(r.reason) };

    return {
      address,
      native: toBalance(native, this.network.nativeSymbol, `${this.network.name} Ether`, 18),
      tokens: tokens.map((r, i) => {
        const t = this.network.tokens[i];
        return toBalance(r, t.symbol, t.name, t.decimals);
      }),
      fetchedAt: Date.now(),
    };
  }
}

export const createBalanceService = (network: NetworkConfig) => new BalanceService(network, new RpcChainReader(network));
