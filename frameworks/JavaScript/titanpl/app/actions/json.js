// TechEmpower Benchmark - JSON Serialization Test
// Route: GET /json
// Expected response: {"message":"Hello, World!"}

export function json(req) {
    return {
        message: "Hello, World!"
    };
}