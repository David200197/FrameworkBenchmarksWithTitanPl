// TechEmpower Benchmark - JSON Serialization Test
// Route: GET /json
// Response: {"message":"Hello, World!"}

import { response } from "@titanpl/core"

export function json(req) {
    return response.json({
        message: "Hello, World!"
    }, {
        headers: {
            Server: "titanpl"
        }
    })
}
