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
