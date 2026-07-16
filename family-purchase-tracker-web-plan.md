# Project Plan: Family Purchase & IOU Tracker (Web Edition)

## The Project
**Build a full-stack web app that tracks informal purchases made between extended family members** — the "I saw a deal, bought it for my cousin, we'll figure out who owes who later" pattern — replacing digging through text threads and doing math by hand with a live, always-current ledger.

Why this scoped-down version, compared to the mobile+OCR version we originally sketched out:
- It keeps everything that actually makes the project **yours** and interesting: a flat family-network data model instead of rigid groups, itemized purchases with multiple recipients per shopping trip, and derived (never stored) balance calculations
- It drops the two least-familiar, most time-consuming pieces (React Native/mobile-specific APIs, third-party OCR integration) without losing the core engineering signal — schema design, real auth, business logic, testing, deployment
- It's **realistically finishable** at your current experience level (core Java, everything else new) in a timeframe that actually fits a job-application cycle
- A web app is easier to demo live in an interview than a mobile app anyway — just a browser link, no phone/Expo Go dance

**Total estimated time: 6-8 weeks part-time, ~5-8 hrs/week** (compress to ~3 weeks if working full-time) — this accounts for you learning Spring Boot, SQL/JPA, JWT auth, and React largely from scratch, not just writing code you already know how to write.

---

## Tools You'll Need

**Workflow: Spring Boot backend, React (web, Vite) frontend, PostgreSQL via Docker, all in IntelliJ Ultimate.**

| Tool | Purpose | Cost |
|---|---|---|
| **IntelliJ IDEA Ultimate** | Main editor — built-in Spring Boot run support, DB tools, Docker integration, HTTP client | Free (student license) |
| **Docker Desktop** | Run PostgreSQL locally | Free |
| **Java 21 + Spring Boot 4** | Backend framework | Free |
| **PostgreSQL** | Relational database | Free |
| **Flyway** | Version-controlled schema migrations | Free |
| **Spring Security + JWT** | Authentication | Free |
| **JUnit5 + Mockito** | Backend testing | Free |
| **React + TypeScript (Vite)** | Frontend | Free |
| **IntelliJ's built-in HTTP Client** | Testing API endpoints as you build them (no separate Postman needed) | Free |
| **GitHub + GitHub Actions** | Version control + CI | Free |
| **Railway or Render** | Host backend + Postgres | Free tier |
| **Vercel or Netlify** | Host frontend | Free tier |

---

## Phase 0: Setup & Tooling (Days 1-3) — IntelliJ + Docker
- Generate the backend skeleton from Spring Initializr (Maven, Java 21, Spring Boot 4.x, dependencies: Web/WebMVC, Data JPA, PostgreSQL Driver, Validation)
- Open it in IntelliJ, let it import
- Write a `docker-compose.yml` for local Postgres, confirm `docker compose up -d` works
- Add DB connection details to `application.properties` (URL, username, password matching the Docker Compose file) — **do this before your first run**, so you don't hit the "no DataSource configured" crash
- Add a simple `/api/health` REST controller, run the app, confirm it responds
- Initialize a `frontend` folder with `npm create vite@latest` (React + TypeScript template), get it running (`npm run dev`), confirm it can successfully call `/api/health`
- Push both to GitHub, set up a bare-bones GitHub Actions workflow (just "run the build" for now)

