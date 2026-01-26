# Guía Completa: titanpl en TechEmpower FrameworkBenchmarks

> **Nota**: `t.response` ya está implementado en el runtime.

---

## 📊 Los 7 Tests de TechEmpower

| # | Test | URL | Content-Type | Requiere DB |
|---|------|-----|--------------|-------------|
| 1 | JSON Serialization | `/json` | `application/json` | No |
| 2 | Single Database Query | `/db` | `application/json` | Sí |
| 3 | Multiple Database Queries | `/queries?queries=N` | `application/json` | Sí |
| 4 | Fortunes | `/fortunes` | `text/html; charset=utf-8` | Sí |
| 5 | Database Updates | `/updates?queries=N` | `application/json` | Sí |
| 6 | Plaintext | `/plaintext` | `text/plain` | No |
| 7 | Caching | `/cached-queries?count=N` | `application/json` | Sí (cache) |

---

## 📁 Estructura Completa Requerida

```
FrameworkBenchmarks/
└── frameworks/
    └── JavaScript/
        └── titanpl/
            ├── benchmark_config.json      ⚠️  Actualizar con todos los tests
            ├── titanpl.dockerfile         ✅ Ya tienes
            ├── titanpl-postgres.dockerfile ❌ FALTA (para tests con DB)
            ├── README.md                  ❌ FALTA
            ├── app/
            │   ├── app.js                 ⚠️  Agregar todas las rutas
            │   └── actions/
            │       ├── json.js            ✅ Ya tienes
            │       ├── plaintext.js       ⚠️  Corregir texto
            │       ├── db.js              ❌ FALTA
            │       ├── queries.js         ❌ FALTA
            │       ├── fortunes.js        ❌ FALTA
            │       ├── updates.js         ❌ FALTA
            │       └── cached-queries.js  ❌ FALTA
            └── titan/
                └── titan.js               ✅ Ya tienes
```

---

## 🔧 Archivos a Crear/Modificar

---

### 1. `app/actions/json.js` ✅ YA EXISTE

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

**Requisitos:**
- Response: `{"message":"Hello, World!"}`
- Content-Type: `application/json`
- NO puede estar cacheado

---

### 2. `app/actions/plaintext.js` ⚠️ CORREGIR

```javascript
// TechEmpower Benchmark - Plaintext Test
// Route: GET /plaintext
// Response: Hello, World!

export function plaintext(req) {
    return t.response.text("Hello, World!");
}
```

**Requisitos:**
- Response body: `Hello, World!` (exactamente 13 bytes)
- Content-Type: `text/plain`

---

### 3. `app/actions/db.js` ❌ CREAR

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

**Requisitos:**
- Seleccionar 1 row aleatorio de tabla `world` (10,000 rows, ids 1-10000)
- Response: `{"id":N,"randomNumber":N}`
- Content-Type: `application/json`
- NO usar cache

---

### 4. `app/actions/queries.js` ❌ CREAR

```javascript
// TechEmpower Benchmark - Multiple Database Queries Test
// Route: GET /queries?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function queries(req) {
    // Parsear y validar parámetro queries (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const results = [];
    
    // IMPORTANTE: Cada query debe ser individual, NO usar IN clause
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

**Requisitos:**
- Parámetro `queries`: 1-500 (default 1, min 1, max 500)
- Cada row debe seleccionarse con query individual (NO usar `WHERE id IN (...)`)
- Response: Array de objetos `[{"id":N,"randomNumber":N}, ...]`
- Content-Type: `application/json`

---

### 5. `app/actions/fortunes.js` ❌ CREAR

```javascript
// TechEmpower Benchmark - Fortunes Test
// Route: GET /fortunes
// Response: HTML table con fortunes ordenadas

