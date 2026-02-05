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

## Commands
```
# Verify
./tfb --test titanpl --mode verify --type json plaintext
./tfb --test titanpl-postgres --mode verify --type json plaintext db query fortune update cached-query
./tfb --mode verify --test titanpl-postgres fastify-postgres express-postgres hono-postgres elysia-postgres --type json plaintext db query fortune update cached-query

# Simple Comparation
./tfb --mode benchmark --test titanpl fastify express hono elysia --type json plaintext

# Complex Comparation
./tfb --mode benchmark --test titanpl-postgres fastify-postgres express-postgres hono-postgres elysia-postgres --type json plaintext db query fortune update cached-query

# 
```

## Maintainer

- [@ezet-galaxy](https://github.com/ezet-galaxy)
