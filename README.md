# Purchase Tracker

A full-stack app for tracking informal purchases between extended family
members — the "I saw a deal, bought it for my cousin, we'll figure out who
owes who later" pattern. Built to replace digging through text threads and
doing balance math by hand with a live, always-current ledger.

This is a personal learning project. I'm building the whole stack myself —
schema design, auth, business logic, deployment — specifically to
understand how it all actually works, not just to end up with a finished
app. This README gets updated after every phase, including the bugs I hit
and why I made the calls I made, not just a final summary.

---

## Tech Stack

- **Backend:** Java 21, Spring Boot 4.1.0, Maven
- **Database:** PostgreSQL 16, via Docker Compose
- **ORM:** Spring Data JPA / Hibernate
- **Frontend:** React + TypeScript (Vite) — not yet started
- **IDE:** IntelliJ IDEA Ultimate

---

## How to Run This Project Locally

### Prerequisites
- Java 21 (JDK)
- Docker Desktop
- Maven (or use the bundled `mvnw` wrapper — no separate install needed)

### 1. Clone the repo
```bash
git clone https://github.com/dkkpd/purchase-tracker.git
cd purchase-tracker/backend
```

### 2. Start the database
```bash
docker compose up -d
```
This pulls the official `postgres:16` image (first run only) and starts a
container named `purchase-tracker-postgres`, with a named Docker volume so
your data survives container restarts. Confirm it's running:
```bash
docker ps
```
You should see `purchase-tracker-postgres` listed with status `Up`.

### 3. Run the backend
Via IntelliJ: open the `backend` folder, let Maven finish importing, then
run `BackendApplication.java` directly.

Or from the terminal:
```bash
./mvnw spring-boot:run
```

### 4. Confirm it's working
```
http://localhost:8080/api/health
```
Should return:
```json
{"status":"ok","service":"purchase-tracker-backend","timestamp":"..."}
```

---

## Progress Log

### Phase 0: Setup & Tooling — In Progress

**Done:**
- Generated the backend skeleton via Spring Initializr (Spring Web/WebMVC,
  Spring Data JPA, PostgreSQL Driver, Validation)
- Local PostgreSQL 16 running via Docker Compose, with a persistent named
  volume
- Spring Boot connected to it via `application.properties`
- Built `/api/health` — a minimal REST endpoint confirming the whole chain
  (app → JPA → JDBC → Postgres) actually works end to end
- Confirmed a clean startup and a correct response from the endpoint

**Still to do:**
- React (Vite) frontend, wired up to call `/api/health`

**What actually went wrong, and why it's worth remembering:**

Hit two separate startup failures before this worked, both worth keeping
as reference since I'll recognize the pattern faster next time:

1. **`Failed to configure a DataSource`** — happened before I'd set up
   Docker/Postgres at all. Including `spring-boot-starter-data-jpa` makes
   Spring try to build a database connection object (a "DataSource") the
   moment the app starts, whether or not you're actually ready to use it
   yet. No database existed yet, so it had nowhere to connect and failed
   immediately, before any of my own code even ran.

2. **`Unable to determine Dialect without JDBC metadata`** — this one was
   sneakier, since by this point Postgres genuinely was running. Turned
   out my `application.properties` credentials didn't exactly match what
   `docker-compose.yml` had actually created the database/user with (I'd
   renamed things partway through and one file didn't get updated).
   Hibernate tries to open a real connection on startup specifically to
   ask the database "what are you, what dialect of SQL do you speak" — if
   that handshake fails for any reason (including bad credentials), you
   get this exact error, which reads more like a SQL-dialect problem than
   the auth problem it actually was.

**General lesson:** if a Spring Boot app can't start because of the
database, it's almost always one of these two things — either the
database genuinely isn't running yet, or it is running but your app's
connection details (URL/username/password) don't exactly match what it
was actually created with. Worth checking both, in that order, before
assuming anything more exotic is wrong.

**Also learned along the way (not a bug, just a good "why" to remember):**
`Map.of(...)` in Java gives no ordering guarantee at all — the JSON keys
in the `/api/health` response came back in a different order than I wrote
them in the code. Cosmetic only (JSON objects are unordered by spec, and
any real client reads fields by name, not position), but a good reminder
that in Java, ordering is something you have to explicitly ask for
(`LinkedHashMap`), never assumed.

---

## Design Decisions (living section — will expand every phase)

- **PostgreSQL over MySQL.** For this project's actual scale either would
  work fine, so I want to be honest that this isn't a dramatic difference
  — I picked Postgres mainly for its stricter enforcement of data
  integrity and more reliable precise-decimal handling, which matters
  since the app stores real money values and I want the database itself
  to be a safeguard against bad data, not just my own application code.

- **Docker for the database from day one, not bolted on at the end.**
  Unlike, say, containerizing a finished app for deployment, a database is
  a runtime dependency my code needs in order to function at all — there's
  no version of this app that works without a real database to talk to,
  so it made sense to set this up before writing anything that depends on
  it, rather than retrofitting it later.

- **Flat family network instead of rigid Splitwise-style groups.**
  Purchases in real life happen spontaneously between any two family
  members — there's no natural "trip" or "event" boundary. So instead of
  modeling fixed groups, the schema (Phase 1) will use one flat network
  per extended family, where any member can log a purchase involving any
  other member.

- **Itemized, multi-recipient purchases.** A single shopping trip often
  has items for multiple different people in one transaction (some for
  me, some for my cousin). This will be modeled as one purchase with
  several line items, each independently tagged to a recipient — a step
  up from the typical "split one expense N ways" model.

- **Balances will be derived, never stored.** Balances will always be
  computed fresh from the full history of purchases + settlements, rather
  than stored as a mutable value that gets manually adjusted on every
  change. More computation on every read, but it removes an entire class
  of bugs where a stored balance quietly drifts out of sync with reality.
