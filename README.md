
# Retail Sales Management System: TruEstate Assignment

## Overview
SDE Intern Assignment for TruEstate implementing a Retail Sales Management System Dashboard with advanced search, multi-select filters, sorting and pagination across structured sales data.





## Tech Stack

**Frontend:** Typescript, NextJS, ReactJS, shadcn/ui, SWR

**Backend:** Typescript, NodeJS, ExpressJS, Prisma ORM

**Database:** PostgreSQL, Supabase




## Search Implementation Summary

Full-text prefix search on customerName and phoneNumber using Prisma startsWith with mode: 'insensitive' for case-insensitive matching. Integrated into main query via conditional customer relation filters. Supports concurrent operation with all filters/sorting without performance degradation.


## Filter Implementation Summary

Multi-select filters across 9 fields: **date range** (gte/lt), **paymentMethod** (exact), **customer** (gender, region, age range), **product** (category, tags via hasEvery). Dynamic where clause construction with nested relations prevents N+1 queries. Handles empty/invalid inputs gracefully via conditional checks.

## Sorting Implementation Summary

Server-side sorting on 4 fields (customerName, totalAmount, date, quantity) mapped to Prisma orderBy with relation support. Validates orderByParam/orderByType against allowlists, defaults to customerName asc. Preserves all active filters/search state in single optimized query.

## Pagination Implementation Summary

Standard offset-based pagination (skip/take) with fixed limit=10 (capped at 100). Returns full metadata: total, totalPages, hasNext/hasPrev. Query params persist across pages via filters response object. Total count runs efficiently alongside data query.
# Setup Instructions

### 1. Install Root Dependencies

Run in the project root:

```bash
npm install
```

### 2. Generate Prisma Client (Backend)

```bash
cd backend && npm run postinstall
```

**Or manually:**

```bash
cd backend && npx prisma generate
```

---

### 3. Copy Environment Variables

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your database credentials.


### 4. Start Backend API (Port 3001)

```bash
cd backend && npm run dev
```

### 5. Start Frontend (Port 3000)

Open a new terminal:

```bash
cd frontend && npm run dev
```

---
