# Titan Planet (titanpl) Benchmarking Test

Titan Planet is a JavaScript-first backend framework that embeds JS actions into a Rust + Axum server and ships as a single native binary. Routes are compiled to static metadata; only actions run in the embedded JS runtime.

**Key Features:**
- JavaScript developer experience
- Rust + Axum performance
- Native binary output (no Node.js in production)
- Zero configuration

### Test URLs

* JSON Serialization: http://localhost:3000/json
* Plaintext: http://localhost:3000/plaintext

### How It Works

Titan Planet compiles JavaScript actions into a Rust binary. The routing is handled natively by Axum, while the action logic runs in an embedded V8 JavaScript runtime.

### Source

* [Titan Planet GitHub](https://github.com/ezet-galaxy/titanpl)
* [Documentation](https://titan-docs-ez.vercel.app/docs)

### Maintainers

* [@ezet-galaxy](https://github.com/ezet-galaxy)