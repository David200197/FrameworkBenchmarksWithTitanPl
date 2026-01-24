# titanpl - TechEmpower Technical Checklist

## ✅ What titanpl ALREADY has
- [x] Basic routing
- [x] Automatic JSON serialization
- [x] Content-Type: application/json headers
- [x] `t.fetch()` for HTTP client
- [x] `t.log()` for logging

## ❌ What titanpl NEEDS to implement

### 🔴 CRITICAL - Cannot participate without this

#### `t.response` - HTTP Response Control
```javascript
// Required for: Plaintext, Fortunes, any non-JSON response

t.response.text(body)                    // Content-Type: text/plain
t.response.html(body)                    // Content-Type: text/html; charset=utf-8
t.response.json(data, { status: 201 })   // JSON with status code
t.response.redirect(url, statusCode)     // Redirects
t.response.empty(statusCode)             // No body (204, etc)

// Full control
t.response({
  body: "...",
  status: 200,
  headers: {
    "Content-Type": "text/plain",
    "X-Custom": "value"
  }
})
```

#### Mandatory automatic headers
```
Server: titanpl        ← Does it already add this? Verify
Date: <RFC 7231>       ← Does it already add this? Verify
Content-Length: N      ← Does it already add this? Verify
```

---

### 🟡 IMPORTANT - For database tests

#### `t.db` - Database Driver
```javascript
// Required for: DB, Queries, Fortunes, Updates

// Configuration (via env vars or config)
// DATABASE_URL=postgres://user:pass@host:5432/dbname

// Queries
const row = t.db.query("SELECT * FROM World WHERE id = $1", [id]);
const rows = t.db.query("SELECT * FROM Fortune");

// Updates
t.db.query("UPDATE World SET randomNumber = $1 WHERE id = $2", [newVal, id]);

// Connection pool (managed internally by Tokio)
```

**Databases supported by TechEmpower:**
- PostgreSQL (recommended)
- MySQL
- MongoDB
- Redis (for some tests)

#### `t.random()` - Random Numbers
```javascript
// Required for: DB, Queries, Updates

const id = t.random(1, 10000);  // Integer between 1 and 10000 inclusive
```

---

### 🟢 DESIRABLE - For full coverage

#### `t.template()` - Template Engine
```javascript
// Required for: Fortunes

const html = t.template("fortunes.html", { 
  fortunes: [...] 
});

// Must include:
// - Automatic HTML escaping (XSS prevention)
// - UTF-8 support (Japanese characters)
// - Array iteration
```

#### `t.cache` - In-memory Cache
```javascript
// Required for: Caching test

t.cache.set(key, value, { ttl: 3600 });
const value = t.cache.get(key);
t.cache.delete(key);

// Must be a real cache (with eviction policy), NOT a simple Map
```

#### `t.async` - Async Utilities
```javascript
// Required for: Optimizing parallel Queries

const results = t.async.all([
  () => t.db.query("SELECT * FROM World WHERE id = $1", [id1]),
  () => t.db.query("SELECT * FROM World WHERE id = $1", [id2]),
  () => t.db.query("SELECT * FROM World WHERE id = $1", [id3]),
]);
```

---

## 📋 TechEmpower Tests - Exact Specifications

### Test 1: JSON ✅
```
GET /json
Response: {"message":"Hello, World!"}
Content-Type: application/json
Status: 200
```

### Test 6: Plaintext ❌
```
GET /plaintext  
Response: Hello, World!
Content-Type: text/plain
Status: 200
Note: Support HTTP pipelining
```

### Test 2: Single DB Query ❌
```
GET /db
Response: {"id":N,"randomNumber":N}
Requirements:
  - SELECT from World table
  - Random ID (1-10000)
  - DO NOT cache results
```

### Test 3: Multiple Queries ❌
```
GET /queries?queries=N
Response: [{"id":N,"randomNumber":N}, ...]
Requirements:
  - N between 1-500 (default 1)
  - N SEPARATE queries (no IN clause)
  - Each ID is random
```

### Test 4: Fortunes ❌
```
GET /fortunes
Response: HTML with fortunes table
Content-Type: text/html; charset=utf-8
Requirements:
  - SELECT * FROM Fortune
  - Add: "Additional fortune added at request time."
  - Sort by message (in code, not SQL)
  - Automatic XSS escaping
  - UTF-8 (there's a Japanese message)
```

### Test 5: Updates ❌
```
GET /updates?queries=N
Response: [{"id":N,"randomNumber":N}, ...]
Requirements:
  - Read N rows
  - Update randomNumber for each one
  - UPDATE in database
  - N between 1-500
```

### Test 7: Caching ❌
```
GET /cached-queries?count=N
Response: [{"id":N,"randomNumber":N}, ...]
Requirements:
  - CachedWorld table (same as World)
  - Data from cache, not DB
  - Real cache (not Map)
  - count between 1-500
```

---

## 🚀 Recommended Implementation Order

```
Week 1: t.response.text() + t.response.html()
        → Enables: Plaintext
        
Week 2: t.db with PostgreSQL driver
        → Enables: Single DB Query
        
Week 3: t.random() + query params parsing
        → Enables: Multiple Queries, Updates
        
Week 4: t.template() with XSS escaping
        → Enables: Fortunes
        
Week 5: t.cache
        → Enables: Caching
```

---

## 🔧 Rust Implementation (Suggestions)

### For `t.response`:
```rust
// In titanpl runtime, add response variants
enum TitanResponse {
    Json(serde_json::Value),
    Text(String),
    Html(String),
    Custom { body: Vec<u8>, status: u16, headers: HashMap<String, String> }
}
```

### For `t.db`:
```rust
// Use sqlx or tokio-postgres
use sqlx::postgres::PgPool;

// Pool is managed in Rust runtime
// JS queries call Rust functions that execute against the pool
```

### For `t.random`:
```rust
// Use fastrand or rand
use fastrand;
let id = fastrand::i32(1..=10000);
```