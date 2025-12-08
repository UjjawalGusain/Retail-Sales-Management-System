# Backend – Retail Sales Management System

This is the backend service for the Retail Sales Management System. It exposes filterable transaction queries and KPI endpoints over a PostgreSQL database using Express and Prisma.

## Tech Stack

- Node.js + TypeScript (ES modules, ES2020 target)
- Express
- Prisma ORM (`prisma-client-js` with `engineType = "client"`)
- PostgreSQL (via `pg` and `@prisma/adapter-pg`)

## Features

- Filterable, paginated transaction search (customer, product, date, status, tags, etc.)
- KPI endpoints:
  - Total units sold
  - Total revenue (total amount)
  - Total discount (totalAmount − finalAmount)
  - SR (sales records) counts for KPIs
- Typed request/response contracts shared with the frontend
- Indexed Prisma schema for performant analytics queries

## Deployment Notes

- `postinstall` runs `prisma generate` so the generated client is always up to date during builds.
- The Prisma generator is configured with `engineType = "client"` to avoid shipping Rust binaries and use the JS engine with a `pg` connection pool, which is better suited for serverless/Node runtimes.
- Make sure your deployment environment defines `DATABASE_URL` and `PORT` (if needed by your platform).

## API Contract

The backend uses the types in:

- `src/utils/RequestTypes/queryRequest.ts`
- `src/utils/ResponseTypes/queryResponse.ts`

to align with the frontend. If you add or change filters or response fields, update these types and the corresponding controller logic so both sides stay in sync.


