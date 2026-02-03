// TechEmpower Benchmark - Database Updates Test
// Route: GET /updates?queries=N
// Response: [{"id":1,"randomNumber":2}, ...]

export function updates(req) {
    // Parse and validate queries parameter (1-500)
    let count = parseInt(req.query.queries) || 1;
    if (count < 1) count = 1;
    if (count > 500) count = 500;

    // eslint-disable-next-line no-undef
    const conn = t.db.connect(proccess.env.DATABASE_URL);
    const results = [];

    for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 10000) + 1;

        // 1. Read the row
        const rows = conn.query(
            "SELECT id, \"randomNumber\" FROM world WHERE id = $1",
            [id]
        );

        // 2. Generate new randomNumber
        const newRandomNumber = Math.floor(Math.random() * 10000) + 1;

        // 3. Update in DB
        conn.query(
            "UPDATE world SET \"randomNumber\" = $1 WHERE id = $2",
            [newRandomNumber, id]
        );

        results.push({
            id: rows[0].id,
            randomNumber: newRandomNumber
        });
    }

    return t.response.json(results, {
        headers: {
            Server: "titanpl"
        }
    })
}
