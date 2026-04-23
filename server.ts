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

  app.post("/api/generate-image", upload.single("referenceImage"), async (req: any, res: any) => {
    try {
      const apiKey = process.env.DIFY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "DIFY_API_KEY not configured on server" });
      }

      let uploadFileId = null;

      // STEP 1: If reference image exists, upload to Dify Files
      if (req.file) {
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("file", blob, req.file.originalname);
        formData.append("user", "abc-123");

        const uploadRes = await fetch("https://api.dify.ai/v1/files/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Dify upload failed: ${uploadRes.status} - ${errText}`);
        }
        
        const uploadData = await uploadRes.json();
        uploadFileId = uploadData.id;
        console.log(`Successfully uploaded image to Dify as ID: ${uploadFileId}`);
      }

      // STEP 2: Call Dify workflows/run
      const payload: any = {
        inputs: {
          artist_prompt: req.body.prompt || "",
          artist_version_id: req.body.modelName || "",
          artist_style: req.body.style || "",
          artist_color: req.body.colorMode || "",
          artist_trigger_word: req.body.triggerWord || "",
          user_id: "abc-123"
        },
        response_mode: "blocking",
        user: "abc-123"
      };

      if (uploadFileId) {
        payload.inputs.artist_image_input = {
          transfer_method: "local_file",
          upload_file_id: uploadFileId,
          type: "image"
        };
      }

      console.log("Calling Dify workflow with payload:", JSON.stringify(payload, null, 2));

      const workflowRes = await fetch("https://api.dify.ai/v1/workflows/run", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!workflowRes.ok) {
        const errText = await workflowRes.text();
        throw new Error(`Dify workflow failed: ${workflowRes.status} - ${errText}`);
      }

      const workflowData = await workflowRes.json();
      console.log("Dify workflow completed", workflowData);

      // Extract image URL from response (it is usually in workflowData.data.outputs)
      let imageUrl = null;
      if (workflowData.data && workflowData.data.outputs) {
        const outputs = workflowData.data.outputs;
        // Search through outputs to find an image or string URL
        for (const key of Object.keys(outputs)) {
          const val = outputs[key];
          if (typeof val === "string" && val.startsWith("http")) {
            imageUrl = val;
            break;
          } else if (typeof val === "object" && val !== null && val.url) {
            imageUrl = val.url; // In case they return a file object format
            break;
          } else if (typeof val === "object" && val !== null && val.image_url) {
            imageUrl = val.image_url;
            break;
          }
        }
        // Fallback: If no explicit URL found, just pass the raw data so frontend can handle
        if (!imageUrl) imageUrl = outputs; 
      }

      res.json({ success: true, imageUrl, rawOutputs: workflowData.data?.outputs });
    } catch (error: any) {
      console.error("Dify Generation Error:", error.message);
      res.status(500).json({ success: false, error: error.message });
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
