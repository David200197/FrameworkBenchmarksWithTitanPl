# Complete Guide: titanpl on TechEmpower FrameworkBenchmarks

> **Note**: `t.response` is already implemented in the runtime.

---

## 📊 The 7 TechEmpower Tests

| # | Test | URL | Content-Type | Requires DB |
|---|------|-----|--------------|-------------|
| 1 | JSON Serialization | `/json` | `application/json` | No |
| 2 | Single Database Query | `/db` | `application/json` | Yes |
| 3 | Multiple Database Queries | `/queries?queries=N` | `application/json` | Yes |
| 4 | Fortunes | `/fortunes` | `text/html; charset=utf-8` | Yes |
| 5 | Database Updates | `/updates?queries=N` | `application/json` | Yes |
| 6 | Plaintext | `/plaintext` | `text/plain` | No |
| 7 | Caching | `/cached-queries?count=N` | `application/json` | Yes (cache) |

---

## 📁 Complete Required Structure

```
FrameworkBenchmarks/
└── frameworks/
    └── JavaScript/
        └── titanpl/
            ├── benchmark_config.json      ⚠️  Update with all tests
            ├── titanpl.dockerfile         ✅ Already exists
            ├── titanpl-postgres.dockerfile ❌ MISSING (for DB tests)
            ├── README.md                  ❌ MISSING
            ├── app/
            │   ├── app.js                 ⚠️  Add all routes
            │   └── actions/
            │       ├── json.js            ✅ Already exists
            │       ├── plaintext.js       ⚠️  Fix text
            │       ├── db.js              ❌ MISSING
            │       ├── queries.js         ❌ MISSING
            │       ├── fortunes.js        ❌ MISSING
            │       ├── updates.js         ❌ MISSING
            │       └── cached-queries.js  ❌ MISSING
            └── titan/
                └── titan.js               ✅ Already exists
```

---

## 🔧 Files to Create/Modify

---

### 1. `app/actions/json.js` ✅ ALREADY EXISTS

```javascript
// TechEmpower Benchmark - JSON Serialization Test
// Route: GET /json
// Response: {"message":"Hello, World!"}

export function json(req) {
    return {
        message: "Hello, World!"
    };
}
```

**Requirements:**
- Response: `{"message":"Hello, World!"}`
- Content-Type: `application/json`
- CANNOT be cached

---

### 2. `app/actions/plaintext.js` ⚠️ FIX

```javascript
// TechEmpower Benchmark - Plaintext Test
// Route: GET /plaintext
// Response: Hello, World!

export function plaintext(req) {
    return t.response.text("Hello, World!");
}
```

**Requirements:**
- Response body: `Hello, World!` (exactly 13 bytes)
- Content-Type: `text/plain`

---

### 3. `app/actions/db.js` ❌ CREATE

```javascript
// TechEmpower Benchmark - Single Database Query Test
// Route: GET /db
// Response: {"id":1234,"randomNumber":5678}

export function db(req) {
    const id = Math.floor(Math.random() * 10000) + 1;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const rows = conn.query(
        "SELECT id, \"randomNumber\" FROM world WHERE id = $1", 
        [id]
    );
    
    return {
        id: rows[0].id,
        randomNumber: rows[0].randomNumber
    };
}
```

**Requirements:**
- Select 1 random row from `world` table (10,000 rows, ids 1-10000)
- Response: `{"id":N,"randomNumber":N}`
- Content-Type: `application/json`
- NO caching allowed

---

### 4. `app/actions/queries.js` ❌ CREATE

```javascript
// TechEmpower Benchmark - Multiple Database Queries Test
// Route: GET /queries?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function queries(req) {
    // Parse and validate queries parameter (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const results = [];
    
    // IMPORTANT: Each query must be individual, DO NOT use IN clause
    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        const rows = conn.query(
            "SELECT id, \"randomNumber\" FROM world WHERE id = $1", 
            [id]
        );
        results.push({
            id: rows[0].id,
            randomNumber: rows[0].randomNumber
        });
    }
    
    return results;
}
```

