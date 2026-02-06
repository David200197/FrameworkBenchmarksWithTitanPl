// TechEmpower Benchmark - JSON Serialization Test
// Route: GET /json
// Response: {"message":"Hello, World!"}

export function json(req) {
    return t.response.json({
        message: "Hello, World!"
    }, {
        headers: {
            Server: "titanpl"
        }
    })
}
