// TechEmpower Benchmark - Fortunes Test
// Route: GET /fortunes
// Response: HTML table with sorted fortunes

import { db } from "@titan/native"
import { response } from "@titanpl/core"

export function fortunes(req) {
    // eslint-disable-next-line no-undef, titanpl/drift-only-titan-async
    const conn = drift(db.connect(process.env.DATABASE_URL));
    // eslint-disable-next-line titanpl/drift-only-titan-async
    const fortunes = drift(conn.query("SELECT id, message FROM fortune"));

    // Add additional fortune (required by the test)
    fortunes.push({
        id: 0,
        message: "Additional fortune added at request time."
    });

    // Sort by message (string comparison)
    fortunes.sort((a, b) => {
        if (a.message < b.message) return -1;
        if (a.message > b.message) return 1;
        return 0;
    });

    // Escape HTML (XSS protection - REQUIRED)
    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    };

    // Generate HTML
    let rows = '';
    for (const f of fortunes) {
        rows += `<tr><td>${f.id}</td><td>${escapeHtml(f.message)}</td></tr>`;
    }

    const html = `<!DOCTYPE html><html><head><title>Fortunes</title></head><body><table><tr><th>id</th><th>message</th></tr>${rows}</table></body></html>`;

    return response.html(html, {
        headers: {
            Server: "titanpl"
        }
    });
}
