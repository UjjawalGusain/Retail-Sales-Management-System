
# Architecture 

## Overview
SDE Intern Assignment for TruEstate implementing a Retail Sales Management System Dashboard with advanced search, multi-select filters, sorting and pagination across structured sales data.

## Database Models
<img width="1528" height="781" alt="supabase-schema-pgzgogtknimitpobzibb" src="https://github.com/user-attachments/assets/c24655f2-d8b0-40e7-8ddd-e6c020f571e2" />


## Backend Architecture

The backend is a TypeScript + Express application deployed as a serverless/Node runtime, responsible for serving filtered analytics and transactional KPIs over a PostgreSQL database.

### Tech Stack

- **Runtime:** Node.js (ES modules, TypeScript compiled to ES2020)
- **Framework:** Express
- **ORM:** Prisma (new `prisma-client` / `prisma-client-js` with `engineType = "client"` and PostgreSQL driver adapter)
- **Database:** PostgreSQL (with connection pooling via `pg` / Prisma adapter)
- **Deployment:** Vercel (serverless/Node functions) + environment-based configuration via `dotenv`

### High-Level Design

- **API Layer (Express):**
  - `src/index.ts` boots the Express app, configures CORS, and registers routes under `/api/query`.
  - Routes are grouped in `src/routes` (for example, `query.route.ts`) and map HTTPS endpoints to controller methods.

- **Controller Layer:**
  - `src/controllers/query.controller.ts` contains request handlers for:
    - Paginated, filterable transaction queries
    - KPI endpoints such as:
      - Light Transaction Queries: Only query for pages without aggregations
      - Heavy Transaction Queries: Query for pages with aggregations
  - Controllers parse and validate query parameters, build Prisma filters, and shape JSON responses for the frontend.

- **Data Access Layer (Prisma):**
  - `src/services/prismaClient.ts` exports a shared `PrismaClient` instance configured with the PostgreSQL driver adapter and connection pool.
  - Prisma models are defined in `prisma/schema.prisma` (`Customer`, `Product`, `Transaction`), with enums for gender, region, customer type, and order status.
  - Prisma Client is generated into a dedicated output (for example, `prisma/generated/client`) and imported by controllers and services.

- **Database Schema:**
  - **Customer:** demographic and segmentation fields (age, gender, region, type), indexed by common filter dimensions.
  - **Product:** product metadata (category, tags, brand) with indexes on category and tags for efficient filtering.
  - **Transaction:** sales facts (quantities, prices, discounts, final amounts, payment method, date, store, salesperson) with composite indexes on date, payment method, and foreign keys to `Customer` and `Product`.

### Request Flow

- The frontend builds a query string from the current filters, pagination, and sort state, then calls either GET `/api/query/lightQuery?{filters & pagination}` or GET `/api/query/heavyQuery?{filters & pagination}` depending on the presence of KPI-related filters and the forceHeavy flag.​
- The Express route layer forwards the request to the appropriate controller method (getTransactionsLight or getTransactionsHeavy) based on the path.​
- The controller validates query parameters and constructs Prisma where, orderBy, skip, and take objects, then executes a Prisma transaction to fetch paginated rows plus either a count (light) or aggregations (heavy).​
- PostgreSQL returns filtered, joined Transaction records and, for heavy queries, aggregate metrics; the controller maps these into a normalized JSON response containing data, pagination, sort, and optional metrics objects.

### Performance & Reliability

- **Indexes:** Prisma schema defines indexes on frequently filtered columns (age, region, gender, productCategory, tags, date, paymentMethod, foreign keys) to keep complex analytics queries performant.
- **Connection Pooling:** Uses `pg` + Prisma driver adapter with a tuned pool size to avoid exhausting connections in serverless environments.
- **Timeout & Error Handling:** Controllers wrap Prisma calls in `try/catch` blocks and return structured error responses; platform-level timeouts protect against runaway queries.

## Frontend Architecture

The frontend is a Next.js 16 application built with React 19 and TypeScript, providing an interactive analytics dashboard over the retail sales data.

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **UI Library:** shadcn/ui
- **Data Fetching:** SWR + Axios

### High-Level Layout

- **Root Layout:** Defines global `<html>`/`<body>` structure, theme provider, fonts, and wraps the app with the sidebar shell.
- **Sidebar Shell:** Reusable layout component using shadcn’s `Sidebar` primitives:
  - App identity section (logo + app name + user)
  - Static navigation links (Dashboard, Nexus, Intake, etc.)
  - Grouped cards for “Services” and “Invoices”
