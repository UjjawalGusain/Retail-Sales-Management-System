# Backend – Retail Sales Management System

This is the backend service for the Retail Sales Management System. It exposes dual-mode (light/heavy) filterable transaction queries and KPI metrics over a PostgreSQL database using Express and Prisma.

## Tech Stack

- Node.js + TypeScript (ES modules, ES2020 target)
- Express
- Prisma ORM (`prisma-client-js` with `engineType = "client"`)
- PostgreSQL (via `pg` and `@prisma/adapter-pg`)

## Features

- **Dual-mode transaction queries:**
  - `GET /api/query/lightQuery`: Paginated transactions only (optimized for no KPI filters)
  - `GET /api/query/heavyQuery`: Paginated transactions + KPI aggregates in single response
- **KPI metrics** (returned in heavy query `metrics` object):
  - `totalUnitsSold` (sum of `quantity`)
  - `totalAmount` (sum of `totalAmount`) + `salesRecords` count
  - `totalDiscount` (sum of `totalAmount - finalAmount`)
- Advanced filtering: customer demographics (age range, gender, region), product category/tags, payment method, date range, name/phone prefixes
- Pagination with `skip`/`take`, safe sorting on whitelisted fields (`customerName`, `totalAmount`, `date`, `quantity`)
- Typed request/response contracts shared with frontend
- Indexed Prisma schema for performant analytics queries
- Atomic `prisma.$transaction` for consistent paginated + aggregate reads

## Endpoints

- `GET /api/query/lightQuery?{filters}&page=1&limit=10&orderBy=customerName&orderByType=asc`

- `GET /api/query/heavyQuery?{filters}&page=1&limit=10&orderBy=customerName&orderByType=asc`

- `GET /api/query/totalUnits (legacy KPI endpoint)`

- `GET /api/query/totalAmount (legacy KPI endpoint)`

- `GET /api/query/totalDiscount (legacy KPI endpoint)`

**Response shape (heavy query):**
```
{
"success": true,
"data": [TransactionResponse[]],
"pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10, "hasNext": true, "hasPrev": false, "filters": {} },
"sort": { "orderBy": "customerName", "orderByType": "asc" },
"metrics": {
"totalUnitsSold": 1250,
"totalAmount": 150000,
"totalDiscount": 12500,
"salesRecords": 100
}
}
```

## Deployment Notes

- `postinstall` runs `prisma generate` to ensure generated client is current during builds
- Prisma uses `engineType = "client"` (JS engine + `pg` pooling) optimized for serverless/Node runtimes
- Required env vars: `DATABASE_URL` (PostgreSQL connection string)
- Optional: `PORT` (platform-specific)

## API Contract

Core types in:
- `src/utils/RequestTypes/queryRequest.ts` → `TransactionsQueryParams`
- `src/utils/ResponseTypes/queryResponse.ts` → `TransactionsApiResponse`, `LightTransactionsApiResponse`, `TransactionResponse`, KPI interfaces

**Filter parameters** (all optional):
- Arrays: `customerRegion[]`, `gender[]`, `productCategory[]`, `paymentMethod[]`, `tags[]`
- Ranges: `minAge`, `maxAge`, `startDate`, `endDate`
- Prefixes: `customerNamePrefix`, `phonePrefix`
- Pagination: `page`, `limit` (max 100)
- Sort: `orderBy` (customerName|totalAmount|date|quantity), `orderByType` (asc|desc)

Update these types and controller `buildWhereClause` logic when adding new filters to keep frontend/backend in sync.