**Time: ~4-6 hours** (a bit more than a fluent developer, since you're getting comfortable with IntelliJ + Docker for the first time)

---

## Phase 1: Database Schema & Migrations (Days 4-7) — IntelliJ
This is where you design the data model that makes the project distinct — no fixed groups, itemized multi-recipient purchases.

- `users` — id, name, email, password_hash
- `family_networks` — id, name, invite_code, created_by
- `network_members` — network_id, user_id (any member can transact with any other member — no sub-groups)
- `purchases` — id, network_id, purchaser_id, description, purchase_date, created_at
- `purchase_items` — id, purchase_id, description, cost (`NUMERIC(12,2)`), recipient_id
- `settlements` — id, network_id, paid_by, paid_to, amount, note, settled_at
- Write this as a Flyway migration (`V1__init_schema.sql`), with real foreign keys and constraints
- Create matching JPA `@Entity` classes
- Use IntelliJ's built-in Database tool window to connect to your local Postgres and visually confirm the tables look right after migrating

**Time: ~6-8 hours** (SQL/schema design and JPA mapping are both new concepts — budget real time to understand *why* the foreign keys/constraints matter, not just copy them)

---

## Phase 2: Auth — Register, Login, JWT (Days 8-13) — IntelliJ
Likely the single most conceptually new phase for you — auth involves several moving pieces working together (hashing, tokens, filters). Take it slow here.

- `POST /api/auth/register` — bcrypt-hash the password, reject duplicate email
- `POST /api/auth/login` — verify credentials, issue a JWT
- Spring Security filter chain validating the JWT on every protected request
- `GET /api/users/me` — sanity-check endpoint
- Frontend: registration form, login form, store the token, attach it to API calls
- Tests: duplicate registration rejected, wrong password rejected, valid login returns a usable token

**Time: ~8-10 hours** (budget the most extra time here of any phase — understanding *why* each piece of the security filter chain exists is worth the slowdown, don't just copy-paste a tutorial's config blindly)

---

## Phase 3: Family Networks (Days 14-17) — IntelliJ
This phase mostly reinforces patterns from Phase 2, so it should go faster relative to plan than earlier phases.

- `POST /api/networks` — create, generate invite code, creator auto-joins
- `POST /api/networks/join` — join via code
- `GET /api/networks` — list current user's networks
- `GET /api/networks/{id}/members` — 403 if requester isn't a member
- Frontend: "My Family Networks" screen, create/join flows, member list view
- Tests: non-member gets 403, invite codes unique, duplicate join rejected

**Time: ~5-6 hours**

---

## Phase 4: Logging Purchases — Itemized, Multi-Recipient (Days 18-25) — IntelliJ (the core of the project)
By this phase you're mostly fighting genuine logic problems rather than new frameworks — this is where your existing OOP background starts paying off directly.

- `POST /api/networks/{id}/purchases` — accepts purchaser, description, and a list of items (`{description, cost, recipientId}`); saves everything in one transaction
- Validation: every `recipientId` must be a network member; costs must be positive
- `GET /api/networks/{id}/purchases` — paginated list with item breakdown
- `DELETE /api/purchases/{id}` — soft delete, excluded from balance calculations
- Frontend: "Log a Purchase" form — add multiple items in one flow, each with its own cost and recipient picker (dropdown/multi-select from network members)
- Tests: multi-item purchase splits correctly across different recipients; a purchase where the purchaser is also a recipient works correctly; deleting a purchase removes its effect on balances

**Time: ~10-12 hours**

---

## Phase 5: Balances — Live, Per-Relationship Ledger (Days 26-29) — IntelliJ
- Build a `BalanceService` that derives net balances by folding over all non-deleted `purchase_items` (where `recipient_id != purchaser_id`) + `settlements` — never store a mutable balance, always recompute
- `GET /api/networks/{id}/balances` — pairwise net balances ("You owe Priya $32")
- `GET /api/users/me/balances` — balances across all of a user's networks
- Tests: opposite-direction purchases between the same pair net correctly; deleting a purchase updates balances correctly
- Frontend: dashboard showing balances at a glance, click into a person for full shared history

**Time: ~6-8 hours**

---

## Phase 6: Settlements (Days 30-32) — IntelliJ
- `POST /api/networks/{id}/settlements` — record a payment
- `GET /api/networks/{id}/settlements` — settlement history
- `BalanceService` treats settlements as real payments reducing debt
- Frontend: "Settle Up" form (amount pre-filled from current balance, editable)
- Tests: full settlement zeroes a balance, partial settlement reduces correctly, overpayment flips direction correctly

**Time: ~4-5 hours**

---

## Phase 7: Polish, Test, Deploy (Days 33-38) — IntelliJ
- Fill out remaining test coverage, especially `BalanceService` and the multi-item purchase logic
- Server-side validation everywhere
- Rate-limit auth endpoints
- Deploy backend + Postgres to Railway or Render, run migrations on deploy
- Deploy frontend to Vercel/Netlify, lock CORS to that exact frontend origin
- Write the real README: the actual family story as your problem statement, architecture diagram, ER diagram, screenshots, setup instructions, live demo link
- Optional: a short `ARCHITECTURE.md` explaining the flat-network-instead-of-groups decision and the derived-balances design — strong interview talking points
- **Get a couple of family members actually using it** — real usage is the differentiator no cloned project can match

**Time: ~6-8 hours**

---

## What You'll Be Able to Say on Your Resume Afterward

- *"Designed and built a full-stack expense-tracking web application solving a real recurring problem for my extended family, with a normalized PostgreSQL schema, Spring Boot REST API, JWT authentication, and a React/TypeScript frontend"*
- *"Designed a flat social-network data model (rather than fixed groups) supporting itemized, multi-recipient purchase attribution, with derived, always-current pairwise balance calculations"*
- *"Implemented JWT-based authentication with bcrypt password hashing and endpoint-level authorization checks"*
- *"Deployed and actively used the application with real users across multiple ongoing relationships"*

That last point is still the one no tutorial-clone project can compete with — real users, real usage, real proof the thing works end to end.

---

## A Few Tips
- **Budget the most extra time for Phase 2 (auth).** It's the most conceptually dense phase for someone new to the stack — several pieces (hashing, token issuance, filter chains, authorization) all have to click together, and that takes longer than it looks like it should on paper. Don't rush it.
- **Don't skip Phase 1 (schema design)** just because it feels like "just tables." A sloppy schema here creates rework in every later phase — get it right once.
- **Commit to GitHub after every phase**, not just at the end — a real commit history is itself a small resume signal, and it also means if something breaks badly you can always roll back to the last working phase.
- **If OCR or mobile still tempts you later**, treat them as genuine "if I have time and the core app is solid" stretch goals, not requirements — you can always add them after you already have a complete, working, deployed project to show.
