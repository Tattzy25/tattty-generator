import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
// @ts-ignore
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API routes
  app.post("/api/build-model", async (req, res) => {
    const { modelName, triggerWord, artistName } = req.body;
    
    console.log(`Starting backend build process for model: ${modelName}`);
    
    // This is where the "MCP call" or backend-to-backend process would happen.    
    try {
      // Simulate backend processing time
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      res.json({ 
        success: true, 
        message: "Model built successfully on the backend.",
        modelId: `model_${Date.now()}`
      });
    } catch (error) {
      console.error("Backend build error:", error);
      res.status(500).json({ success: false, error: "Failed to build model on the backend." });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/generate-image", express.json(), async (req: any, res: any) => {
    const payload = req.body;

    console.log("Calling MCP server with payload:", JSON.stringify(payload, null, 2));

    try {
      const mcpUrl = process.env.MCP_SERVER_URL || "";
      const mcpResponse = await fetch(mcpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!mcpResponse.ok) {
        throw new Error(`MCP Server responded with status: ${mcpResponse.status}`);
      }

      const data = await mcpResponse.json();
      console.log("MCP Response:", data);
      res.json(data);
    } catch (error: any) {
      console.error("MCP Server Request Error:", error);
      res.status(500).json({ error: { message: error.message } });
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
