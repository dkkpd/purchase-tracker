# Purchase Tracker

A full-stack app for tracking informal purchases between extended family
members — the "I saw a deal, bought it for my cousin, we'll figure out who
owes who later" pattern that happens constantly in my extended family.
Right now it lives in text threads, paper receipts, and pen-and-calculator
math. This app is meant to replace all of that with one place where every
purchase lives, and balances are always correct and instantly visible.

This is a personal learning project, not a tutorial-follow-along. I'm
building the whole stack myself — schema, auth, business logic, deployment
— specifically so I actually understand it, not just so it works. This
README gets updated after every phase, including the real bugs I hit and
why, not a cleaned-up summary written after the fact.

**A note on structure:** this project doesn't really have a "baseline vs.
advanced" arc the way a model-training project does — there's no simpler
version to benchmark against, just infrastructure that either works or
doesn't yet. So instead of a baseline/advanced comparison, I'm tracking
progress phase by phase, and I'll introduce real before/after comparisons
once there's actual behavior worth comparing (e.g. naive vs. derived
balance calculations, once that exists).

---

## Tech Stack

- **Backend:** Java 21, Spring Boot 4.1.0, Maven
- **Database:** PostgreSQL 16, via Docker Compose
- **Schema migrations:** Flyway
- **ORM:** Spring Data JPA / Hibernate
- **Frontend:** React + TypeScript (Vite) — not started yet
- **IDE:** bouncing between VS Code and IntelliJ Ultimate (student license)

---

## Quick Start / Local Setup

### Prerequisites
- Java 21 (JDK)
- Docker Desktop
- Maven — or just use the bundled wrapper (`mvnw` / `mvnw.cmd`), no
  separate install needed

### 1. Clone the repo
```bash
git clone https://github.com/dkkpd/purchase-tracker.git
cd purchase-tracker/backend
```

### 2. Start the database
```bash
docker compose up -d
```
Pulls the official `postgres:16` image (first run only) and starts a
container named `purchase-tracker-postgres`, backed by a named Docker
volume so data survives container restarts.

Confirm it's actually running:
```bash
docker ps
```
Should list `purchase-tracker-postgres` with status `Up`.

**Why Docker, and why this early:** a database isn't something you bolt on
for deployment later — it's a runtime dependency the app needs in order to
function at all. There's no version of this app that works without a real
Postgres to talk to, so it gets set up before anything that depends on it,
not after.

### 3. Run the backend
Windows (no Maven installed globally):
```bash
.\mvnw.cmd spring-boot:run
```
Mac/Linux:
```bash
./mvnw spring-boot:run
```
Or just hit Run on `BackendApplication.java` in your IDE.

On startup, Flyway automatically runs any pending schema migrations
against the database — no manual `CREATE TABLE` step required.

### 4. Confirm it's working
```
http://localhost:8080/api/health
```
Should return:
```json
{"status":"ok","service":"purchase-tracker-backend","timestamp":"..."}
```

---

## Architecture & Design Decisions

### Why a flat family network instead of Splitwise-style groups
Real purchases in my family don't happen inside a defined "trip" or
"event" — anyone can spontaneously buy something for anyone else. Modeling
rigid groups (like most expense-splitting apps do) would force an
artificial boundary onto behavior that's naturally open. So instead: one
flat network per extended family, and any member can log a purchase
involving any other member in it. No sub-groups needed for a v1.

### Why itemized, multi-recipient purchases
A single shopping trip often has items for several different people at
once — some for me, some for my cousin, bought in one trip. Most
expense-splitting apps assume one expense gets split N ways evenly or by
percentage. That doesn't fit this case. So the schema models **one
purchase containing several line items, each independently tagged to its
own recipient** — a step up in relational complexity from a typical
"split this expense" model, but it actually matches how the purchases
happen in real life.

### The schema (Phase 1)

| Table | Purpose |
|---|---|
| `users` | Account + login credentials |
| `family_networks` | One record per extended family circle, with a unique invite code |
| `network_members` | Join table — who belongs to which network |
| `purchases` | One shopping event: who paid, when, which network |
| `purchase_items` | Line items within a purchase — description, cost, and who it's *for* |
| `settlements` | A payment between two people that reduces a balance |

**Design choices baked into the schema:**
- **`NUMERIC(12,2)` for every money column, never `FLOAT`.** Floats can't
  represent most decimal fractions exactly in binary, which causes real,
  silent rounding drift over time. Not acceptable for money between real
  people.
