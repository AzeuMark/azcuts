# AzCuts — Implementation Tracker

> Log every completed phase/feature here as you build. Keep it in sync across **client** and **server**.
> Format: date · phase · what was done · notes. Mark checkboxes when a phase's Definition of Done (DoD) is met.

## Project
- **Name:** AzCuts — Barber Shop & Salon Management System
- **Stack:** MERN · DB: `azeubarbersalondb` @ `localhost:27017`
- **Head Dev:** Uelmark G. Valdehueza · **Assistants:** JM Nikko O. Gallardo, Lara Angel A. Habagat
- **Run:** client `npm start` · server `node server.js` / `nodemon server.js`

---

## SERVER PHASES
- [x] **Phase 0 — Skeleton** — folders, deps, app/server, DB connect, health route.
- [ ] **Phase 1 — Models & Auth** — models, JWT register/login/refresh/logout/me, middleware.
- [ ] **Phase 2 — Inventory** — services + extras CRUD + image upload + public GET.
- [ ] **Phase 3 — Scheduling & Booking core** — slots, pricing, create booking, receiptNo.
- [ ] **Phase 4 — State machine & Staff flow** — transitions, accept/reject/start/finish, auto-assign, cancel.
- [ ] **Phase 5 — Ratings** — rate after done + edit; recompute staff avg.
- [ ] **Phase 6 — Admin management** — dashboard, user/staff CRUD (20/pp), discounts, histories.
- [ ] **Phase 7 — Analytics & Reports** — aggregations, range filters, CSV/JSON export.
- [ ] **Phase 8 — System settings & mode gate** — settings CRUD, nicknames, offline/maintenance.
- [ ] **Phase 9 — Real-time** — Socket.io events.
- [ ] **Phase 10 — Hardening & Deployment** — rate limit, validation, deploy docs.

## CLIENT PHASES
- [x] **Phase 0 — Skeleton & design system** — router, providers, theme tokens + light/dark toggle, UI kit.
- [x] **Phase 1 — Auth & guards** — login/register, role-gated routes, silent refresh.
- [x] **Phase 2 — Landing page** — hero, services, about, contact, location.
- [x] **Phase 3 — Inventory display + booking data** — ServiceCard, SlotPicker, StaffPicker.
- [x] **Phase 4 — Booking wizard end-to-end** — 5 steps → receipt + PNG.
- [x] **Phase 5 — User history + ratings** — table, cancel, rating modal.
- [x] **Phase 6 — Staff portal** — dashboard lifecycle, shift, history/stats.
- [x] **Phase 7 — Admin portal** — dashboard, user manager, histories.
- [x] **Phase 8 — Admin inventory & settings** — inventory CRUD, system settings.
- [x] **Phase 9 — Analytics & reports** — charts, filters, export.
- [x] **Phase 10 — Real-time + polish** — sockets, toasts, a11y/responsive.
- [x] **Phase 11 — Deployment setup** — build + serve + prod config.

---

