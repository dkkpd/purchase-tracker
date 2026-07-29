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
- **Frontend:** React + TypeScript (Vite)
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

---

### Phase 1: Database Schema & Migrations — Done

Designed and wrote the full schema as a single Flyway migration
(`V1__init_schema.sql`) covering all six tables above, with real foreign
keys, `NUMERIC` money columns, a soft-delete column on `purchases`, and
indexes on the columns I know will be queried constantly. Confirmed
Flyway runs it automatically on app startup and correctly tracks it in its
own `flyway_schema_history` table.

**Notes:**
- Every `@ManyToOne` relationship uses `fetch = FetchType.LAZY` so that it is only fetched if the code requests it. This avoids the app silently runs extra queries even when we might not want it to. If I were to use EAGER, loading let's say 50 `Purchase` rows would also silently load 50 additional queries to get each purchaser. Using LAZY makes it so that it only loads the purchaser when we specifically request it.
- Every money field uses `BigDecimal` with `precision = 12, scale = 2` to match the `NUMERIC(12,2)` in the schema. This also aids in avoiding rounding errors.

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

**Bugs I encountered:**

- Migration checksum mismatch: After the initial schema was also migrated, I added some comments to the same V1 schema file, thinking it's just comments, nothing would change. However, when I restarted, Flyway refused to start at all, and I was so confused. Turns out, Flyway fingerprints every migration file's exact content, even comments, so even changing the comments suggests to Flyway that the schema was changed. Since at this stage the database was empty and there was nothing worth perserving, I could wipe the container entirely by running `docker compose down-v` then `docker compose up -d`. *Lesson for future: Once a migration's been applied, always make changes to the schema in new migration files, never make edits to a schema that's already been migrated to the databse, even if it's just comments.*
- Password auth failure after recreating container: After the above fix, I got another error `FATAL: password auth failed for user "purchase_tracker"`. I checked my application.properties file and the username and password appeared correct from my memory, but after I ran `docker exec -it purchase-tracker-postgres env`, I found out that there was a username mismatch.

---
### Phase 2: Auth — Register, Login, JWT — Done

Built out the full auth flow: registration with bcrypt-hashed passwords, a login
endpoint that issues a JWT, and a custom `JwtAuthenticationFilter` wired into
Spring Security's filter chain so protected endpoints actually enforce a valid
token instead of just pretending to.

I verified the filter chain was doing its job by temporarily pulling
`/api/health` off the permitted list and confirming a request without a valid
token got rejected while one with a valid token went through — then restored
it to `permitAll()`, since a health check should stay reachable regardless of
auth status.

### Design Decisions
- There are Data Transfer Objects(DTOs) at every API boundary.
- Explicitly set
  `SessionCreationPolicy.STATELESS` — the server never stores "who's logged
  in" anywhere; every request has to prove identity fresh via its token's
  signature.
- Same generic error message for "no such user" and "wrong password" to avoid giving clues on login
- **`LoginRequest` deliberately skips the `@Email`/`@Size` validation** that
  `RegisterRequest` has because at login, verifying if the email and password adhere to the expectations can potentially leak info about *why* login failed. A little caveat that I thought was neat.
- JWT secret pulled from an environment variable (`JWT_SECRET`) stored on my local machine.

### Bugs I encountered

**Bug 1: a typo that broke exception handling.**
I accidently wrote IllegalAccessException instead of IllegalArgumentException. While testing and debugging, I got different errors on the terminal and in the JSON response body, which made me realize this mix-up.

