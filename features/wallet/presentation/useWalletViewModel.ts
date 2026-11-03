import { useCallback, useRef, useState } from "react";
import { parseAddress } from "../domain/address";
import type { Portfolio } from "../domain/types";
import { createBalanceService, type BalanceService } from "../data/BalanceService";
import { SEPOLIA } from "../data/networks";

type Status = "idle" | "loading" | "ready" | "error";

const defaultService = createBalanceService(SEPOLIA);

export function useWalletViewModel(service: Pick<BalanceService, "getPortfolio" | "network"> = defaultService) {
  const [input, setInputState] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Ignores responses that arrive after the user switched or disconnected the address
  const requestId = useRef(0);

  const load = useCallback(
    async (target: string) => {
      const id = ++requestId.current;
      setStatus("loading");
      setError(null);
      try {
        const result = await service.getPortfolio(target);
        if (id !== requestId.current) return;
        setPortfolio(result);
        setStatus("ready");
      } catch {
        if (id !== requestId.current) return;
        setError("Could not reach the network. Try again.");
        setStatus("error");
      }
    },
    [service]
  );

  const setInput = useCallback((value: string) => {
    setInputState(value);
    setInputError(null);
  }, []);

  const watch = useCallback(
    async (value: string = input) => {
      const parsed = parseAddress(value);
      if (!parsed.ok) {
        setInputError(parsed.error);
        return false;
      }
      setAddress(parsed.address);
      setPortfolio(null);
      await load(parsed.address);
      return true;
    },
    [input, load]
  );

  const refresh = useCallback(async () => {
    if (address) await load(address);
  }, [address, load]);

  const disconnect = useCallback(() => {
    requestId.current++;
    setAddress(null);
    setPortfolio(null);
    setStatus("idle");
    setError(null);
    setInputState("");
  }, []);

  return {
    network: service.network,
    input,
    inputError,
    address,
    portfolio,
    status,
    error,
    setInput,
    watch,
    refresh,
    disconnect,
    explorerUrl: address ? `${service.network.explorerUrl}/address/${address}` : null,
  };
}
