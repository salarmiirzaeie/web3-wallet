import { act, renderHook } from "@testing-library/react-native";
import { SEPOLIA } from "../data/networks";
import type { Portfolio } from "../domain/types";
import { useWalletViewModel } from "../presentation/useWalletViewModel";

const ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const portfolio = (address: string): Portfolio => ({
  address,
  native: { symbol: "ETH", name: "Sepolia Ether", status: "ok", raw: 1n, formatted: "<0.0001" },
  tokens: [],
  fetchedAt: 0,
});

const fakeService = (getPortfolio = jest.fn(async (a: string) => portfolio(a))) => ({ network: SEPOLIA, getPortfolio });

describe("useWalletViewModel", () => {
  it("shows a validation error and does not query the chain for bad input", async () => {
    const service = fakeService();
    const { result } = renderHook(() => useWalletViewModel(service));

    act(() => result.current.setInput("0xnope"));
    await act(async () => {
      await result.current.watch();
    });

    expect(result.current.inputError).toMatch(/40 hex characters/);
    expect(service.getPortfolio).not.toHaveBeenCalled();
    expect(result.current.address).toBeNull();
  });

  it("watches a valid address and loads its portfolio", async () => {
    const service = fakeService();
    const { result } = renderHook(() => useWalletViewModel(service));

    await act(async () => {
      await result.current.watch(ADDRESS.toLowerCase());
    });

    expect(service.getPortfolio).toHaveBeenCalledWith(ADDRESS);
    expect(result.current.address).toBe(ADDRESS);
    expect(result.current.status).toBe("ready");
    expect(result.current.explorerUrl).toBe(`https://sepolia.etherscan.io/address/${ADDRESS}`);
  });

  it("moves to the error state when loading fails, and recovers on refresh", async () => {
    const getPortfolio = jest
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementation(async (a: string) => portfolio(a));
    const { result } = renderHook(() => useWalletViewModel(fakeService(getPortfolio)));

    await act(async () => {
      await result.current.watch(ADDRESS);
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.status).toBe("ready");
  });

  it("ignores a response that arrives after disconnect", async () => {
    let resolve!: (p: Portfolio) => void;
    const getPortfolio = jest.fn(() => new Promise<Portfolio>((r) => (resolve = r)));
    const { result } = renderHook(() => useWalletViewModel(fakeService(getPortfolio as any)));

    let pending!: Promise<boolean>;
    act(() => {
      pending = result.current.watch(ADDRESS);
    });
    act(() => result.current.disconnect());
    await act(async () => {
      resolve(portfolio(ADDRESS));
      await pending;
    });

    expect(result.current.address).toBeNull();
    expect(result.current.portfolio).toBeNull();
    expect(result.current.status).toBe("idle");
  });
});
