# 🏅 Ethereum.org Collectibles

An application for managing and displaying Ethereum.org community badges and collectibles. Built on top of Scaffold-ETH 2.

## ✨ Features

- **Home Page Stats**: See live stats for total unique badges, total minted, and unique collectors.
- **Browse Badges by Year**: `/badges/[year]` — Explore all badges for a given year, grouped by category, with collectors count and badge details.
- **My Badges**: `/my-badges` — Connect your wallet to view all badges collected by your address, grouped by year.
- **Admin Panel**: `/admin` — Admins can add new badges with wallet signature verification.
- **API Endpoints**: RESTful endpoints for stats, badges, collectibles, and collectors.

## 🏃‍♂️ Quickstart

### Requirements
- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- PostgreSQL database (set `POSTGRES_URL` in your environment)

### Setup & Run

1. **Install dependencies:**
   ```bash
   yarn install
   ```
2. **Set up environment and config variables:**
   - Copy `.env.example` to `.env`. Set `POSTGRES_URL` to your database connection string and `POAP_API_KEY` to be able to get information about new badges and collectors.
   - Set admin addresses at `packages/nextjs/scaffold.config.ts`.
3. **Start the app:**
   ```bash
   yarn start
   ```
4. **Visit your app:**
   - Home: [http://localhost:3000](http://localhost:3000)
   - Badges by year: `/badges/[year]`
   - My Badges: `/my-badges`
   - Admin: `/admin` (admin wallet required)

## 📡 API Endpoints (selected)

- `GET /api/stats` — Global stats (badges, collectors, unique addresses)
- `GET /api/stats/[address]` — Badges owned by an address
- `GET /api/badges` — All collectibles
- `GET /api/collectibles/[year]` — Badges for a specific year
- `POST /api/collectibles/new` — Add a new badge (admin only)
- `POST /api/collectors/[year]` — Sync collectors for a year (admin/cron)

## 🧰 Scaffold-ETH 2

_This project is built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) and extended for Ethereum.org community collectibles._

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Wagmi, Viem, and Typescript.