- **Real foreign keys everywhere** (e.g. `purchases.purchaser_id
  REFERENCES users(id)`). The database itself rejects an insert that
  references a user or network that doesn't exist — this is a safeguard
  against bad data that doesn't depend on my application code getting
  validation right every time.
- **`purchases.deleted_at` is a soft-delete column, not a real delete.**
  Deleting a purchase just sets a timestamp; the row stays in the database
  permanently for audit/history, and application logic filters out
  anything with `deleted_at IS NOT NULL` when computing balances.
- **Indexes added up front** on `purchases.network_id`,
  `purchase_items.purchase_id`, and `settlements.network_id` — these are
  lookups I already know will happen constantly (fetch all purchases for
  a network, all items for a purchase, all settlements for a network), so
  there's no reason to wait until performance becomes a visible problem.
- **Balances will be derived, never stored**, once that logic exists
  (Phase 5). Rather than keeping a mutable "balance" column that gets
  manually adjusted on every purchase/settlement, the plan is to always
  recompute balances fresh from the full history. More computation per
  read, but it eliminates an entire category of bug where a stored
  balance quietly drifts out of sync with reality.

---

## Progress Log

### Phase 0: Setup & Tooling — Done

Got the backend skeleton generated, a real local Postgres running in
Docker, the two wired together, and a `/api/health` endpoint proving the
whole chain (app → JPA → JDBC → Postgres) actually works end to end.

**What I noticed in practice — two real startup failures, both worth
remembering:**

1. **`Failed to configure a DataSource`.** Hit this before Docker/Postgres
   even existed yet. The moment `spring-boot-starter-data-jpa` is on the
   classpath, Spring tries to build a database connection object on
   startup, whether or not anything's ready. No database, no connection,
   immediate failure before any of my own code even ran.

2. **`Unable to determine Dialect without JDBC metadata`.** Sneakier one —
   by this point Postgres genuinely was running. Turned out my
   `application.properties` credentials didn't exactly match what
   `docker-compose.yml` had actually created the user/database with (I'd
   renamed something partway through and only updated one file).
   Hibernate opens a real connection on startup specifically to ask "what
   database are you, what dialect do you speak" — if that handshake fails
   for *any* reason, including bad credentials, this is the error you get,
   even though it reads like a SQL-dialect problem rather than the auth
   problem it actually was.

**General lesson:** if Spring Boot can't start because of the database,
it's almost always one of two things — the database isn't running, or it
is running but the app's connection details don't exactly match what it
was actually created with. Check both, in that order, before assuming
anything more exotic.

**Smaller thing I noticed:** `Map.of(...)` in Java gives no
ordering guarantee — my `/api/health` JSON came back with keys in a
different order than I wrote them. Purely cosmetic (JSON is unordered by
spec, real clients read fields by name not position), but a good reminder
that ordering in Java is something you explicitly ask for
(`LinkedHashMap`), never assumed.

### Phase 1: Database Schema & Migrations — Done (entities still pending)

Designed and wrote the full schema as a single Flyway migration
(`V1__init_schema.sql`) covering all six tables above, with real foreign
keys, `NUMERIC` money columns, a soft-delete column on `purchases`, and
indexes on the columns I know will be queried constantly. Confirmed
Flyway runs it automatically on app startup and correctly tracks it in its
own `flyway_schema_history` table.

**Still to do in Phase 1:** the JPA `@Entity` classes mapping these tables
to actual Java objects — schema's done, the Java-side mapping is next.

**What I noticed in practice — the Flyway migration that silently didn't
run:**

Added `flyway-core` and `flyway-database-postgresql` to `pom.xml`, wrote
the migration file, restarted the app — and got **no Flyway output at all
in the console.** Not an error, just complete silence, as if Flyway wasn't
there. Confirmed with `mvnw.cmd dependency:tree` that both dependencies
were genuinely resolved correctly, which ruled out "the jars aren't
actually there" as the cause. This was a super annoying bug that took me 2 
days to figure out. The cause was actually a dependency error that took 1
line to fix.

**General lesson so far:** a dependency being correctly resolved by Maven
doesn't mean the framework is actually *using* it — auto-configuration in
Spring Boot can be quietly conditional on things (file location, naming
convention, explicit properties) that aren't obvious from the dependency
list alone.

---
