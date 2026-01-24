# GitHub Issues for titanpl - TechEmpower Compatibility

---

## Issue 1: Add `t.response` for Advanced HTTP Response Management

### Summary

Add `t.response` API to enable full control over HTTP responses including status codes, headers, and different content types (text/plain, text/html).

### Problem

Currently, titanpl actions can only return JSON objects. For TechEmpower benchmarks and real-world applications, we need control over:

- Custom status codes (201, 404, 500, etc.)
- Custom headers (Cache-Control, Content-Type, etc.)
- Different content types (text/plain, text/html, application/xml)
- Redirects

### Blocking for TechEmpower

Without `t.response`, titanpl **CANNOT** pass these tests:

| Test | Requirement | Why it fails |
|------|-------------|--------------|
| **Plaintext** | `Content-Type: text/plain` | Can only return JSON |
| **Fortunes** | `Content-Type: text/html; charset=utf-8` | Can only return JSON |

### Proposed API

```javascript
export function handler(req) {
  // Plain text response (for Plaintext test)
  return t.response.text("Hello, World!");

  // HTML response (for Fortunes test)
  return t.response.html("...");

  // JSON with custom status
  return t.response.json({ error: "Not found" }, { status: 404 });

  // Full control
  return t.response({
    body: "Hello, World!",
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      "X-Custom-Header": "value"
    }
  });

  // Redirect
  return t.response.redirect("/new-url", 301);

  // No content
  return t.response.empty(204);
}
```

### Reference Implementations

| Framework | API |
|-----------|-----|
| Next.js | `NextResponse.json()`, `NextResponse.redirect()` |
| Express | `res.status().json()`, `res.set()`, `res.type()` |
| Hono | `c.json()`, `c.text()`, `c.html()` |
| Bun | `new Response()` |

### Priority

🔴 **CRITICAL** - Without this, titanpl can only participate in 1 of 7 TechEmpower tests.

### TechEmpower Tests Enabled

- ✅ Plaintext (requires `t.response.text()`)
- ✅ Fortunes (requires `t.response.html()`)

---

## Issue 2: Add Multi-Database Support for `t.db`

### Summary

Extend `t.db` to support multiple databases beyond PostgreSQL: MySQL, Redis, and MongoDB.

### Current State

| Database | Status |
|----------|--------|
| PostgreSQL | ✅ Implemented |
| MySQL | ❌ Missing |
| Redis | ❌ Missing |
| MongoDB | ❌ Missing |

### Why This Matters

TechEmpower Framework Benchmarks tests frameworks against multiple databases. To compete fairly with other JS frameworks (Express, Fastify, Hono), titanpl needs support for:

1. **MySQL** - Most popular relational DB, TechEmpower primary test DB
2. **Redis** - Used for caching tests in TechEmpower
3. **MongoDB** - Popular NoSQL option, many frameworks include it

### Proposed API

```javascript
// PostgreSQL (already works)
const pgResult = t.db.query("SELECT * FROM World WHERE id = $1", [id]);

// MySQL (needs implementation)
const mysqlResult = t.db.mysql.query("SELECT * FROM World WHERE id = ?", [id]);

// Redis (needs implementation)
const redisValue = t.db.redis.get("world:123");
t.db.redis.set("world:123", JSON.stringify(world));
t.db.redis.lrange("fortunes", 0, -1);

// MongoDB (needs implementation)
const doc = t.db.mongo.findOne("World", { id: 123 });
const docs = t.db.mongo.find("Fortune", {});
```

### Alternative API (Single Interface)

```javascript
// Configuration via environment or config file
// DATABASE_TYPE=mysql
// DATABASE_URL=mysql://user:pass@host:3306/dbname

// Same API regardless of database
const result = t.db.query("SELECT * FROM World WHERE id = ?", [id]);
```

### Priority

| Database | Priority | Reason |
|----------|----------|--------|
| MySQL | 🟡 High | TechEmpower primary test database |
| Redis | 🟡 High | TechEmpower caching tests use Redis |
| MongoDB | 🟢 Medium | Optional but recommended for completeness |

### TechEmpower Tests Enabled

With MySQL:
- ✅ Single Query
- ✅ Multiple Queries
- ✅ Fortunes
- ✅ Updates

With Redis:
- ✅ Alternative caching implementation

---

## Issue 3: Fix `ls` (localStorage) for In-Memory Cache Support

### Summary

Fix `ls` to work as a proper in-memory cache for TechEmpower Caching test compatibility.

### Current Problems

| Problem | Current State | Required State |
|---------|---------------|----------------|
| Storage location | ❌ Disk (Sled) | ✅ Memory (RAM) |
| JS objects support | ❌ Strings only | ✅ Full JS objects |

### Why This Matters

TechEmpower's **Caching Test** requires:
- Store objects in memory
- Read them fast (no disk I/O)

Currently `ls` writes to disk, which is too slow for benchmarks.

### Required Fixes

1. **Store in memory, not disk**
   ```javascript
   // Should be instant (RAM access)
   ls.set("world:123", { id: 123, randomNumber: 456 });
   const world = ls.get("world:123"); // ~0.001ms
   ```

2. **Support JavaScript objects**
   ```javascript
   // Should work with objects, not just strings
   ls.set("user", { name: "Juan", age: 30 });
   const user = ls.get("user"); // Returns object, not string
   ```

### TechEmpower Caching Test Example

```javascript
// On startup: preload cache
const worlds = t.db.query("SELECT * FROM CachedWorld");
worlds.forEach(w => ls.set(`world:${w.id}`, w));

// During benchmark: read from memory
export function cachedQueries(req) {
  let count = parseInt(req.query.count) || 1;
  count = Math.min(500, Math.max(1, count));
  
  const results = [];
  for (let i = 0; i < count; i++) {
    const id = t.random(1, 10000);
    results.push(ls.get(`world:${id}`));
  }
  return results;
}
```

### Note

TTL (expiration) and LRU (eviction policy) are **NOT required** for TechEmpower. A simple in-memory HashMap is sufficient.

### Priority

🟡 **High** - Required for TechEmpower Caching test

### TechEmpower Tests Enabled

- ✅ Caching (requires in-memory storage with JS object support)

---

## Summary: TechEmpower Compatibility Roadmap

| Issue | Feature | Priority | Tests Enabled |
|-------|---------|----------|---------------|
| #1 | `t.response` | 🔴 Critical | Plaintext, Fortunes |
| #2 | `t.db` multi-database | 🟡 High | All DB tests with MySQL/Redis |
| #3 | `ls` fixes | 🟡 High | Caching |

### Current vs Target State

| Test | Now | After Issues Fixed |
|------|-----|-------------------|
| JSON | ✅ | ✅ |
| Plaintext | ❌ | ✅ (Issue #1) |
| Single Query | ✅ (PG only) | ✅ (PG + MySQL) |
| Multiple Queries | ✅ (PG only) | ✅ (PG + MySQL) |
| Fortunes | ❌ | ✅ (Issue #1) |
| Updates | ✅ (PG only) | ✅ (PG + MySQL) |
| Caching | ❌ | ✅ (Issue #3) |