// TechEmpower Benchmark - Single Database Query Test
// Route: GET /db
// Response: {"id":1234,"randomNumber":5678}
import { db as database } from "@titan/native"
import { response } from "@titanpl/core"

export function db(req) {
    const id = Math.floor(Math.random() * 10000) + 1;

    // eslint-disable-next-line no-undef, titanpl/drift-only-titan-async
    const conn = drift(database.connect(process.env.DATABASE_URL));
    // eslint-disable-next-line titanpl/drift-only-titan-async
    const rows = drift(conn.query(
        "SELECT id, \"randomNumber\" FROM world WHERE id = $1",
        [id]
    ));

    return response.json({
        id: rows[0].id,
        randomNumber: rows[0].randomNumber
    }, {
        headers: {
            Server: "titanpl"
        }
    })
}