**Requirements:**
- Parameter `queries`: 1-500 (default 1, min 1, max 500)
- Each row must be selected with individual query (DO NOT use `WHERE id IN (...)`)
- Response: Array of objects `[{"id":N,"randomNumber":N}, ...]`
- Content-Type: `application/json`

---

### 5. `app/actions/fortunes.js` ❌ CREATE

```javascript
// TechEmpower Benchmark - Fortunes Test
// Route: GET /fortunes
// Response: HTML table with sorted fortunes

export function fortunes(req) {
    const conn = t.db.connect(process.env.DATABASE_URL);
    const fortunes = conn.query("SELECT id, message FROM fortune");
    
    // Add additional fortune (required by the test)
    fortunes.push({
        id: 0,
        message: "Additional fortune added at request time."
    });
    
    // Sort by message (string comparison)
    fortunes.sort((a, b) => {
        if (a.message < b.message) return -1;
        if (a.message > b.message) return 1;
        return 0;
    });
    
    // Escape HTML (XSS protection - REQUIRED)
    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };
    
    // Generate HTML
    let rows = '';
    for (const f of fortunes) {
        rows += `<tr><td>${f.id}</td><td>${escapeHtml(f.message)}</td></tr>`;
    }
    
    const html = `<!DOCTYPE html><html><head><title>Fortunes</title></head><body><table><tr><th>id</th><th>message</th></tr>${rows}</table></body></html>`;
    
    return t.response.html(html);
}
```

