// TechEmpower Benchmark - Caching Test
// Route: GET /cached-queries?count=N
// Response: [{"id":1,"randomNumber":2}, ...]

const CACHE_KEY = "worldCache";

function initCache() {
    // Check if cache already exists
    const cached = t.ls.get(CACHE_KEY);
    if (cached) return;

    // Load from database and cache
    // eslint-disable-next-line no-undef, titanpl/drift-only-titan-async
    const conn = t.db.connect(process.env.DATABASE_URL);
    // eslint-disable-next-line titanpl/drift-only-titan-async
    const rows = drift(conn.query("SELECT id, randomnumber FROM cachedworld"));

    const worldCache = {};
    for (const row of rows) {
        worldCache[row.id] = {
            id: row.id,
            randomNumber: row.randomnumber
        };
    }

    // Serialize and store
    t.ls.set(CACHE_KEY, JSON.stringify(worldCache));
}

function getCache() {
    const cached = t.ls.get(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
}

export function cachedQueries(req) {
    initCache();

    const worldCache = getCache();

    // Parse and validate count parameter (1-500)
    let count = parseInt(req.query.count) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;

    const results = [];

    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        results.push(worldCache[id]);
    }

    return t.response.json(results, {
        headers: {
            Server: "titanpl"
        }
    })
}