## LOG
| Date | Side | Phase | What was implemented | Notes |
|------|------|-------|----------------------|-------|
| 2026-07-15 | Client | Phase 0 | Skeleton & design system | Vite init, all deps, theme tokens (light/dark), 10 UI components, layout shell, contexts, routes, page stubs, Axios, React Query, Socket.io, no-flash theme script. Build passes. |
| 2026-07-15 | Client | Phase 1 | Auth & guards | Login with mode-block handling (503 alert), Register (customer-only), AuthContext (login/register/logout/refresh), ProtectedRoute + RoleGate, silent refresh via Axios interceptor, User Settings (profile + password forms). Build passes. |
| 2026-07-15 | Client | Phase 2 | Landing page | Full landing: hero with stats/badge, services gallery with category tabs (all/haircut/salon), about section with team, contact cards (phone/email/socials), location with embedded map + store hours, footer. Fetches from /settings/public. ServiceCard component created. Responsive + theme-aware. Build passes. |
| 2026-07-15 | Client | Phase 3 | Inventory display + booking data | ExtraChip, SlotPicker (date grid + time slots), StaffPicker (auto-assign + manual), StepIndicator, BookWizard steps 1-3 live (service select, extras multi-select, schedule with slot+staff). Running total bar. useBooking reducer. Steps 4-5 placeholder. Build passes. |
| 2026-07-15 | Client | Phase 4 | Booking wizard end-to-end | Payment step (Cash selectable, GCash disabled/coming soon), Confirm step (summary with service/extras/slot/staff/payment/total + disclaimer), ReceiptCard (header, receipt no, datetime, service, extras, staff, totals with discount/tax, payment, download PNG), appointment creation via API, success screen with receipt + new booking/history buttons. Build passes. |
| 2026-07-15 | Client | Phase 5 | User history + ratings | DataTable (sortable, paginated), StatusBadge (colored pills), RatingStars (interactive 1-5), User History page with appointment table, cancel dialog (reason input, pending/accepted only), rating modal (stars + comment, done only), receipt view modal, live socket updates (appointment:updated → auto-refresh + rating prompt). Build passes. |
| 2026-07-15 | Client | Phase 6 | Staff portal | Staff Dashboard (incoming panel with accept/reject + reject reason dialog, active queue with start/finish lifecycle, shift toggle button), Staff History (3 stat cards: total served, avg rating, completed; history table; ratings/comments list), Staff Settings (profile + password + nickname dropdown from Settings.nicknames). Socket live updates for appointment:new + appointment:updated. Build passes. |
| 2026-07-15 | Client | Phase 7 | Admin portal | Admin Dashboard (6 counter cards: active staff, in-service, customers today, sales today, pending, total today; recent appointments feed; socket live refresh), User Manager (paginated 20/pp DataTable, search + role filter, create/edit/delete users, staff role + nickname selection), Staff History (paginated with ratings), User History (paginated). Build passes. |
| 2026-07-15 | Client | Phase 8 | Admin inventory & settings | Inventory page (Services + Extras tabs, CRUD with image upload, active toggle, card grid for services, list for extras), System Settings (system mode selector with info, timezone/region/country/currency/tax/slotStep, store hours per weekday with open/close/closed, nickname manager add/remove, shop info form with name/tagline/phone/email/address/map/socials). Build passes. |
| 2026-07-15 | Client | Phase 9 | Analytics & reports | ChartPanel component (LineChartPanel, BarChartPanel, PieChartPanel using Recharts), Analytics page with 5 range filter tabs (daily/weekly/monthly/yearly/all-time), 4 KPI cards (revenue, appointments, customers, avg), 4 charts (sales over time, top services, status split pie, revenue by staff), CSV/JSON report export with blob download. Build passes. |
| 2026-07-15 | Client | Phase 10 | Real-time + polish | Global SocketEvents component (appointment:new, :updated, :assigned, dashboard:refresh, rating:added → toast notifications + query invalidation), themed Toaster, SocketContext with reconnection, skip-to-content link, aria landmarks (sidebar nav, main content, mobile nav), mobile sidebar drawer with hamburger menu + overlay, reduced-motion media query, responsive improvements. Build passes. |
| 2026-07-15 | Client | Phase 11 | Deployment setup | Vite config (chunkSizeWarningLimit), .env.production template, DEPLOY.md with 4 deployment options (Vercel, Netlify, Nginx, Express), vercel.json SPA rewrites, public/_redirects for Netlify, CORS checklist, post-deploy checklist. Build passes. |
| 2026-07-15 | Server | Phase 0 | Project skeleton | Express + Mongoose + all deps, config (env/db/bootstrap), middleware (error/validate), utils (ApiError/asyncHandler/response/logger), app.js + server.js, health route, .env, seed files moved. Server connects to MongoDB, /api/health returns 200. |
