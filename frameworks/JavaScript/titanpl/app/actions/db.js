// TechEmpower Benchmark - Single Database Query Test
// Route: GET /db
// Response: {"id":1234,"randomNumber":5678}

export function db(req) {
    const id = Math.floor(Math.random() * 10000) + 1;

    // eslint-disable-next-line no-undef
    const conn = t.db.connect(process.env.DATABASE_URL);
    // eslint-disable-next-line titanpl/drift-only-titan-async
    const rows = drift(conn.query(
        `SELECT id, randomnumber FROM world WHERE id = ${id}`,
    ));

    return t.response.json({
        id: rows[0].id,
        randomNumber: rows[0].randomnumber
    }, {
        headers: {
            Server: "titanpl"
        }
    })
}