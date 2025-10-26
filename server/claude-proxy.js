// Minimal Claude (Anthropic) proxy for local development
// Usage: set CLAUDE_API_KEY env var and run `node claude-proxy.js`

const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: '*', // Permitir todas las solicitudes (ajusta según sea necesario)
}));
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/claude", async (req, res) => {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const API_KEY = process.env.CLAUDE_API_KEY;
    console.log("Using CLAUDE_SYSTEM:", CLAUDE_SYSTEM);
    if (!API_KEY) return res.status(500).json({ error: "CLAUDE_API_KEY not set on server" });

    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01",
                "model": "claude-sonnet-4-5",
                "max_tokens": 1000,
            },
            body: JSON.stringify({
                "model": "claude-sonnet-4-5",
                "max_tokens": 800,
                "temperature": 0.8,
                "system": "Eres un asistente de app bancaria. Respondes de forma concisa y clara a las preguntas del usuario sobre sus finanzas personales, gastos, ingresos y presupuestos. Utilizas un lenguaje amigable y profesional. SI te pregunto sobre MIS gastos o transacciones, utiliza como referencia estos datos:2025-10-25, Pago por hotel, 2200, 2025-10-24, Pago por transporte, 1750, 2025-10-23, Pago por transporte, 1750, 2025-10-22, Pago por alimentos, 1630, 2025-10-21, Pago por hospedaje, 1590, 2025-10-20, Pago por servicios, 1480, 2025-10-15, Pago por cena, 1320, 2025-10-17, Pago por taxi, 980, 2025-2-15, Pago por taxi, 150, 2025-2-19, Pago por taxi, 150, 2025-01-01, Pago por transporte, 164, 2025-01-01, Pago por entradas a eventos, 809, 2025-01-05, Pago por internet, 154, 2025-01-05, Pago por mantenimiento, 808, 2025-01-06, Pago por propinas, 139, 2025-01-06, Pago por transporte, 482, 2025-01-11, Pago por transporte, 666, 2025-01-11, Pago por servicios, 624, 2025-01-12, Pago por gasolina, 715, 2025-01-12, Pago por taxi, 608, 2025-01-14, Pago por entradas a eventos, 653, 2025-01-17, Pago por tour, 482, 2025-01-17, Pago por hospedaje, 334, 2025-01-19, Pago por alimentos, 154, 2025-01-20, Pago por tour, 149, 2025-01-21, Pago por entradas a eventos, 668, 2025-01-23, Pago por cena, 520, 2025-01-23, Pago por mantenimiento, 177. DE todas formas puedes inventar mas datospara dar respuestas que parezcan reales. Limita tus respuestas a responder directo, con un valor consiso, no mas de 5 lineas de texto. hoy es 26 de octubre del 2025",
                "messages": [
                    { "role": "user", "content": message }
                ]
            }),
        }); 

        if (!resp.ok) {
            const txt = await resp.text();
            console.log("Using CLAUDE_SYSTEM:", CLAUDE_SYSTEM);
            return res.status(resp.status).send(txt);
        }

        const json = await resp.json();

        // Extrae solo el texto del primer bloque de content
        let reply = "";
if (json?.content && Array.isArray(json.content) && json.content[0]?.text) {
    reply = json.content[0].text;
} else {
    reply = JSON.stringify(json);
}

// Eliminar asteriscos de la respuesta
reply = reply.replace(/\*/g, ''); // Elimina todos los asteriscos

return res.json({ reply });
    } catch (err) {
        console.error("Claude proxy error:", err);
        if (err?.response) {
            const txt = await err.response.text();
            console.error("Claude API response:", txt);
        }
        return res.status(500).json({ error: "internal" });
    }
});

app.listen(PORT, () => {
    console.log(`Claude proxy listening on http://localhost:${PORT}`);
});
