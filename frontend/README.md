# Retail Sales Management System: TruEstate Assignment

## Overview
SDE Intern Assignment for TruEstate implementing a Retail Sales Management System Dashboard with advanced search, multi-select filters, sorting, pagination, and real-time KPI metrics across structured sales data.

## Tech Stack

**Frontend:** TypeScript, Next.js 16 (App Router), React 19, shadcn/ui, SWR + Axios

**Backend:** TypeScript, Node.js, Express, Prisma ORM (`prisma-client-js`)

**Database:** PostgreSQL

## Dual-Mode Query Architecture

**Light Query (`/lightQuery`):** Paginated transactions only (no aggregates) - used when no KPI filters active  
**Heavy Query (`/heavyQuery`):** Paginated transactions + KPI metrics (units sold, total amount, discount, SR counts) - used on first mount, filter resets, and when KPI filters active

**Smart Endpoint Selection:** TableView computes `hasKpiFilters` + `forceHeavy` flag to choose optimal endpoint automatically.

## Search Implementation Summary

Full-text prefix search on `customerName` and `phoneNumber` using Prisma `startsWith` with `mode: 'insensitive'`. Integrated into main query via conditional customer relation filters. Supports concurrent operation with all filters/sorting/pagination without performance degradation.

## Filter Implementation Summary

Multi-select filters across 11 fields:
- **Arrays:** `customerRegion[]`, `gender[]`, `productCategory[]`, `paymentMethod[]`, `tags[]`
- **Ranges:** `minAge`/`maxAge`, `startDate`/`endDate`
- **Prefixes:** `customerNamePrefix`, `phonePrefix`
Dynamic `buildWhereClause` constructs nested Prisma `where` with relation filters. Empty arrays omitted. Reset clears all + sets `forceHeavy: true` for KPI refresh.

## Sorting Implementation Summary

Server-side sorting on 4 safe fields (`customerName`, `totalAmount`, `date`, `quantity`) mapped to Prisma `orderBy` with relation support (`customer.customerName`). Validates `orderByParam`/`orderByType` against allowlists, defaults to `customerName asc`. Preserves all filters/search state.

## Pagination Implementation Summary

Offset-based pagination (`skip`/`take`) with `limit` capped at 100 (default 10). Returns complete metadata: `total`, `totalPages`, `hasNext`/`hasPrev`, active `filters`. Numeric pagination with windowed page buttons + Previous/Next. Total count runs atomically with data via `prisma.$transaction`.

## KPI Implementation Summary

**Single-source truth:** Heavy query returns `metrics` object with `totalUnitsSold`, `totalAmount`, `totalDiscount`, `salesRecords`. TableView propagates via `onKpisUpdate` callback. Filter reset → immediate KPI clear + `forceHeavy` → fresh metrics on next heavy query.

# Setup Instructions

### 1. Install Root Dependencies

`npm install`

### 2. Generate Prisma Client (Backend)

`cd backend && npm run postinstall`

**Or manually:**
`cd backend && npx prisma generate`

### 3. Copy Environment Variables
`cp backend/.env.example backend/.env`

Update `backend/.env` with your `DATABASE_URL`.

### 4. Database Setup (First Time)
`cd backend && npx prisma db push`

### 5. Start Backend API (Port 5000)

`cd backend && npm run dev`

### 6. Start Frontend (Port 3000)

New terminal:
`cd frontend && npm run dev`
### 7. Access Dashboard

Open `http://localhost:3000`