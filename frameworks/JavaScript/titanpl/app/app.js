import t from "../titan/titan.js";

// Test 1: JSON Serialization
t.get("/json").action("json")

// Test 2: Single Database Query
t.get("/db").action("db")

// Test 3: Multiple Database Queries
t.get("/queries").action("queries")

// Test 4: Fortunes
t.get("/fortunes").action("fortunes")

// Test 5: Database Updates
t.get("/updates").action("updates")

// Test 6: Plaintext
t.get("/plaintext").action("plaintext")

// Test 7: Cached Queries
t.get("/cached-queries").action("cachedQueries")

t.start(8080, "titanpl running on port 8080");
