// TechEmpower Benchmark - Multiple Database Queries Test
// Route: GET /queries?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function queries(req) {
    // Parse and validate queries parameter (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;
    
    // eslint-disable-next-line no-undef
    const conn = t.db.connect(proccess.env.DATABASE_URL);
    const results = [];
    
    // IMPORTANT: Each query must be individual, DO NOT use IN clause
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
