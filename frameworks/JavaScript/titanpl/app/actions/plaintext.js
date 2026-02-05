// TechEmpower Benchmark - Plaintext Test
// Route: GET /plaintext
// Response: Hello, World!

import { response } from "@titanpl/core"

export function plaintext(req) {
    return response.text("Hello, World!", {
        headers: {
            "Content-Type": "text/plain",
            Server: "titanpl"
        }
    });
}
