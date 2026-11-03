import { getAddress, isAddress } from "ethers";

export type ParseResult = { ok: true; address: string } | { ok: false; error: string };

/**
 * Validates user input and returns the EIP-55 checksummed address.
 * All-lowercase input is accepted; mixed-case input must have a valid checksum.
 */
export function parseAddress(input: string): ParseResult {
  const value = input.trim();
  if (!value) return { ok: false, error: "Enter a wallet address." };
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    return { ok: false, error: "An address is 0x followed by 40 hex characters." };
  }
  if (!isAddress(value)) return { ok: false, error: "Checksum mismatch. Check the address for typos." };
  return { ok: true, address: getAddress(value) };
}

/** 0x1234…abcd */
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= 2 + chars * 2) return address;
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}
