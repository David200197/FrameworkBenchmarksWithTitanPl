# 🎯 TechEmpower Requirements for titanpl

## Executive Summary

For titanpl to compete on **equal terms** with other JavaScript frameworks (Express, Fastify, Hono, etc.), it must implement **7 test types**. Each test has specific HTTP response requirements.

---

## 📊 Current State of titanpl vs Requirements

| Test | Main Requirement | Does titanpl have it? | What's missing |
|------|------------------|----------------------|----------------|
| 1. JSON | Respond `{"message":"Hello, World!"}` | ✅ Yes | Nothing |
| 2. Plaintext | Respond `Hello, World!` with `text/plain` | ❌ No | `t.response.text()` |
| 3. Single DB Query | PostgreSQL/MySQL connection | ❌ No | `t.db` or SQL driver |
| 4. Multiple Queries | N queries to DB | ❌ No | `t.db` + query params |
| 5. Fortunes | DB + HTML Template + XSS Escape | ❌ No | `t.db` + `t.response.html()` + templates |
| 6. DB Updates | Read + Update rows | ❌ No | `t.db` with UPDATE |
| 7. Caching | In-memory cache | ❌ No | `t.cache` |

---

## 🔴 HIGH PRIORITY - Basic Tests (Minimum to participate)

### Test 1: JSON Serialization ✅ (titanpl ALREADY SUPPORTS THIS)

**Route:** `GET /json`

**Requirements:**
```
Response: {"message":"Hello, World!"}
Content-Type: application/json
Content-Length: 28
Required headers: Server, Date
```

**Current titanpl code:**
```javascript
export function json(req) {
  return { message: "Hello, World!" };
}
```

**Status:** ✅ Works (assuming titanpl adds Server and Date headers automatically)

---

### Test 6: Plaintext ❌ (NEEDS `t.response`)

**Route:** `GET /plaintext`

**Requirements:**
```
Response body: Hello, World!
Content-Type: text/plain
Content-Length: 13
Required headers: Server, Date
```

**What titanpl needs:**
```javascript
export function plaintext(req) {
  // Option 1: Helper method
  return t.response.text("Hello, World!");
  
  // Option 2: Full response object
  return t.response({
    body: "Hello, World!",
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
```

**⚠️ BLOCKING:** Without `t.response`, titanpl CANNOT participate in this test.

---

## 🟡 MEDIUM PRIORITY - Database Tests

### Test 2: Single Database Query ❌ (NEEDS `t.db`)

**Route:** `GET /db`

**Requirements:**
- Connect to PostgreSQL or MySQL
- `World` table with columns: `id` (int), `randomNumber` (int)
- Select 1 random row (id between 1-10000)
- Return JSON: `{"id":3217,"randomNumber":2149}`

**What titanpl needs:**
```javascript
export function db(req) {
  // Generate random ID between 1 and 10000
  const id = t.random(1, 10000);
  
  // Query database
  const world = t.db.query("SELECT id, randomNumber FROM World WHERE id = $1", [id]);
  
  return world;
}
```

**Required features:**
| Feature | Description |
|---------|-------------|
| `t.db.query()` | Execute SQL with parameters |
| `t.db.connect()` | Connection pool |
| `t.random()` | Random number generator |
| Drivers | PostgreSQL and/or MySQL |

---

### Test 3: Multiple Database Queries ❌

**Route:** `GET /queries?queries=10`

**Requirements:**
- `queries` parameter (1-500, default 1)
- Execute N **separate** queries (DO NOT use `WHERE id IN (...)`)
- Return array of World objects

**What titanpl needs:**
```javascript
export function queries(req) {
  // Parse parameter (1-500)
  let count = parseInt(req.query.queries) || 1;
  count = Math.min(500, Math.max(1, count));
  
  const results = [];
  
  // IMPORTANT: Separate queries, NOT batch
  for (let i = 0; i < count; i++) {
    const id = t.random(1, 10000);
    const world = t.db.query("SELECT id, randomNumber FROM World WHERE id = $1", [id]);
    results.push(world);
  }
  
  return results;
}
```

**Or with parallelism (if `t.async` exists):**
```javascript
export function queries(req) {
  let count = parseInt(req.query.queries) || 1;
  count = Math.min(500, Math.max(1, count));
  
  const queries = [];
  for (let i = 0; i < count; i++) {
    const id = t.random(1, 10000);
    queries.push(() => t.db.query("SELECT * FROM World WHERE id = $1", [id]));
  }
  
  // Execute in parallel
  return t.async.all(queries);
}
```

---

### Test 5: Database Updates ❌

**Route:** `GET /updates?queries=10`

**Requirements:**
- Read N random rows
- Update `randomNumber` of each one with new random value
- Persist changes to DB
- Return updated array

**What titanpl needs:**
```javascript
export function updates(req) {
  let count = parseInt(req.query.queries) || 1;
  count = Math.min(500, Math.max(1, count));
  
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const id = t.random(1, 10000);
    
    // Read
    const world = t.db.query("SELECT id, randomNumber FROM World WHERE id = $1", [id]);
    
    // Update
    world.randomNumber = t.random(1, 10000);
    
    // Persist
    t.db.query("UPDATE World SET randomNumber = $1 WHERE id = $2", 
               [world.randomNumber, world.id]);
    
    results.push(world);
  }
  
  return results;
}
```