**Requirements:**
- Fetch all fortunes from `fortune` table
- Add additional fortune: `"Additional fortune added at request time."` with id 0
- Sort by `message` (in code, NOT in SQL)
- Escape HTML (there's a fortune with `<script>` tag)
- Support UTF-8 (there's a fortune in Japanese)
- Content-Type: `text/html; charset=utf-8`

---

### 6. `app/actions/updates.js` ❌ CREATE

```javascript
// TechEmpower Benchmark - Database Updates Test
// Route: GET /updates?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function updates(req) {
    // Parse and validate queries parameter (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        
        // 1. Read the row
        const rows = conn.query(
            "SELECT id, \"randomNumber\" FROM world WHERE id = $1", 
            [id]
        );
        
        // 2. Generate new randomNumber
        const newRandomNumber = Math.floor(Math.random() * 10000) + 1;
        
        // 3. Update in DB
        conn.query(
            "UPDATE world SET \"randomNumber\" = $1 WHERE id = $2",
            [newRandomNumber, id]
        );
        
        results.push({
            id: rows[0].id,
            randomNumber: newRandomNumber
        });
    }
    
    return results;
}
```

**Requirements:**
- Parameter `queries`: 1-500 (default 1, min 1, max 500)
- For each query: read row, generate new randomNumber, update in DB
- Each row must have a UNIQUE new randomNumber (not all the same)
- Response: Array with updated values
- Content-Type: `application/json`
- Batch UPDATE is allowed but NOT batch SELECT

---

### 7. `app/actions/cached-queries.js` ❌ CREATE

```javascript
// TechEmpower Benchmark - Caching Test
// Route: GET /cached-queries?count=N
// Response: [{"id":1,"randomNumber":2}, ...]

// In-memory cache (populated at startup or on first request)
let worldCache = null;

function initCache() {
    if (worldCache) return;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const rows = conn.query("SELECT id, \"randomNumber\" FROM cachedworld");
    
    worldCache = {};
    for (const row of rows) {
        worldCache[row.id] = {
            id: row.id,
            randomNumber: row.randomNumber
        };
    }
}

export function cachedQueries(req) {
    initCache();
    
    // Parse and validate count parameter (1-500)
    let count = parseInt(req.query.count) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        results.push(worldCache[id]);
    }
    
    return results;
}
```

**Requirements:**
- Parameter `count`: 1-500 (default 1, min 1, max 500)
- Use `cachedworld` table (same structure as `world`)
- Cache in memory (NO reverse-proxy cache)
- Response: Array of objects from cache
- Content-Type: `application/json`

---

### 8. `app/app.js` ⚠️ UPDATE

```javascript
import t from "../titan/titan.js";

// Test 1: JSON
t.get("/json").action("json")

// Test 2: Single DB Query
t.get("/db").action("db")

// Test 3: Multiple DB Queries
t.get("/queries").action("queries")

// Test 4: Fortunes
t.get("/fortunes").action("fortunes")

// Test 5: Database Updates
t.get("/updates").action("updates")

// Test 6: Plaintext
t.get("/plaintext").action("plaintext")

// Test 7: Caching
t.get("/cached-queries").action("cached-queries")

t.start(8080, "titanpl running on port 8080");
```

**Note:** TechEmpower uses port 8080 by convention, but you can use 3000.

---

### 9. `benchmark_config.json` ⚠️ UPDATE COMPLETE

```json
{
  "framework": "titanpl",
  "tests": [{
    "default": {
      "json_url": "/json",
      "plaintext_url": "/plaintext",
      "port": 8080,
      "approach": "Realistic",
      "classification": "Micro",
      "database": "None",
      "framework": "titanpl",
      "language": "JavaScript",
      "flavor": "None",
      "orm": "Raw",
      "platform": "titanpl",
      "webserver": "None",
      "os": "Linux",
      "database_os": "Linux",
      "display_name": "titanpl",
      "notes": "JavaScript framework compiled to native binary via Rust/Axum",
      "versus": "nodejs"
    },
    "postgres": {
      "json_url": "/json",
      "plaintext_url": "/plaintext",
      "db_url": "/db",
      "query_url": "/queries?queries=",
      "fortune_url": "/fortunes",
      "update_url": "/updates?queries=",
      "cached_query_url": "/cached-queries?count=",
      "port": 8080,
      "approach": "Realistic",
      "classification": "Micro",
      "database": "Postgres",
      "framework": "titanpl",
      "language": "JavaScript",
      "flavor": "None",
      "orm": "Raw",
      "platform": "titanpl",
      "webserver": "None",
      "os": "Linux",
      "database_os": "Linux",
      "display_name": "titanpl-postgres",
      "notes": "JavaScript framework with PostgreSQL via Rust/Axum",
      "versus": "nodejs"
    }
  }]
}
```

---

### 10. `titanpl-postgres.dockerfile` ❌ CREATE

```dockerfile
# Build stage
FROM rust:1.76-slim-bookworm AS builder

RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libssl-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /titanpl

RUN npm install -g @ezetgalaxy/titan

COPY . .

RUN titan build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /titanpl/dist/server /app/server

# TechEmpower database connection
ENV DATABASE_URL="postgresql://benchmarkdbuser:benchmarkdbpass@tfb-database:5432/hello_world"

EXPOSE 8080

CMD ["./server"]
```

---

### 11. `README.md` ❌ CREATE

```markdown
# titanpl Benchmarking Test

This is the titanpl portion of a [benchmarking test suite](../) comparing a variety of web development platforms.

## Test URLs

### JSON

    http://localhost:8080/json

### Plaintext

    http://localhost:8080/plaintext

### DB (Single Query)

    http://localhost:8080/db

### Queries (Multiple Queries)

    http://localhost:8080/queries?queries=

### Fortunes

    http://localhost:8080/fortunes

### Updates

    http://localhost:8080/updates?queries=

### Cached Queries

    http://localhost:8080/cached-queries?count=

## Infrastructure

titanpl is a JavaScript-first web framework that compiles to a native binary using Rust and Axum.

- **Language**: JavaScript
- **Runtime**: Rust/Axum (compiled to native binary)
- **Database**: PostgreSQL (for DB tests)

## Test Types

| Type | Implementation |
|------|----------------|
| JSON | titanpl |
| Plaintext | titanpl |
| DB | Raw PostgreSQL |
| Query | Raw PostgreSQL |
| Fortune | Raw PostgreSQL |
| Update | Raw PostgreSQL |
| Cached | In-memory cache |

## Maintainer

- [@ezet-galaxy](https://github.com/ezet-galaxy)
```

---

## 📊 Database - Schema

TechEmpower uses these tables in PostgreSQL:

```sql
-- world table (10,000 rows)
CREATE TABLE world (
    id integer NOT NULL PRIMARY KEY,
    randomNumber integer NOT NULL
);

-- fortune table (12 rows)
CREATE TABLE fortune (
    id integer NOT NULL PRIMARY KEY,
    message varchar(2048) NOT NULL
);

-- cachedworld table (10,000 rows, same structure as world)
CREATE TABLE cachedworld (
    id integer NOT NULL PRIMARY KEY,
    randomNumber integer NOT NULL
);
```

**TechEmpower Connection:**
- Host: `tfb-database`
- Port: `5432`
- Database: `hello_world`
- User: `benchmarkdbuser`
- Password: `benchmarkdbpass`

---

## 🔒 Required HTTP Headers

**ALL responses must include:**

| Header | Value |
|--------|-------|
| `Content-Type` | According to test (see table above) |
| `Content-Length` or `Transfer-Encoding` | Body size |
| `Server` | `titanpl` |
| `Date` | RFC 7231: `Mon, 27 Jan 2025 10:00:00 GMT` |

---

## ✅ Complete Checklist

### Base Files
- [ ] `README.md` - Create
- [ ] `benchmark_config.json` - Update with all tests
- [ ] `titanpl-postgres.dockerfile` - Create

### Actions
- [ ] `json.js` - ✅ Already exists
- [ ] `plaintext.js` - Fix text to "Hello, World!"
- [ ] `db.js` - Create
- [ ] `queries.js` - Create
- [ ] `fortunes.js` - Create (requires `t.response.html()`)
- [ ] `updates.js` - Create
- [ ] `cached-queries.js` - Create

### App
- [ ] `app.js` - Add all routes

### Runtime (Rust/Axum)
- [ ] `Server: titanpl` header in all responses
- [ ] `Date` header in all responses
- [ ] `t.response.text()` working
- [ ] `t.response.html()` working
- [ ] `t.db.connect()` with PostgreSQL

---

## 🧪 Test Locally

```bash
# Clone repo
git clone https://github.com/TechEmpower/FrameworkBenchmarks.git
cd FrameworkBenchmarks

# Copy titanpl
mkdir -p frameworks/JavaScript/titanpl
# (copy files)

# Create Docker network
docker network create tfb

# Test only JSON and Plaintext
./tfb --test titanpl --type json plaintext

# Test all tests with Postgres
./tfb --test titanpl-postgres

# Debug mode
./tfb --mode debug --test titanpl-postgres
curl http://localhost:8080/json
curl http://localhost:8080/db
curl http://localhost:8080/queries?queries=5
curl http://localhost:8080/fortunes
curl http://localhost:8080/updates?queries=5
curl http://localhost:8080/cached-queries?count=10
```

---

## 📋 Status Summary

| File | Status | Action |
|------|--------|--------|
| `benchmark_config.json` | ⚠️ Incomplete | Add "postgres" test |
| `titanpl.dockerfile` | ✅ Exists | None |
| `titanpl-postgres.dockerfile` | ❌ Missing | Create |
| `README.md` | ❌ Missing | Create |
| `app/app.js` | ⚠️ Incomplete | Add routes |
| `app/actions/json.js` | ✅ OK | None |
| `app/actions/plaintext.js` | ⚠️ Error | Fix text |
| `app/actions/db.js` | ❌ Missing | Create |
| `app/actions/queries.js` | ❌ Missing | Create |
| `app/actions/fortunes.js` | ❌ Missing | Create |
| `app/actions/updates.js` | ❌ Missing | Create |
| `app/actions/cached-queries.js` | ❌ Missing | Create |

---

## 🎯 Recommended Implementation Order

1. **Phase 1 - Basic (no DB):**
   - Fix `plaintext.js`
   - Create `README.md`
   - Verify HTTP headers
   - Initial PR with JSON + Plaintext only

2. **Phase 2 - Database:**
   - Create `db.js`, `queries.js`, `updates.js`
   - Create `titanpl-postgres.dockerfile`
   - Update `benchmark_config.json`

3. **Phase 3 - HTML + Cache:**
   - Create `fortunes.js` (requires `t.response.html()`)
   - Create `cached-queries.js`
   - PR with all tests