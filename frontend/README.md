# Frontend – Retail Sales Management System

This is the frontend dashboard for the Retail Sales Management System. It visualizes retail transactions, filters, and KPIs using a modern React + Next.js stack.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind CSS v4 + custom design tokens
- **UI Library:** shadcn/ui + Radix UI primitives
- **Data Fetching:** SWR + Axios
- **Icons:** lucide-react, react-icons

## Features

- Interactive sidebar layout with static navigation sections.
- Filterable, paginated transaction table:
  - Filters by age range, date, tags, and other attributes.
  - Text search for quick narrowing of results.
- KPI cards for:
  - Total units sold
  - Total revenue
  - Total discount
  - SR (sales record) counts
- Friendly error and empty states with a “Clear Filters” action.
- Responsive design, including mobile-aware behavior.


### 5. API Integration

The frontend talks to the backend via Axios + SWR:

- Table data: `GET {API_BASE}?{filters & pagination}`
- KPIs:
  - `GET {API_BASE}/totalUnits`
  - `GET {API_BASE}/totalAmount`
  - `GET {API_BASE}/totalDiscount`

Make sure the backend is reachable from the URL you configure in `API_BASE`.

---

You can customize the layout, filters, and KPIs by editing the components under `src/components` and updating the shared types in `src/utils/types/queryResponse.ts` to stay aligned with the backend API.