---

### Test 4: Fortunes ❌ (NEEDS `t.db` + `t.response.html()` + Templates)

**Route:** `GET /fortunes`

**Requirements:**
- Read all rows from `Fortune` table (id, message)
- Add new fortune: `"Additional fortune added at request time."`
- Sort by `message` alphabetically
- Render HTML with template
- Escape HTML characters (XSS prevention)
- Content-Type: `text/html; charset=utf-8`

**What titanpl needs:**
```javascript
export function fortunes(req) {
  // Read all fortunes
  const fortunes = t.db.query("SELECT id, message FROM Fortune");
  
  // Add additional fortune
  fortunes.push({ id: 0, message: "Additional fortune added at request time." });
  
  // Sort by message
  fortunes.sort((a, b) => a.message.localeCompare(b.message));
  
  // Render HTML (with automatic XSS escaping)
  const html = t.template("fortunes.html", { fortunes });
  
  return t.response.html(html);
}
```

**Required template (fortunes.html):**
```html
<!DOCTYPE html>
<html>
<head><title>Fortunes</title></head>
<body>
<table>
<tr><th>id</th><th>message</th></tr>
{{#each fortunes}}
<tr><td>{{id}}</td><td>{{message}}</td></tr>
{{/each}}
</table>
</body>
</html>
```

**Required features:**
| Feature | Description |
|---------|-------------|
| `t.template()` | Template engine |
| `t.response.html()` | HTML response |
| XSS Escape | Automatic in templates |
| UTF-8 | Support for Japanese characters |

---

### Test 7: Caching ❌

**Route:** `GET /cached-queries?count=10`

**Requirements:**
- In-memory cache of `CachedWorld` objects
- Similar to Multiple Queries but from cache
- Use real cache library (not a simple Map)

**What titanpl needs:**
```javascript
// Initialize cache on startup
t.cache.warmup(() => {
  const worlds = t.db.query("SELECT * FROM CachedWorld");
  worlds.forEach(w => t.cache.set(`world:${w.id}`, w));
});

export function cachedQueries(req) {
  let count = parseInt(req.query.count) || 1;
  count = Math.min(500, Math.max(1, count));
  
  const results = [];
  for (let i = 0; i < count; i++) {
    const id = t.random(1, 10000);
    const world = t.cache.get(`world:${id}`);
    results.push(world);
  }
  
  return results;
}
```

---

## 📋 Summary of Required APIs for titanpl

### Level 1: Minimum to participate (JSON + Plaintext)
```javascript
t.response.text(body)              // text/plain response
t.response.json(data, options)     // JSON with custom status
t.response.html(body)              // text/html response
t.response({ body, status, headers }) // Full control
```

### Level 2: Database Tests
```javascript
t.db.query(sql, params)            // Execute SQL query
t.db.connect(config)               // Configure connection
t.random(min, max)                 // Random number
```

### Level 3: Advanced Tests
```javascript
t.template(file, data)             // Template engine
t.cache.get(key)                   // Read from cache
t.cache.set(key, value)            // Write to cache
t.async.all([...])                 // Parallelism
```

---

## 🏁 Suggested Roadmap

### Phase 1: Basic Participation (2 tests)
1. ✅ JSON (already works)
2. 🔧 Implement `t.response` → enables **Plaintext**

### Phase 2: Serious Competition (5 tests)
3. 🔧 Implement `t.db` → enables **Single Query**
4. 🔧 Implement `t.random` + query params → enables **Multiple Queries**
5. 🔧 Implement `t.template` → enables **Fortunes**

### Phase 3: Full Coverage (7 tests)
6. 🔧 DB Updates (only needs the above)
7. 🔧 Implement `t.cache` → enables **Caching**

---

## 📊 Comparison with Existing JS Frameworks

| Framework | JSON | Plaintext | DB | Queries | Fortunes | Updates | Cache |
|-----------|------|-----------|-----|---------|----------|---------|-------|
| Express | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fastify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hono | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bun | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **titanpl** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**To match these frameworks, titanpl needs to implement EVERYTHING in the red column.**

---

## ⚡ Mandatory HTTP Headers (All Tests)

TechEmpower **requires** these headers in ALL responses:

```http
HTTP/1.1 200 OK
Content-Type: application/json    (or text/plain, text/html depending on test)
Content-Length: 28                (or Transfer-Encoding: chunked)
Server: titanpl                   ← MANDATORY
Date: Wed, 17 Apr 2024 12:00:00 GMT  ← MANDATORY
```

**Does titanpl add `Server` and `Date` automatically?** If not, it needs to.

---

## 🎯 Conclusion

**To compete in TechEmpower on equal terms with other JS frameworks:**

| Priority | Feature | Tests it enables |
|----------|---------|------------------|
| 🔴 Critical | `t.response` (text, html, status, headers) | Plaintext, Fortunes |
| 🔴 Critical | `t.db` (PostgreSQL driver) | DB, Queries, Updates, Fortunes |
| 🟡 High | `t.random()` | All DB tests |
| 🟡 High | `t.template()` with XSS escape | Fortunes |
| 🟢 Medium | `t.cache` | Caching |
| 🟢 Medium | `t.async.all()` | Queries optimization |

**Absolute minimum to appear in TechEmpower:** `t.response.text()` (for Plaintext)

**For fair comparison with Express/Fastify:** All of the above