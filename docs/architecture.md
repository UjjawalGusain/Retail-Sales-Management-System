
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
      - Total units sold (sum of `quantity`)
      - Total revenue (sum of `totalAmount`)
      - Total discount (sum of `totalAmount - finalAmount`)
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

- The frontend sends a request with filters and pagination parameters to `/api/query` (for example, age range, region, tags, order status, date range).
- The Express route forwards the request to the corresponding controller function.
- The controller constructs a Prisma `where` object and `orderBy` definition based on validated query parameters.
- Prisma executes the query against PostgreSQL using the shared `PrismaClient` and connection pool.
- Results are mapped into a normalized API response shape (rows + meta such as total count, current page, and KPI aggregates) and returned as JSON.

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

- The user interacts with the **Filter Bar** (age range, gender, customer region, tags, order status, date range, etc.).
- Filter state is stored in React at the page level and updated via debounced handlers to avoid rapid re-queries.
- The current filter state is serialized into a query string (including pagination and sort options) that becomes the key for SWR data fetching.

### 2. Frontend Requests → Backend API

- The **Transactions table** uses SWR + Axios to call the backend endpoint:
  - `GET /api/query?{filters & pagination}`
- The **KPI cards** call dedicated endpoints:
  - `GET /api/query/totalUnits`
  - `GET /api/query/totalAmount`
  - `GET /api/query/totalDiscount`
- SWR uses the query string as a cache key, deduping identical requests and preserving previous data during revalidation.

### 3. Backend Controllers → Prisma Queries

- Express routes in `src/routes/query.route.ts` forward requests to controller functions in `src/controllers/query.controller.ts`.
- Controllers:
  - Parse and validate query parameters (page, pageSize, sort, filters).
  - Build Prisma `where`, `orderBy`, `skip`, and `take` objects for the `Transaction` model and its relations (`Customer`, `Product`).
  - For KPIs, use Prisma aggregations:
    - `aggregate` with `_sum` on `quantity`, `totalAmount`, `finalAmount`.
    - `count` for SR (sales record) counts.
- Prisma Client (via `PrismaClient` instance in `src/services/prismaClient.ts`) executes queries against PostgreSQL using the JS engine and `pg` connection pool.

### 4. Database Reads → Structured Responses

- PostgreSQL returns:
  - Filtered, paginated transaction rows with joined `Customer` and `Product` fields.
  - Aggregate results for total units, total revenue, total discount, and SR counts.
- Controllers shape a consistent JSON response:
  - For tables:
    - `data`: array of normalized transaction records.
    - `meta`: `{ totalCount, page, pageSize, hasNextPage, hasPrevPage }`.
  - For KPIs:
    - `totalUnitsSold`
    - `totalAmount` and `salesRecords`
    - `totalDiscount` and `discountRecords`
- Errors (validation, timeouts, database issues) are caught and returned as structured error responses.

### 5. Response Rendering → UI Updates

- SWR hooks in the frontend receive the JSON responses:
  - On **loading**: show skeletons/spinners in table and KPI cards.
  - On **success**: render rows, update KPIs, and sync pagination controls.
  - On **error**: render the shared `ErrorPage` component in error mode.
  - On **empty data**: render `ErrorPage` in empty mode with a “Clear Filters” callback.
- Because SWR caches by key, navigating between filters and pages reuses previously fetched data where possible, minimizing latency and reducing backend load.


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
  Wires HTTP endpoints (e.g. `GET /api/query`, `GET /api/query/totalAmount`) to controller functions. It defines the public REST surface of the backend, leaving validation and DB logic to the controllers.

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
  Root layout for the Next.js app. It sets up HTML structure, global providers (theme, fonts), and wraps all pages inside the sidebar shell and main content area.

- **`src/app/page.tsx`**  
  Main dashboard page. It composes the sidebar, filter bar, table view, and KPI cards into a single screen and owns the top-level filter and pagination state.

- **`src/components/Sidebar.tsx` + `src/components/ui/sidebar.tsx`**  
  Implement the vertical navigation sidebar using shadcn/Radix primitives. They render application identity (logo + user) and static nav sections such as “Services” and “Invoices”.

- **`src/components/FilterBar.tsx` + `src/components/FilterBar/**`**  
  Provide the user-facing filters for the table:
  - `AgeRange.tsx`: age range slider/inputs.
  - `Calendar.tsx`: date range selection.
  - `Tags.tsx`: multi-select tags control.  
  These components maintain local filter controls and propagate normalized filter state up to the page.

- **`src/components/TableView.tsx` + `src/components/TableView/**`**  
  Render the main transactions table and associated controls:
  - Fetch paginated data via SWR + Axios.
  - Display loading state, rows, and pagination controls.
  - `CopyButton.tsx`: copies the current row or query info to clipboard.
  - `ErrorPage.tsx`: shared error/empty-state view for table queries.

- **`src/components/ui/**`**  
  Shadcn-based UI primitives (button, card, input, table, tooltip, etc.) that provide a consistent design system across the app. All higher-level components compose these primitives rather than raw HTML elements.

- **`src/components/Search.tsx`**  
  Search input for quick text-based filtering (e.g. by customer name or product), feeding into the same query string builder used by the Filter Bar.

- **`src/hooks/use-mobile.ts`**  
  Custom hook for detecting mobile viewport and toggling responsive behavior (e.g. collapsing the sidebar or adjusting layout for small screens).

- **`src/utils/buildQueryString.ts`**  
  Serializes the current filter + pagination + sort state into a query string consumed by the backend (`/api/query?...`). Centralizes URL construction so table, KPIs, and deep-linking all share the same logic.

- **`src/utils/types/queryResponse.ts`**  
  Frontend mirror of the backend response types, ensuring that components rendering table rows and KPIs stay in sync with the API contract.

- **`src/lib/utils.ts`**  
  Shared frontend utility functions (for example, class name merging, formatting helpers) used across components and hooks.

- **`src/app/loading.tsx` & `src/app/globals.css` / `src/styles/globals.css`**  
  `loading.tsx` shows a global loading skeleton for route transitions; the CSS files define design tokens and global styles that underpin all components.