export function fortunes(req) {
    const conn = t.db.connect(process.env.DATABASE_URL);
    const fortunes = conn.query("SELECT id, message FROM fortune");
    
    // Agregar fortune adicional (requerido por el test)
    fortunes.push({
        id: 0,
        message: "Additional fortune added at request time."
    });
    
    // Ordenar por mensaje (string comparison)
    fortunes.sort((a, b) => {
        if (a.message < b.message) return -1;
        if (a.message > b.message) return 1;
        return 0;
    });
    
    // Escapar HTML (XSS protection - REQUERIDO)
    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };
    
    // Generar HTML
    let rows = '';
    for (const f of fortunes) {
        rows += `<tr><td>${f.id}</td><td>${escapeHtml(f.message)}</td></tr>`;
    }
    
    const html = `<!DOCTYPE html><html><head><title>Fortunes</title></head><body><table><tr><th>id</th><th>message</th></tr>${rows}</table></body></html>`;
    
    return t.response.html(html);
}
```

**Requisitos:**
- Obtener todos los fortunes de tabla `fortune`
- Agregar fortune adicional: `"Additional fortune added at request time."` con id 0
- Ordenar por `message` (en código, NO en SQL)
- Escapar HTML (hay un fortune con `<script>` tag)
- Soportar UTF-8 (hay un fortune en japonés)
- Content-Type: `text/html; charset=utf-8`

---

### 6. `app/actions/updates.js` ❌ CREAR

```javascript
// TechEmpower Benchmark - Database Updates Test
// Route: GET /updates?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function updates(req) {
    // Parsear y validar parámetro queries (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    const conn = t.db.connect(process.env.DATABASE_URL);
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        
        // 1. Leer el row
        const rows = conn.query(
            "SELECT id, \"randomNumber\" FROM world WHERE id = $1", 
            [id]
        );
        
        // 2. Generar nuevo randomNumber
        const newRandomNumber = Math.floor(Math.random() * 10000) + 1;
        
        // 3. Actualizar en DB
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

**Requisitos:**
- Parámetro `queries`: 1-500 (default 1, min 1, max 500)
- Para cada query: leer row, generar nuevo randomNumber, actualizar en DB
- Cada row debe tener un randomNumber ÚNICO (no todos el mismo)
- Response: Array con los valores actualizados
- Content-Type: `application/json`
- Se permite batch UPDATE pero NO batch SELECT

---

### 7. `app/actions/cached-queries.js` ❌ CREAR

```javascript
// TechEmpower Benchmark - Caching Test
// Route: GET /cached-queries?count=N
// Response: [{"id":1,"randomNumber":2}, ...]

// Cache en memoria (se llena al inicio o en primer request)
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
    
    // Parsear y validar parámetro count (1-500)
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

**Requisitos:**
- Parámetro `count`: 1-500 (default 1, min 1, max 500)
- Usar tabla `cachedworld` (misma estructura que `world`)
- Cachear en memoria (NO reverse-proxy cache)
- Response: Array de objetos desde cache
- Content-Type: `application/json`

---

### 8. `app/app.js` ⚠️ ACTUALIZAR

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

**Nota:** TechEmpower usa puerto 8080 por convención, pero puedes usar 3000.

---

### 9. `benchmark_config.json` ⚠️ ACTUALIZAR COMPLETO

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

### 10. `titanpl-postgres.dockerfile` ❌ CREAR

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

### 11. `README.md` ❌ CREAR

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

## 📊 Base de Datos - Schema

TechEmpower usa estas tablas en PostgreSQL:

```sql
-- Tabla world (10,000 rows)
CREATE TABLE world (
    id integer NOT NULL PRIMARY KEY,
    randomNumber integer NOT NULL
);

-- Tabla fortune (12 rows)
CREATE TABLE fortune (
    id integer NOT NULL PRIMARY KEY,
    message varchar(2048) NOT NULL
);

