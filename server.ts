import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIFY_MCP_URL = process.env.DIFY_MCP_URL!;
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 120000);

type JsonRpcEnvelope = {
  jsonrpc?: string;
  id?: string | number;
  result?: unknown;
  error?: { code?: number; message?: string };
};

async function mcpRpc(
  method: string,
  params: unknown
): Promise<{ ok: true; json: JsonRpcEnvelope } | { ok: false; status: number; text: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(DIFY_MCP_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-User-ID": "ak1234",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, text };
    try {
      return { ok: true, json: JSON.parse(text) };
    } catch (parseErr: any) {
      return { ok: false, status: 502, text: `Invalid JSON: ${parseErr.message} — body: ${text.slice(0, 200)}` };
    }
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return { ok: false, status: isAbort ? 504 : 502, text: isAbort ? "Upstream timed out" : err?.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  app.use(express.json({ limit: "1mb" }));

  app.post("/api/generate", async (req: any, res: any) => {
    const args = req.body?.params?.arguments;
    if (!args) return res.status(400).json({ success: false, error: "Missing arguments" });

    const init = await mcpRpc("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "tattty-generator", version: "1.0" },
    });
    if (!init.ok) return res.status(init.status).json({ success: false, error: init.text });

    const call = await mcpRpc("tools/call", {
      name: "TaTTTy-MCP",
      arguments: {
        user_story: args.user_story,
        artistic_style: args.artistic_style,
        color_prefrence: args.color_prefrence,
        number_of_outputs: args.number_of_outputs,
      },
    });
    if (!call.ok) return res.status(call.status).json({ success: false, error: call.text });
    if (call.json.error) return res.status(502).json({ success: false, error: call.json.error.message });

    const result = call.json.result as any;
    const textContent = result?.content?.find((c: any) => c.type === "text" && typeof c.text === "string")?.text;
    if (!textContent) return res.status(502).json({ success: false, error: "No content in response" });

    try {
      const parsed = JSON.parse(textContent);
      const urls = (Object.values(parsed) as any[]).filter((v) => typeof v === "string" && v.startsWith("http"));
      if (!urls.length) return res.status(502).json({ success: false, error: "No image URLs in response" });
      return res.json({ success: true, output: urls });
    } catch (parseErr: any) {
      return res.status(502).json({ success: false, error: parseErr.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
