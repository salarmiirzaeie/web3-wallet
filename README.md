# Web3 Wallet Viewer (React Native)

[![CI](https://github.com/salarmiirzaeie/web3-wallet/actions/workflows/ci.yml/badge.svg)](https://github.com/salarmiirzaeie/web3-wallet/actions/workflows/ci.yml)

A watch-only Ethereum wallet for iOS, Android and web, built with **Expo, TypeScript and ethers.js v6**. Paste any address to see its live ETH and ERC-20 balances on the Sepolia testnet. The app never asks for or stores a private key.

## Features

- **Address input with real validation**: format check plus EIP-55 checksum, so a mistyped mixed-case address is rejected instead of silently showing an empty wallet.
- **Live balances** of native ETH and ERC-20 tokens (Circle's USDC test token by default), read through JSON-RPC with `ethers`.
- **Resilient loading**: balances load in parallel and one failing token does not hide the others. Pull to refresh, retry on error, and responses that arrive after you switch or disconnect an address are ignored.
- **Readable amounts**: thousands separators, at most four decimals, and tiny non-zero balances shown as `<0.0001` instead of `0`.
- **Share the address**, open it in Etherscan, or **disconnect**.
- Light and dark mode follow the system setting.

## Architecture

```
features/wallet/
  domain/          pure logic: address parsing and checksum, amount formatting, types
  data/            BalanceService + ChainReader (ethers JsonRpcProvider and ERC-20 contract), network config
  presentation/    useWalletViewModel (state and side effects), WalletScreen and BalanceCard (rendering only)
  __tests__/       unit tests for each layer
app/               Expo Router routes
```

- **`ChainReader` interface**: the only code that touches the blockchain. `BalanceService` depends on the interface, so tests use a fake reader with no network.
- **ViewModel hook**: all state transitions (idle, loading, ready, error) and race-condition handling live in `useWalletViewModel`. Screens only render.
- **Network config as data**: chain ID, RPC URL, explorer and the token list are in `data/networks.ts`. Adding a token or a network does not touch UI code.
- **Read-only by design**: no key management, no signing. That keeps the attack surface at zero for a demo app.

## Getting started

```bash
npm install
npx expo start
```

Tap **Try a sample address** or paste your own. Get Sepolia test ETH and USDC from a faucet to see non-zero balances.

The app uses a public Sepolia RPC node by default. For reliable access, copy `.env.example` to `.env` and set `EXPO_PUBLIC_RPC_URL` to your own Alchemy or Infura endpoint.

## Tests

```bash
npm test
```

| Suite | What it covers |
|---|---|
| `domain.test.ts` | address validation and checksum, shortening, amount formatting edge cases |
| `service.test.ts` | balance formatting, one request per token, partial failures |
| `viewmodel.test.ts` | validation errors, loading flow, error and recovery, stale responses after disconnect |

CI runs the tests on every push and pull request.

## Roadmap

- WalletConnect (Reown AppKit) to connect an external wallet and sign transactions
- Mainnet and L2 networks with a network switcher
- Token list from a remote registry, with prices
- Transaction history via an indexer API

## Stack

Expo 54, React Native 0.81 (New Architecture), TypeScript, Expo Router, ethers.js 6, NativeWind and Gluestack UI, Jest and React Native Testing Library.
