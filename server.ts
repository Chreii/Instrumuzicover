import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Cloudinary deletion endpoint
  app.post("/api/media/delete", async (req, res) => {
    const { publicId, resourceType } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: "publicId is required" });
    }

    try {
      console.log(`Attempting to delete Cloudinary resource: ${publicId} (${resourceType || 'auto'})`);
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType || 'auto'
      });
      
      console.log("Cloudinary deletion result:", result);
      res.json(result);
    } catch (error) {
      console.error("Cloudinary deletion error:", error);
      res.status(500).json({ error: "Failed to delete from Cloudinary" });
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