-- Tabla cachedworld (10,000 rows, misma estructura que world)
CREATE TABLE cachedworld (
    id integer NOT NULL PRIMARY KEY,
    randomNumber integer NOT NULL
);
```

**Conexión en TechEmpower:**
- Host: `tfb-database`
- Port: `5432`
- Database: `hello_world`
- User: `benchmarkdbuser`
- Password: `benchmarkdbpass`

---

## 🔒 Headers HTTP Obligatorios

**TODAS las respuestas deben incluir:**

| Header | Valor |
|--------|-------|
| `Content-Type` | Según el test (ver tabla arriba) |
| `Content-Length` o `Transfer-Encoding` | Tamaño del body |
| `Server` | `titanpl` |
| `Date` | RFC 7231: `Mon, 27 Jan 2025 10:00:00 GMT` |

---

## ✅ Checklist Completo

### Archivos Base
- [ ] `README.md` - Crear
- [ ] `benchmark_config.json` - Actualizar con todos los tests
- [ ] `titanpl-postgres.dockerfile` - Crear

### Actions
- [ ] `json.js` - ✅ Ya existe
- [ ] `plaintext.js` - Corregir texto a "Hello, World!"
- [ ] `db.js` - Crear
- [ ] `queries.js` - Crear
- [ ] `fortunes.js` - Crear (requiere `t.response.html()`)
- [ ] `updates.js` - Crear
- [ ] `cached-queries.js` - Crear

### App
- [ ] `app.js` - Agregar todas las rutas

### Runtime (Rust/Axum)
- [ ] Header `Server: titanpl` en todas las respuestas
- [ ] Header `Date` en todas las respuestas
- [ ] `t.response.text()` funcionando
- [ ] `t.response.html()` funcionando
- [ ] `t.db.connect()` con PostgreSQL

---

## 🧪 Probar Localmente

```bash
# Clonar repo
git clone https://github.com/TechEmpower/FrameworkBenchmarks.git
cd FrameworkBenchmarks

# Copiar titanpl
mkdir -p frameworks/JavaScript/titanpl
# (copiar archivos)

# Crear red Docker
docker network create tfb

# Probar solo JSON y Plaintext
./tfb --test titanpl --type json plaintext

# Probar todos los tests con Postgres
./tfb --test titanpl-postgres

# Modo debug
./tfb --mode debug --test titanpl-postgres
curl http://localhost:8080/json
curl http://localhost:8080/db
curl http://localhost:8080/queries?queries=5
curl http://localhost:8080/fortunes
curl http://localhost:8080/updates?queries=5
curl http://localhost:8080/cached-queries?count=10
```

---

## 📋 Resumen de Estado

| Archivo | Estado | Acción |
|---------|--------|--------|
| `benchmark_config.json` | ⚠️ Incompleto | Agregar test "postgres" |
| `titanpl.dockerfile` | ✅ Existe | Ninguna |
| `titanpl-postgres.dockerfile` | ❌ Falta | Crear |
| `README.md` | ❌ Falta | Crear |
| `app/app.js` | ⚠️ Incompleto | Agregar rutas |
| `app/actions/json.js` | ✅ OK | Ninguna |
| `app/actions/plaintext.js` | ⚠️ Error | Corregir texto |
| `app/actions/db.js` | ❌ Falta | Crear |
| `app/actions/queries.js` | ❌ Falta | Crear |
| `app/actions/fortunes.js` | ❌ Falta | Crear |
| `app/actions/updates.js` | ❌ Falta | Crear |
| `app/actions/cached-queries.js` | ❌ Falta | Crear |

---

## 🎯 Orden de Implementación Recomendado

1. **Fase 1 - Básico (sin DB):**
   - Corregir `plaintext.js`
   - Crear `README.md`
   - Verificar headers HTTP
   - PR inicial solo con JSON + Plaintext

2. **Fase 2 - Database:**
   - Crear `db.js`, `queries.js`, `updates.js`
   - Crear `titanpl-postgres.dockerfile`
   - Actualizar `benchmark_config.json`

3. **Fase 3 - HTML + Cache:**
   - Crear `fortunes.js` (requiere `t.response.html()`)
   - Crear `cached-queries.js`
   - PR con todos los tests