**Bug 2: a field that quietly never got set.**
In `AuthService.register()`, I'd called `setEmail()` twice by mistake instead
of calling `setName()` at all. The request validated fine (name genuinely
wasn't blank in the JSON), so the bug wasn't in validation — it was a few
lines later, where I just never copied that field onto the entity. Clean
input validation doesn't guarantee clean logic afterward.

**Bug 3: "fixing" a bug that never actually got recompiled.**
I edited the file, re-sent the request, and got the exact same error. Turned
out I'd never restarted `BackendApplication`, I didn't know Spring Boot doesn't hot-reload
by default.
**New habit going forward: fully stop and restart after every code change**,
don't just re-send the request and assume the fix took.

### Phase 2 (continued): Frontend — Register, Login, Token Storage — Done

Finished the half of Phase 2 that was still outstanding: registration and
login forms in React, a centralized Axios API client, and JWT persistence
via `localStorage`.

**Key pieces built:**
- `lib/api.ts` — a pre-configured Axios instance (`baseURL`, shared
  `Content-Type` header) with typed request/response interfaces mirroring
  the backend's DTOs field-for-field, and one function per endpoint
  (`register`, `login`, and later every other endpoint)
- `lib/auth.ts` — small wrapper around `localStorage` for saving/reading/
  clearing the JWT
- A **request interceptor** on the Axios instance that automatically
  attaches `Authorization: Bearer <token>` to every outgoing request if a
  token exists — meaning every endpoint built from here on gets
  authenticated automatically, with zero extra code per call
- `RegisterForm.tsx` / `LoginForm.tsx` — controlled components, calling
  through the API client, with error handling for the backend's
  string-based error responses and (later, discovered this didn't yet
  cover object-shaped validation errors — see Phase 4 bug below)
- A logout button (clears the
  token, returns to login/register) and a `/api/users/me` endpoint +
  frontend call to display who's currently signed in.

**Design choice — JWT secret via environment variable, not hardcoded.**
Set up `JWT_SECRET` as a real Windows environment variable (`setx`),
referenced in `application.properties` via `${JWT_SECRET}`. If the secret
were committed to git, anyone with repo access could forge valid tokens
for any user.

**Bugs I encountered:**

1. **CORS still blocked the frontend even after adding `@CrossOrigin` to
   `HealthController`.** Turned out `@CrossOrigin` only affects Spring
   MVC's own request handling — but Spring Security's filter chain runs
   *first*, before a request ever reaches a controller, and it has no
   idea about `@CrossOrigin` at all. Had to add a real
   `CorsConfigurationSource` bean and explicitly wire it into
   `SecurityConfig`'s filter chain (`.cors(cors -> ...)`) for the browser
   to actually be let through. Good reminder that once Spring Security is
   in the picture, it's the first gatekeeper for everything, even controller level annotations.

2. **Registration returned a `null` name in the database**, even though
   the incoming request had a valid, non-blank name and
   validation passed. Root cause: a copy-paste mistake in
   `AuthService.register()` — `setEmail()` was called twice; `setName()`
   was never called at all.

3. **A duplicate-email test returned a raw `500` instead of the intended
   `409`.** Root cause: a typo in the exception handler's own signature —
   `handleIllegalArgument(IllegalAccessException ex)` instead of
   `IllegalArgumentException ex`. Two unrelated exception classes that
   just look similar at a glance. Spring couldn't match the actually
   thrown exception to this handler's parameter type, so it never ran at
   all, producing its own unrelated `IllegalStateException: Could not
   resolve parameter` instead.

---

### Phase 3: Family Networks — Done

Built the first real business resource in the app: family networks with
invite-code-based joining, backed by a genuine authorization check (not
just authentication) for the first time.

**Backend:** `FamilyNetworkRepository`, `NetworkMemberRepository`,
`CurrentUserProvider` (extracts the current user's ID from the verified
JWT via `SecurityContextHolder`, so no endpoint ever trusts a
client-supplied user ID), `NetworkService` (create/join/list/get-by-id),
`NetworkController`. Invite codes are 8 characters, generated with
`SecureRandom` (not `Random` — codes are effectively a shared secret
controlling who can join a private family network), drawn from an
alphabet that deliberately excludes visually ambiguous characters
(`I`/`O`/`0`/`1`) since people may read these off a screen and type them by
hand.

**Frontend:** `NetworkDashboard.tsx` — list networks, create one, join one
via invite code, re-fetching the list after each action rather than
manually patching local state (simpler, guarantees the UI always matches
real server state).

**Bugs I encountered**

1. **Unresolved imports for `FamilyNetworkRepository` and
   `NetworkMemberRepository`**, even though both files existed. Partly an
   IDE indexing issue (fixed with a project reload), but also a genuine
   naming bug underneath: I'd named the entity class `NetworkMembers`
   (plural), inconsistent with every other entity in the project
   (`User`, `FamilyNetwork`, `Purchase` — all singular, since one instance
   = one row). Renamed to `NetworkMember` to match the established
   convention; cost nothing at the database level since the table name is
   controlled separately by `@Table(name = "network_members")`. I also switched between VS Code and IntelliJ a lot and in between, I forgot to add the .java extension when creating these two Repo classes in VS Code.

2. **`getMyNetworks()` returned wrong/empty results silently** — no
   error, no crash, just incorrect data. Root cause: called
   `networkMemberRepository.findByNetworkId(currentUserId)` — passing a
   *user* ID into a method that finds by *network* ID. Both are `Long`,
   so it compiled fine and ran without complaint, just returned
   meaningless results. Had to add a proper `findByUserId` method and use
   that instead.
3. **Attempted to call `findByNetworkIdAndUserId` on
   `NetworkMemberRepository` expecting it to return the actual membership
   object — it didn't exist yet.** Only `existsByNetworkIdAndUserId`
   (returning a boolean) had been built. Added a real
   `Optional<NetworkMember> findByNetworkIdAndUserId(...)` for cases that
   need the actual object, not just a yes/no check.

4. **An empty `403 Forbidden` with no response body at all**, for a
   request that should have hit a real, handled `SecurityException` in
   `NetworkController`. Turned out to be Spring Boot's own default
   handling of an internal `/error` dispatch, happening *before* my
   exception handler ever ran. Diagnosed by temporarily adding
   `.requestMatchers("/error").permitAll()` to `SecurityConfig`, which
   revealed the real underlying `500` and its actual cause — removed that
   temporary matcher once the real bug was fixed.

**Refactor triggered by this phase:** the same three-line authorization
check (`existsByNetworkIdAndUserId` → throw `SecurityException`) had
started appearing in multiple service methods, and the same exception
handler methods (`IllegalArgumentException`, `SecurityException`) were
duplicated across `AuthController` and `NetworkController` separately.
Consolidated all exception handling into one `GlobalExceptionHandler`
(`@RestControllerAdvice`), which applies across every controller in the
app and removed the now-redundant handler methods from both controllers.
Also added a dedicated handler for `MethodArgumentNotValidException`,
returning a structured `{field: message}` map instead of Spring's generic
default `400` body — this became directly relevant to a frontend bug in
Phase 4 below.

---

### Phase 4: Purchases & Items — Done

The core of the whole project — itemized purchases with multiple,
independently-tagged recipients per purchase, plus real transactional
integrity.

**Backend:** `PurchaseRepository`, `PurchaseItemRepository`,
`CreatePurchaseRequest` (using **nested validation** —
`List<@Valid PurchaseItemRequest>`, since `@Valid` doesn't automatically
cascade into collection elements),
`PurchaseService`, `PurchaseController`. `createPurchase` and
`deletePurchase` are both `@Transactional` because creating one purchase means
writing one `Purchase` row plus N `PurchaseItem` rows; without a
transaction boundary, a crash partway through could leave a purchase with
only some of its items, silently corrupting the ledger. Also added an
explicit check that every submitted item's `recipientId` is actually a
member of the target network — nothing in basic field validation
guarantees that on its own.

**Frontend:** extended `api.ts`, `AddPurchaseForm.tsx` (a
dynamic, variable-length list of item rows — add/remove/update
individual rows immutably via the spread operator), `PurchaseList.tsx`. Added `MemberResponse` +
`GET /api/networks/{id}/members` partway through, once it became clear
the item-recipient dropdown needed real `{id, name}` data. Built
`NetworkDetailPage.tsx` to tie purchases, members, and (soon) balances
together for one specific network — fetches members and purchases
concurrently via `Promise.all` rather than sequentially, since neither
depends on the other. Wired real navigation into `App.tsx` (lift the
"selected network" state up to the nearest common parent, pass a
selection callback down into the dashboard's list).


**Bugs I Encountered**

1. **Assumed `findByNetworkIdAndUserId` already existed** (mixing it up
   with the boolean-returning `existsByNetworkIdAndUserId`) while wiring
   up `createPurchase`'s network lookup. Same category of "the method I
   wanted wasn't actually built yet" as Phase 3's bug #3 — added the real
   version, returning `Optional<NetworkMember>`.

2. **`deletePurchase()` on the frontend was missing the network ID in its
   URL entirely** (`/networks/purchases/{id}` instead of
   `/networks/{networkId}/purchases/{id}`)

3. **Submitting a purchase with any blank/invalid field crashed the page
   to a blank screen**, instead of showing a validation error. Root
   cause, and the more interesting lesson: the frontend's error handler
   used `err.response.data as string` which isn't
   an actual runtime check. It compiled fine and worked for
   string-shaped error responses (like `"Email already registered"`), but
   `MethodArgumentNotValidException`'s handler (added in Phase 3) returns
   an **object** (`{field: message}` pairs) — and React cannot render a
   plain object directly as a child, which crashes the whole component
   tree. `as` tells the compiler "trust me," it doesn't verify anything —
   the bug only surfaced downstream, in a completely different file, from
   where the incorrect assumption was actually made. Fixed by adding a errors.ts file and implementing a helper function that I can call to obtain the error messaging, instead of having redundant error parsers on other files sharing a similar pattern (`RegisterForm`, `LoginForm`, `NetworkDashboard`,
   `AddPurchaseForm`)
   

---

### Phase 5: Balances — In Progress

Implementing derived balances instead of storing them. Balances will be computed every time from the purchase/settlement history on each request.

**Backend so far:** `SettlementRepository`, `BalanceService`,
`BalanceController` (`GET /api/networks/{id}/balances`). The core
algorithm nets every purchase item and settlement between any two people
down to a single signed value, keyed by a **canonical, order-independent
pair key** (smaller user ID first) so that a debt recorded in either
direction between the same two people always accumulates into the same
map entry rather than being tracked as two disconnected relationships.
Self-purchases (an item whose recipient is also the purchaser) are
explicitly skipped — no debt possible against yourself. Settlements are
folded in with a negated amount, since a real payment moves value in the
opposite direction of an unpaid debt.

**What I noticed:** never compare `BigDecimal` values with `==` or
`.equals()` for numeric equality — `.equals()` also considers scale
(`2.0` vs `2.00` would count as "not equal"), so `.compareTo(...) == 0`
is the correct check, used when filtering out perfectly net-zero balances
before returning them.

**Bugs I Encountered:**

1. Settlements increased the balance instead of decreasing it.
Listed balances for network 7 and got the expected result — user 15 owed user 16 $30.23. Logged a $10 settlement from 15 → 16, re-listed balances, and the amount went up to $40.23 instead of down to $20.23.
The settlement was being saved correctly (paidById: 15, paidToId: 16, amount: 10). The bug was only in how settlements were applied during derivation:

```java
// Wrong — reverses the debt twice
applyDebt(net, settlement.getPaidTo().getId(), settlement.getPaidBy().getId(), settlement.getAmount().negate());

// Right — payer still owes payee, just less
applyDebt(net, settlement.getPaidBy().getId(), settlement.getPaidTo().getId(), settlement.getAmount().negate());
```
applyDebt(debtor, creditor, amount) means "debtor owes creditor amount." A settlement from 15 to 16 should reduce that debt by 10. Swapping paidTo/paidBy and negating the amount both reverse the sign — so the settlement got applied as +10 instead of −10. The canonical key (lowerId:higherId) in applyDebt was fine; the settlement call was wrong.

**Tests performed:**

- Two purchases in opposite directions between the same pair of users
  correctly net down to a single balance in the right direction and
  amount
- Recording a settlement matching an existing balance correctly zeroes
  it out (the pair disappears from the balances list entirely, as
  designed — no "you owe each other $0" entries)
- Deleting a purchase correctly causes balances to recompute on the next
  read, with no stale or orphaned data left behind

**Still to do (Phase 5):**
- `GET /api/users/me/balances` — balances across all networks for the logged-in user
- Frontend: show pairwise balances on the network detail page
- Tests: opposite-direction debts net correctly; deleted purchases excluded; settlements reduce balances

**Started early (Phase 6):**
- `POST /api/networks/{id}/settlements` — backend only, tested manually via HTTP client
- Still need: `GET` settlement history, settle-up UI, settlement tests
