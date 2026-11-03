import { parseAddress, shortenAddress } from "../domain/address";
import { formatAmount } from "../domain/format";

const CHECKSUMMED = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

describe("parseAddress", () => {
  it("rejects empty and malformed input", () => {
    expect(parseAddress("   ")).toEqual({ ok: false, error: "Enter a wallet address." });
    expect(parseAddress("0x123")).toMatchObject({ ok: false });
    expect(parseAddress("d8dA6BF26964aF9D7eEd9e03E53415D37aA96045")).toMatchObject({ ok: false });
  });

  it("accepts lowercase input and returns the checksummed address", () => {
    expect(parseAddress(`  ${CHECKSUMMED.toLowerCase()} `)).toEqual({ ok: true, address: CHECKSUMMED });
  });

  it("rejects mixed-case input with a wrong checksum", () => {
    const broken = CHECKSUMMED.replace("dA6", "Da6");
    expect(parseAddress(broken)).toEqual({ ok: false, error: "Checksum mismatch. Check the address for typos." });
  });
});

describe("shortenAddress", () => {
  it("keeps the prefix and the last characters", () => {
    expect(shortenAddress(CHECKSUMMED)).toBe("0xd8dA…6045");
  });
});

describe("formatAmount", () => {
  it("formats whole and fractional amounts with grouping", () => {
    expect(formatAmount(0n, 18)).toBe("0");
    expect(formatAmount(1234567890000000000000n, 18)).toBe("1,234.5678");
    expect(formatAmount(2_500_000n, 6)).toBe("2.5");
    expect(formatAmount(1_000_000n, 6)).toBe("1");
  });

  it("never shows a tiny non-zero balance as zero", () => {
    expect(formatAmount(1n, 18)).toBe("<0.0001");
  });
});