- **Main Content Area:** Renders the transaction table, filters, KPI cards, and error/empty states inside the sidebar frame.

### UI Modules

- **Filter Bar:**  
  - Controlled filter state (customer demographics, product tags, order status, date range, etc.).
  - Debounced updates to avoid spamming backend with rapid filter changes.
  - Emits a query string consumed by the data table and KPI hooks.

- **Data Table:**  
  - Paginated transaction grid with sortable columns (customer, product, date, amount, status).
  - Uses SWR + Axios to call `/api/query` with the current filter query string.
  - Shows loading skeletons, inline error state, or a friendly “No results found” empty state component.

- **KPI Cards:**  
  - Cards for:
    - Total Units Sold
    - Total Revenue (Total Amount)
    - Total Discount
    - “SR” counts (number of sales records contributing to each KPI)
  - Each card fetches from dedicated backend endpoints (`/api/query/totalUnits`, `/totalAmount`, `/totalDiscount`) and formats numbers with localized currency/decimal display.

- **Error & Empty States:**  
  - Simple shared `ErrorPage` component with two modes:
    - `type="error"` for API/server errors (red icon, message).
    - `type="empty"` for “no results” (neutral styling, “Clear Filters” action).
  - “Clear Filters” button is wired via an `onClear` callback passed from the table view to reset filters.

### State Management & Performance

- **Local State:**  
  - Filters and pagination kept in React state at the page level.
  - UI-only state for component visibility and dialogs managed via hooks.

- **SWR Caching:**  
  - Global cache across table and KPIs for consistent, deduplicated requests.
  - `keepPreviousData` (or equivalent) behavior for smooth transitions between filter changes.

- **Optimizations:**  
  - Debounced filter changes to avoid query storms.
  - SWR `dedupingInterval` to coalesce identical requests.
  - Minimal re-renders by splitting components into focused, memoizable units (FilterBar, KPICard, DataTable, Sidebar).


## Data Flow

This section describes how data moves between the frontend, backend, and PostgreSQL database to serve analytics and KPI queries.

### 1. User Interaction → Filters

- The user interacts with the **Filter Bar** (age range, gender, customer region, tags, payment method, date range, search prefixes, etc.).
- Filter state is stored in React state at the page level (`FilterInterface & PaginationInterface`) and updated via direct handlers.
- `buildQueryString(filters)` serializes non-empty filters, pagination (`page`, `limit`), and sort (`orderBy`, `orderByType`) into a query string.
- On reset: `resetAllFilters` clears all filters to defaults, calls `onResetKpis()` to clear KPI display, and sets `forceHeavy: true` (client-side flag ignored by backend).

### 2. Frontend Requests → Backend API

- **TableView** uses SWR + Axios with conditional endpoint selection:
  - Computes `hasKpiFilters` from demographic, product, date range, and tag filters.
  - Uses `forceHeavy` flag from reset to force heavy queries.
  - Heavy: `GET /api/query/heavyQuery?{queryString}` (when `hasKpiFilters || forceHeavy`).
  - Light: `GET /api/query/lightQuery?${queryString}` (no KPI filters, no forceHeavy).
- SWR config: `{ dedupingInterval: 1000, revalidateOnFocus: false, keepPreviousData: true }` uses full endpoint URL as cache key.
- **KPIs** are populated from `metrics` in heavy query responses via `onKpisUpdate(data.metrics)` callback to parent state (no separate KPI endpoints).

### 3. Backend Controllers → Prisma Queries

- Express routes in `src/routes/query.route.ts` dispatch to `src/controllers/query.controller.ts`:
  - `/lightQuery` → `getTransactionsLight`
  - `/heavyQuery` → `getTransactionsHeavy`
- Controllers parse `TransactionsQueryParams`, validate pagination/sort, and use `buildWhereClause` for Prisma `where`.
- Both execute `prisma.$transaction`:
  - Light: `[transaction.findMany({...}), transaction.count({ where })]`
  - Heavy: `[transaction.findMany({...}), transaction.aggregate({ where, _sum: {quantity, totalAmount, finalAmount}, _count: true }), transaction.count({ where })]`
- `findMany` includes joined `customer` (name, phone, gender, age, region) and `product` (category) with `skip`/`take` for pagination.

### 4. Database Reads → Structured Responses

