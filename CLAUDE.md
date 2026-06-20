# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

霓虹票务 (Neon Ticket Booking) - A concert ticket booking frontend built with Next.js 16, React 19, and TypeScript. Supports real-time stock polling, high-concurrency flash booking (抢单), and a payment step after ordering. Has separate user and admin interfaces.

## Development Commands

```bash
npm run dev      # Start dev server (port 3000); API rewritten to http://localhost:9000/api/*
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npx tsc --noEmit # Type check (no test framework in this repo)
```

Production API base: set `NEXT_PUBLIC_API_URL`. With it empty, requests use relative `/api/*` and Next rewrites to the gateway (see `next.config.ts`).

## Architecture

### Route Structure (App Router with route groups for access control)

- `src/app/(auth)/` - Public auth pages (login, register)
- `src/app/(user)/` - Protected user pages (concerts, orders, profile, **`orders/[orderNo]/pay`** payment page) - requires auth
- `src/app/admin/` - Protected admin pages (dashboard, concerts, orders, stock) - requires admin role
- `src/app/page.tsx` - Public landing page

Protected layouts (`(user)/layout.tsx`, `admin/layout.tsx`) enforce auth/role and redirect.

### Core Data Conventions (cross-cutting — the main source of bugs)

The backend and frontend disagree on two things; conversions live in the API layer and must NOT be skipped:

- **Money: backend stores integers in 分 (cents), frontend displays 元 (yuan).** Divide by 100 on read (`transformOrder` in `orders.ts`, `getConcertDetail`/`getAdminConcertDetail` in `concerts.ts`); multiply by 100 with `Math.round(... * 100)` on write (`createConcert`/`updateConcert`).
- **Ticket grades: backend field is `grades`, frontend field is `ticketGrades`.** Remapped in the concert detail API functions; create/update payloads send `grades`.
- All API responses are `ApiResult<T>` = `{ code, message, data }`; the `client.ts` `request()` helper unwraps `data` so domain functions return `T` directly. Non-200 `code` rejects with `{ status, message, code }`.

### Booking & Payment Flow (order lifecycle)

Booking is a flash-sale grab (`抢单`), then payment is a separate step:

1. **Book** `POST /api/order/book` → returns `orderNo`. Order is created in `0 处理中` (stock deducted async via Kafka, ~1–2s).
2. Frontend redirects straight to `/orders/{orderNo}/pay`, which **polls** `GET /api/order/{orderNo}` (1s interval, ≤10 attempts) until status leaves `0`.
3. `1 待支付` (pending) → user picks a channel and **initiates payment** `POST /api/order/{orderNo}/pay` (`initiatePayment` in `orders.ts`), returns `PayResponse`.
4. How `PayResponse.payUrl` is consumed depends on channel:
   - Mock cashier / WeChat H5 / WeChat Native → a real URL, open in a new window.
   - **Alipay Web/WAP → an auto-submitting `<form>` HTML string** (starts with `<`), must be written into a new window via `document.write`, NOT opened as a URL.
5. Payment success is written back by the backend (webhook for real channels, cashier button for mock); frontend just **polls** the order status for `2 已支付`.

Order status enum (`src/types/enums.ts`): `0 处理中 / 1 待支付 / 2 已支付 / 3 已取消 / 4 失败`. `OrderCard`'s 去支付 button deep-links into the payment page for pending orders. Payment channel/mode config: `PAY_CHANNELS` in `constants.ts`.

### State Management (Zustand, `src/stores/`)

- `authStore` - Auth state, persisted to localStorage (`auth-storage` key)
- `concertStore` - Concert data with detail caching
- `stockStore` - Real-time stock polling (`STOCK_POLLING_INTERVAL` = 3s)

### API Layer (`src/lib/api/`)

`client.ts` is an Axios instance whose request interceptor attaches `Authorization: Bearer <token>` from localStorage (checks both `token` and the persisted auth store). Domain modules: `auth.ts`, `concerts.ts`, `orders.ts`, `stock.ts`, `admin.ts`. Endpoint paths are centralized in `API_ENDPOINTS` (`constants.ts`) — all carry the `/api` gateway prefix.

### UI

`src/components/ui/` is shadcn/ui (Radix + Tailwind v4). Feature components live under `components/{concert,admin,order,layout}/`. Global styles use a neon/glass aesthetic (`glass`, `glass-strong`, `btn-neon`, `text-glow-blue` utilities).

### Authentication Flow

1. Login via `/login` → `authStore.login()` stores token in localStorage
2. Axios interceptor auto-attaches the Bearer header
3. 401 responses clear localStorage (`token`, `user`, `auth-storage`) so the next render bounces to login
