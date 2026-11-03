import { BalanceService, type ChainReader } from "../data/BalanceService";
import { SEPOLIA } from "../data/networks";

const ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const reader = (impl: Partial<ChainReader>): ChainReader => ({
  getNativeBalance: jest.fn(async () => 0n),
  getTokenBalance: jest.fn(async () => 0n),
  ...impl,
});

describe("BalanceService", () => {
  it("returns formatted native and token balances", async () => {
    const service = new BalanceService(
      SEPOLIA,
      reader({
        getNativeBalance: jest.fn(async () => 1_500_000_000_000_000_000n),
        getTokenBalance: jest.fn(async () => 42_000_000n),
      })
    );

    const portfolio = await service.getPortfolio(ADDRESS);

    expect(portfolio.address).toBe(ADDRESS);
    expect(portfolio.native).toMatchObject({ symbol: "ETH", status: "ok", formatted: "1.5" });
    expect(portfolio.tokens[0]).toMatchObject({ symbol: "USDC", status: "ok", formatted: "42" });
  });

  it("queries every configured token for the owner", async () => {
    const getTokenBalance = jest.fn(async () => 0n);
    await new BalanceService(SEPOLIA, reader({ getTokenBalance })).getPortfolio(ADDRESS);
    expect(getTokenBalance).toHaveBeenCalledTimes(SEPOLIA.tokens.length);
    expect(getTokenBalance).toHaveBeenCalledWith(SEPOLIA.tokens[0], ADDRESS);
  });

  it("keeps successful balances when one request fails", async () => {
    const service = new BalanceService(
      SEPOLIA,
      reader({
        getNativeBalance: jest.fn(async () => 10n ** 18n),
        getTokenBalance: jest.fn(async () => Promise.reject(new Error("fetch failed"))),
      })
    );

    const portfolio = await service.getPortfolio(ADDRESS);

    expect(portfolio.native.status).toBe("ok");
    expect(portfolio.tokens[0]).toMatchObject({ status: "error", error: "Network error. Pull to retry." });
  });
});
