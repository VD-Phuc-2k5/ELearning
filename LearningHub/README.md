# LearningHub

E-learning platform with a Next.js frontend and NestJS API backend.

## Prerequisites

- Node.js >= 20
- pnpm (install via `npm install -g pnpm`)

## Setup

```sh
pnpm install
```

## Run (development)

Start both the frontend and API in parallel:

```sh
# Frontend (Next.js) on http://localhost:4200
npx nx dev LearningHub

# API (NestJS) on http://localhost:8080
npx nx serve api
```

## Build

```sh
npx nx build LearningHub
npx nx build api
```

## Test

```sh
npx nx test LearningHub
npx nx test api
```

## Project Structure

```
apps/
├── LearningHub/    # Next.js frontend app
└── api/            # NestJS backend API
packages/
├── core/           # Shared core library
├── data/           # Data access library
└── domain/         # Domain logic library
```
