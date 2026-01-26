// TechEmpower Benchmark - Single Database Query Test
// Route: GET /db
// Response: {"id":1234,"randomNumber":5678}

export function db(req) {
    const id = Math.floor(Math.random() * 10000) + 1;
    
    // eslint-disable-next-line no-undef
    const conn = t.db.connect(proccess.env.DATABASE_URL);
    const rows = conn.query(
        "SELECT id, \"randomNumber\" FROM world WHERE id = $1", 
        [id]
    );
    
    return {
        id: rows[0].id,
        randomNumber: rows[0].randomNumber
    };
}