- PostgreSQL returns:
  - Light: paginated `Transaction` rows with relations + total count.
  - Heavy: paginated rows + aggregates (`_sum.quantity`, `_sum.totalAmount`, `_sum.finalAmount`, `_count`) + total count.
- Controllers shape consistent JSON:
  - `success: true`
  - `data: TransactionResponse[]` (with stringified `transactionId`)
  - `pagination: { page, limit, total, totalPages, hasNext, hasPrev, filters }`
  - `sort: { orderBy, orderByType }`
  - Heavy only: `metrics: { totalUnitsSold, totalAmount, totalDiscount, salesRecords }`
- `totalDiscount` computed as `totalAmount - finalAmount` sums; errors return `{ success: false, error: string }`.

### 5. Response Rendering → UI Updates

- SWR in TableView handles states:
  - **Loading**: renders global `<Loading />` skeleton.
  - **Error**: `ErrorPage type="error"` with `onClear={() => setFilters({ page: '1' })}`.
  - **Empty**: `ErrorPage type="empty"` with full filter reset action.
  - **Success**: renders shadcn Table, syncs pagination controls, calls `onKpisUpdate(data.metrics)` for KPI cards.
- KPI cards in FilterBar read parent `kpis` state:
  - Format `totalUnitsSold`, `₹{totalAmount.toLocaleString()} ({salesRecords} SRs)`, `₹{totalDiscount.toLocaleString()}`.
  - Show `—` when `kpis` is null (cleared on reset).
- Filter reset flow:
  1. `resetAllFilters` clears KPIs + sets `forceHeavy: true`.
  2. SWR key changes → heavy query fires with clean filters.
  3. Heavy response populates fresh `metrics` → KPIs update.
- SWR caching by endpoint URL dedupes identical requests and preserves table data during filter transitions.

## Folder Structure

```
backend/
    ├── prisma/
    │   ├── generated/
    │   │   └── client/ <-- automatically generated by prisma
    │   └── schema.prisma
    ├── src/
    │   ├── controllers/
    │   │   └── query.controller.ts
    │   ├── routes/
    │   │   └── query.route.ts
    │   ├── services/
    │   │   └── prismaClient.ts
    │   ├── utils/
    │   │   ├── RequestTypes/
    │   │   │   └── queryRequest.ts
    │   │   ├── ResponseTypes/
    │   │   │   └── queryResponse.ts
    │   │   └── putInitialData.ts
    │   └── index.ts
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── prisma.config.ts
    ├── README.md
    ├── tsconfig.json
    └── vercel.json <-- for deployment

frontend/
    ├── public/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── components/
    │   │   ├── FilterBar/
    │   │   │   ├── AgeRange.tsx
    │   │   │   ├── Calendar.tsx
    │   │   │   └── Tags.tsx
    │   │   ├── TableView/
    │   │   │   ├── CopyButton.tsx
    │   │   │   └── ErrorPage.tsx
    │   │   ├── ui/ <-- shadcn generated components
    │   │   ├── FilterBar.tsx
    │   │   ├── Search.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── TableView.tsx
    │   ├── hooks/
    │   │   └── use-mobile.ts
    │   ├── lib/
    │   │   └── utils.ts
    │   ├── styles/
    │   │   └── globals.css
    │   └── utils/
    │       ├── types/
    │       │   └── queryResponse.ts
    │       └── buildQueryString.ts
    ├── .gitignore
    ├── components.json
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── README.md
    └── tsconfig.json

.gitignore
package-lock.json
package.json
README.md
```


## Module Responsibilities

### Backend

- **`prisma/schema.prisma`**  
  Defines the core data model for `Customer`, `Product`, and `Transaction`, including enums (gender, region, customer type, order status) and indexes for high‑cardinality filters and date/payment queries. This schema is the single source of truth for the database structure and Prisma Client generation.

- **`prisma/generated/client/**`**  
  Generated Prisma Client code used to interact with PostgreSQL. It contains the typed client, models, input types, and enums that controllers and services depend on; it is never edited manually.

- **`src/services/prismaClient.ts`**  
  Creates and exports a singleton `PrismaClient` instance configured with the PostgreSQL driver adapter and connection pool. All database access in controllers flows through this module, centralizing connection management and Prisma configuration.

- **`src/controllers/query.controller.ts`**  
  Implements the main business logic for querying transactions and computing KPIs. It:
  - Parses and validates query parameters (filters, pagination, sorting).
  - Builds Prisma `where` and `orderBy` objects.
  - Executes transaction queries and aggregations (total units, total amount, total discount).
  - Maps raw Prisma results into typed API response objects defined in `ResponseTypes`.

