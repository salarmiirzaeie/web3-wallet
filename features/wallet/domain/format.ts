import { formatUnits } from "ethers";

/**
 * Formats an on-chain integer amount for display, keeping at most `maxFraction` decimals
 * and never showing a non-zero balance as "0".
 */
export function formatAmount(raw: bigint, decimals: number, maxFraction = 4): string {
  if (raw === 0n) return "0";
  const [whole, fraction = ""] = formatUnits(raw, decimals).split(".");
  const trimmed = fraction.slice(0, maxFraction).replace(/0+$/, "");
  if (whole === "0" && !trimmed) return `<0.${"0".repeat(maxFraction - 1)}1`;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}
