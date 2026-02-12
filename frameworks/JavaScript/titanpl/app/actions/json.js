// TechEmpower Benchmark - JSON Serialization Test
// Route: GET /json
// Response: {"message":"Hello, World!"}

const msg = "Hello, World!"

export function json(req) {
    return t.response.json({
        message: msg
    }, {
        headers: {
            Server: "titanpl"
        }
    })
}
