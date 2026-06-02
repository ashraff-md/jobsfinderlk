# JobsFinder.lk

**The easiest and smartest way for Sri Lankans to find jobs and for companies to hire talent.**

JobsFinder.lk is a modern recruitment platform built for the Sri Lankan market. It combines advanced job discovery, employer verification, and AI-powered matching with a mobile-first experience and full trilingual support (English, Sinhala, Tamil).

This repository contains the full-stack application: a **Next.js** web frontend and a **NestJS** REST API, designed to deploy independently while sharing a common product vision documented in the project planning files.

---

## Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Documentation](#documentation)
- [Roadmap](#roadmap)

---

## Overview

JobsFinder.lk addresses gaps in existing Sri Lankan job portals: outdated interfaces, weak filtering, limited trust signals, and poor mobile experience. The platform is designed to compete on three core differentiators:

1. **Best-in-class search and filtering** — faceted job discovery with fast, relevant results.
2. **Verified employers and anti-scam protections** — moderation workflows and trust badges.
3. **AI-powered matching and application tracking** — intelligent recommendations and transparent hiring status.

The application follows a **separate frontend / backend** layout. The frontend consumes a versioned REST API documented via OpenAPI (Swagger).

---

## Current Status

**Milestone 0 (Foundation) — Complete**

| Area | Status |
|------|--------|
| Frontend scaffold (Next.js, Tailwind, route shells) | Done |
| Backend scaffold (NestJS, Prisma, auth & health) | Done |
| Database schema & initial migration | Done |
| Local infrastructure (Docker Compose) | Done |
| Design system tokens (Executive Talent Framework) | Done |
| Core UI implementation (M1) | Not started |

For a detailed checklist, see [PROGRESS.md](./PROGRESS.md).

---

## Features

### Implemented (Foundation)

- Next.js App Router with 19 route shells aligned to UI reference designs
- Executive Talent design system (Manrope typography, navy/blue palette)
- NestJS API with health checks, JWT auth skeleton, and Swagger docs
- PostgreSQL data model: users, companies, jobs, applications, seeker profiles
- i18n skeleton (English, Sinhala, Tamil message files)

### Planned

| Phase | Highlights |
|-------|------------|
| **M1 — Core Platform** | Job search, one-click apply, employer dashboard, admin moderation |
| **M2 — Growth** | Saved jobs, application tracker, PayHere subscriptions, internship hub |
| **M3 — AI** | CV parsing, match scoring, job recommendations, AI profile insights |
| **M4 — Launch** | Full trilingual UI, security hardening, PWA, production deployment |

---

## Tech Stack

### Frontend (`frontend/`)

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework, App Router, SSR/SEO |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Manrope](https://fonts.google.com/specimen/Manrope) | Brand typography |

### Backend (`backend/`)

| Technology | Purpose |
|------------|---------|
| [NestJS 11](https://nestjs.com/) | Modular REST API |
| [Prisma](https://www.prisma.io/) | ORM and database migrations |
| [PostgreSQL 16](https://www.postgresql.org/) | Primary datastore |
| [JWT](https://jwt.io/) | Authentication tokens |
| [Swagger / OpenAPI](https://swagger.io/) | API documentation |

### Infrastructure (local & planned production)

| Service | Local | Production (planned) |
|---------|-------|----------------------|
| PostgreSQL | Docker Compose | Managed Postgres |
| Redis | Docker Compose | Upstash / ElastiCache |
| Elasticsearch | Docker Compose | Elastic Cloud |
| File storage | — | Cloudflare R2 |
| Email | — | SendGrid |
| Payments | — | PayHere |

---

## Architecture

```
┌─────────────┐     REST / OpenAPI      ┌─────────────┐
│   Next.js   │ ◄──────────────────────►│   NestJS    │
│  Frontend   │                         │     API     │
└─────────────┘                         └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │ PostgreSQL │           │   Redis    │           │Elasticsearch│
             └────────────┘           └────────────┘           └────────────┘
```

Both applications run as separate processes and can be deployed to independent hosts (e.g. Vercel for frontend, Railway/Fly.io for API).

---

## Project Structure

```
JobsFinder.lk/
├── frontend/                 # Next.js web application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Shared UI components
│   │   ├── i18n/             # Locale configuration
│   │   ├── lib/              # Utilities and route metadata
│   │   └── messages/         # Translation files (en, si, ta)
│   └── public/
│
├── backend/                  # NestJS REST API
│   ├── prisma/               # Schema and migrations
│   └── src/
│       ├── modules/          # Feature modules (auth, health, …)
│       └── prisma/           # Prisma service
│
├── References/               # UI design reference HTML
├── docker-compose.yml        # Local Postgres, Redis, Elasticsearch
├── PROGRESS.md               # Build progress tracker
├── implementation.md         # Technical specification
└── JobsFinder.lk Project Launch Plan.md
```

---

## Prerequisites

Ensure the following are installed before running the project locally:

- **Node.js** 20 or later
- **npm** 10 or later
- **Docker Desktop** (for PostgreSQL, Redis, and Elasticsearch)

---

## Getting Started

### 1. Clone and start infrastructure

From the repository root:

```bash
docker compose up -d
```

This starts PostgreSQL (port **5433**), Redis (port `6379`), and Elasticsearch (port `9200`).

> **Note:** Postgres is mapped to port **5433** (not 5432) to avoid conflicts with a locally installed PostgreSQL on Windows.

### 2. Backend setup

```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run prisma:migrate      # Apply database migrations
npm run start:dev
```

| Endpoint | URL |
|----------|-----|
| API base | http://localhost:4000/api |
| Swagger docs | http://localhost:4000/api/docs |
| Health check | http://localhost:4000/api/health |

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

| Endpoint | URL |
|----------|-----|
| Web app | http://localhost:3000 |

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (default: `http://localhost:4000`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL (default: `7d`) |
| `PORT` | No | API port (default: `4000`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default: `http://localhost:3000`) |

> **Security:** Never commit `.env` or `.env.local` files. Replace all placeholder secrets before deploying to production.

---

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Run compiled production build |
| `npm run prisma:migrate` | Create and apply migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma database GUI |

---

## API Reference

Interactive documentation is available at **http://localhost:4000/api/docs** when the backend is running.

Current endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health and database connectivity |
| `POST` | `/api/auth/register` | Register a seeker or employer account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT tokens |

Additional modules (jobs, search, applications, admin) are defined in the roadmap and will be added in Milestone 1.

---

## Design System

The UI follows the **Executive Talent Framework** — a corporate-modern design system built for premium recruitment experiences.

- **Primary:** Deep Navy (`#0A1133`)
- **Secondary:** Action Blue (`#0051D5`)
- **Typography:** Manrope
- **Reference:** [References/executive_talent_framework/DESIGN.md](./References/executive_talent_framework/DESIGN.md)

HTML mockups for all major screens live in [References/](./References/) and serve as the visual source of truth during implementation.

---

## Documentation

| Document | Description |
|----------|-------------|
| [PROGRESS.md](./PROGRESS.md) | Milestone status and feature checklists |
| [implementation.md](./implementation.md) | Technical specification and phased feature plan |
| [JobsFinder.lk Project Launch Plan.md](./JobsFinder.lk%20Project%20Launch%20Plan.md) | Business plan, competitive analysis, and go-to-market strategy |

---

## Roadmap

Development is organised into five milestones over approximately 18 weeks:

| Milestone | Focus |
|-----------|-------|
| **M0** | Foundation — scaffolding, design system, database *(complete)* |
| **M1** | Core platform — auth, jobs, search, apply, admin |
| **M2** | Growth & monetization — subscriptions, tracker, content pages |
| **M3** | AI — CV parsing, match scoring, recommendations |
| **M4** | Launch — trilingual UI, security, PWA, production deploy |

Track progress in [PROGRESS.md](./PROGRESS.md).

---

## License

This project is proprietary and unlicensed. All rights reserved.
