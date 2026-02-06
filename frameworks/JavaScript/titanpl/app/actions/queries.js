// TechEmpower Benchmark - Multiple Database Queries Test
// Route: GET /queries?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function queries(req) {
    // Parse and validate queries parameter (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;

    // eslint-disable-next-line no-undef, titanpl/drift-only-titan-async
    const conn = t.db.connect(process.env.DATABASE_URL);
    const results = [];

    // IMPORTANT: Each query must be individual, DO NOT use IN clause
    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;
        // eslint-disable-next-line titanpl/drift-only-titan-async
        const rows = drift(conn.query(
            `SELECT id, "randomNumber" FROM world WHERE id = ${id}`
        ));
        // eslint-disable-next-line no-undef
        t.log(process.env.DATABASE_URL, rows)
        results.push({
            id: rows[0].id,
            randomNumber: rows[0].randomNumber
        });
    }

    return t.response.json(results, {
        headers: {
            Server: "titanpl"
        }
    })
}