- **`src/routes/query.route.ts`**  
  Wires HTTP endpoints (e.g. `GET /api/query`, `GET /api/query/lightQuery`) to controller functions. It defines the public REST surface of the backend, leaving validation and DB logic to the controllers.

- **`src/utils/RequestTypes/queryRequest.ts`**  
  Declares TypeScript types/interfaces for strongly typed query parameters (filters, pagination, sort keys). Controllers use these types to ensure consistent handling of request input.

- **`src/utils/ResponseTypes/queryResponse.ts`**  
  Defines TypeScript types for table and KPI responses, including row structure and meta fields like `totalCount` and SR counts. Both backend and frontend import these types to keep contracts aligned.

- **`src/utils/putInitialData.ts`**  
  Utility for seeding or importing initial data into the database (for example, bulk insert of customers/products/transactions), typically used once during setup or in maintenance scripts.

- **`src/index.ts`**  
  Entrypoint for the Express app. It:
  - Configures CORS and JSON handling.
  - Registers the `/api/query` routes.
  - Starts the HTTP server or is used as the handler entry in deployment.

---
### Frontend

- **`src/app/layout.tsx`**  
  Root layout for the Next.js app. Sets up HTML structure, global providers (theme, fonts), and wraps all pages inside the sidebar shell and main content area.

- **`src/app/page.tsx`**  
  Main dashboard page. Owns top-level `filters` (`FilterInterface & PaginationInterface`) and `kpis` (`KpiMetrics | null`) state. Composes Sidebar, FilterBar (passes `filters`, `setFilters`, `kpis`, `onResetKpis`), and TableView (passes `filters`, `setFilters`, `onKpisUpdate`).

- **`src/components/Sidebar.tsx` + `src/components/ui/sidebar.tsx`**  
  Vertical navigation sidebar using shadcn/Radix primitives. Renders app identity (logo + user) and static nav sections ("Services", "Invoices").

- **`src/components/FilterBar.tsx` + `src/components/FilterBar/**`**  
  User-facing filter controls with comprehensive reset:
  - Multi-select dropdowns: `customerRegion`, `gender`, `productCategory`, `paymentMethod`.
  - `AgeRange.tsx`: `minAge`/`maxAge` range inputs.
  - `Calendar.tsx`: `startDate`/`endDate` date range.
  - `Tags.tsx`: multi-select product tags.
  - Native select for `orderBy`/`orderByType`.
  - **Reset button**: `resetAllFilters` clears all filters to defaults, sets `forceHeavy: true`, calls `onResetKpis()` to clear KPI display immediately.

- **`src/components/TableView.tsx` + `src/components/TableView/**`**  
  SWR-powered transactions table with conditional endpoint logic:
  - Computes `hasKpiFilters` from demographic/product/date/tag filters + checks `filters.forceHeavy`.
  - Heavy endpoint (`/heavyQuery`) when `hasKpiFilters || forceHeavy`; light endpoint (`/lightQuery`) otherwise.
  - `useEffect` calls `onKpisUpdate(data.metrics)` when heavy response provides KPIs.
  - Renders shadcn Table, numeric pagination (`getVisiblePages`), `CopyButton.tsx` for phone numbers, `ErrorPage.tsx` for error/empty states.

- **`src/components/ui/**`**  
  Shadcn-based UI primitives (Table, Button, DropdownMenu, Checkbox, NativeSelect, etc.) providing consistent design system.

- **`src/components/Search.tsx`**  
  Text search inputs for `customerNamePrefix` and `phonePrefix`, feeding into the shared `buildQueryString` pipeline.

- **`src/hooks/use-mobile.ts`**  
  Custom hook for mobile viewport detection and responsive sidebar collapse.

- **`src/utils/buildQueryString.ts`**  
  Serializes filter + pagination + sort state into backend query string. Omits client-only flags like `forceHeavy` to maintain clean backend contracts.

- **`src/utils/types/queryResponse.ts`**  
  Frontend types mirroring backend responses: `TransactionsApiResponse`, `LightTransactionsApiResponse`, `TransactionResponse`, `KpiMetrics`.

- **`src/lib/utils.ts`**  
  Shared utilities (class name merging `cn()`, formatting helpers).

- **`src/app/loading.tsx`** **&** **`CSS files`**  
  Global loading skeleton for route transitions; `globals.css` defines design tokens and component styles.

