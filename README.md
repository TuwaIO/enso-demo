# Tuwa x Enso: The Sovereign Transaction Layer

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19-blue)

This repository demonstrates the integration of **Tuwa's Ecosystem** (`Nova`, `Pulsar`, `Orbit`) with **Enso's Intent Engine**, creating a seamless, sovereign transaction layer for EVM networks. It serves as a reference implementation for building high-fidelity, privacy-preserving Web3 applications.

> "The open source software movement... is a new form of political organization and a new mode of production." — *The Sovereign Individual*

---

## ⚡ Core Architecture

This project is not just a demo; it is a **production-grade foundation** implementing the following Sovereign Architecture:

### 1. **Nova Connect** (Wallet Layer)
*   **Enterprise-Grade Connectivity**: Seamless multi-chain wallet management (EVM + Solana ready).
*   **Unified Identity**: Abstracting provider fragmentation into a cohesive user session.

### 2. **Enso Finance** (Routing Layer)
*   **Intent-Centric Execution**: Optimal routing across 100+ DEXs and aggregators.
*   **Gas Efficiency**: Smart routing that minimizes slippage and network costs.

### 3. **Pulsar Engine** (Transaction Layer)
*   **Lifecycle Tracking**: Real-time monitoring of transaction states (Pending, Confirmed, Failed) across generic and complex flows (Safe, Gelato).
*   **Optimistic UI**: Immediate feedback loops for superior UX.

### 4. **Tuwa Design System** (UI Layer)
*   **Zero-Compromise Aesthetics**: Built with **TailwindCSS v4** and `nova-uikit`.
*   **Adaptive Components**: Accessible, and responsive.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Directory, Turbopack)
*   **Language**: [TypeScript 5+](https://www.typescriptlang.org/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query/latest)
*   **Web3 Hooks**: [Wagmi](https://wagmi.sh/) + [Viem](https://viem.sh/)
*   **API Layer**: [tRPC](https://trpc.io/) (Type-safe API endpoints)

---

## 🚀 Quick Start

### Prerequisites
*   **Node.js**: >= 20.0.0
*   **pnpm**: >= 9.0.0

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Install dependencies
pnpm install

# 3. Setup Environment
cp .env.example .env
# Open .env and add your WalletConnect Project ID and Gelato Key
```

### Development

```bash
# Start the development server with Turbopack
pnpm dev
# App will leverage standard port 3000
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```
