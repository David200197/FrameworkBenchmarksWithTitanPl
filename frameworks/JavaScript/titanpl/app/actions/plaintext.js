// TechEmpower Benchmark - Plaintext Test
// Route: GET /plaintext
// Response: Hello, World!

export function plaintext(req) {
    return t.response.text("Hello, World!", {
        headers: {
            "Content-Type": "text/plain",
            Server: "titanpl"
        }
    });
}
