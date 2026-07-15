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
- [ ] **Phase 0 — Skeleton** — folders, deps, app/server, DB connect, health route.
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
- [ ] **Phase 3 — Inventory display + booking data** — ServiceCard, SlotPicker, StaffPicker.
- [ ] **Phase 4 — Booking wizard end-to-end** — 5 steps → receipt + PNG.
- [ ] **Phase 5 — User history + ratings** — table, cancel, rating modal.
- [ ] **Phase 6 — Staff portal** — dashboard lifecycle, shift, history/stats.
- [ ] **Phase 7 — Admin portal** — dashboard, user manager, histories.
- [ ] **Phase 8 — Admin inventory & settings** — inventory CRUD, system settings.
- [ ] **Phase 9 — Analytics & reports** — charts, filters, export.
- [ ] **Phase 10 — Real-time + polish** — sockets, toasts, a11y/responsive.
- [ ] **Phase 11 — Deployment setup** — build + serve + prod config.

---

## LOG
| Date | Side | Phase | What was implemented | Notes |
|------|------|-------|----------------------|-------|
| 2026-07-15 | Client | Phase 0 | Skeleton & design system | Vite init, all deps, theme tokens (light/dark), 10 UI components, layout shell, contexts, routes, page stubs, Axios, React Query, Socket.io, no-flash theme script. Build passes. |
| 2026-07-15 | Client | Phase 1 | Auth & guards | Login with mode-block handling (503 alert), Register (customer-only), AuthContext (login/register/logout/refresh), ProtectedRoute + RoleGate, silent refresh via Axios interceptor, User Settings (profile + password forms). Build passes. |
| 2026-07-15 | Client | Phase 2 | Landing page | Full landing: hero with stats/badge, services gallery with category tabs (all/haircut/salon), about section with team, contact cards (phone/email/socials), location with embedded map + store hours, footer. Fetches from /settings/public. ServiceCard component created. Responsive + theme-aware. Build passes. |
