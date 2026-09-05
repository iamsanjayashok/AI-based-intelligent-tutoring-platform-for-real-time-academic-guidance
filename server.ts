import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import * as pdfParse from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import officeParser from "officeparser";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

console.log("Starting custom Express + Vite server...");

// Handle pdf-parse import quirk
const pdfParser = (pdfParse as any).default || pdfParse;
if (typeof pdfParser !== 'function') {
  console.error("CRITICAL: pdf-parse is not a function. Import might be broken.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use("/uploads", express.static(uploadsDir));

  // Heath check
  app.get("/api/health", (req: Request, res: Response) => {
    console.log("Health check request received");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const upload = multer({ storage: multer.memoryStorage() });

  // Robust API route handling
  const apiRouter = express.Router();

  // PDF Processing Endpoint
  apiRouter.post("/process-pdf", upload.single("file"), async (req: Request, res: Response) => {
    console.log("Processing PDF:", req.file?.originalname);
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const fileId = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileId);
      fs.writeFileSync(filePath, req.file.buffer);
      const fileURL = `/uploads/${fileId}`;

      const pdfBuffer = req.file.buffer;
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const totalPages = pdfDoc.getPageCount();
      
      const pageCount = Math.min(totalPages, 50);
      const pages = [];

      for (let i = 0; i < pageCount; i++) {
        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
        subDoc.addPage(copiedPage);
        const subBuffer = Buffer.from(await subDoc.save());
        
        try {
          const worker = (pdfParse as any).default || pdfParse;
          const data = await worker(subBuffer);
          pages.push({
            pageNumber: i + 1,
            text: data.text.trim()
          });
        } catch (e) {
          console.warn(`Failed to parse text for page ${i + 1}:`, e);
          pages.push({ pageNumber: i + 1, text: "[Text extraction failed for this page]" });
        }
      }

      res.json({
        title: req.file.originalname,
        type: "pdf",
        url: fileURL,
        pages,
        truncated: totalPages > 50
      });
    } catch (error) {
      console.error("PDF Processing Error:", error);
      res.status(500).json({ error: "Failed to process PDF", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // PPT and Word Processing Endpoint
  apiRouter.post("/process-doc", upload.single("file"), async (req: Request, res: Response) => {
    console.log("Processing Doc:", req.file?.originalname);
    let tempPath = "";
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const fileId = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileId);
      fs.writeFileSync(filePath, req.file.buffer);
      const fileURL = `/uploads/${fileId}`;

      const tempDir = os.tmpdir();
      tempPath = path.join(tempDir, `upload_${Date.now()}_${req.file.originalname}`);
      fs.writeFileSync(tempPath, req.file.buffer);

      const data = await new Promise((resolve, reject) => {
        officeParser.parseOffice(tempPath, (data: any, err: any) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }

      if (!data) {
        return res.status(500).json({ error: "Document parsing returned no data" });
      }

      let textContent = typeof data === 'string' ? data : JSON.stringify(data);
      if (typeof data === 'object') {
        const extractText = (obj: any): string => {
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.map(extractText).join('\n');
          if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).map(extractText).join('\n');
          }
          return '';
        };
        textContent = extractText(data);
      }

      const chunks = [];
      const chunkSize = 2000;
      for (let i = 0; i < textContent.length; i += chunkSize) {
        chunks.push({
          pageNumber: Math.floor(i / chunkSize) + 1,
          text: textContent.substring(i, i + chunkSize).trim()
        });
      }

      res.json({
        title: req.file.originalname,
        type: req.file.originalname.endsWith('.pptx') || req.file.originalname.endsWith('.ppt') ? "ppt" : "doc",
        url: fileURL,
        pages: chunks.slice(0, 50),
        truncated: chunks.length > 50
      });
    } catch (error) {
      console.error("Doc Processing Error:", error);
      if (tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
      res.status(500).json({ error: "Failed to process document", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Helper: Extract YouTube Video ID
  function extractYouTubeVideoId(input: string): string | null {
    if (!input) return null;
    const str = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }
    const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }

  // Helper: Fetch YouTube Metadata via oEmbed
  async function fetchYouTubeMetadata(videoId: string) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
      const res = await fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || "YouTube Video",
          author: data.author_name || "YouTube Creator",
          thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    } catch (err) {
      console.warn("oEmbed fetch failed:", err);
    }
    return {
      title: "YouTube Video",
      author: "YouTube Creator",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // YouTube Video Transcript Extraction Endpoint
  apiRouter.post("/process-youtube", async (req: Request, res: Response) => {
    const { url } = req.body;
    console.log("Processing YouTube URL:", url);

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Please provide a valid YouTube video URL or Video ID." });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({ 
        error: "Could not recognize a valid YouTube Video ID. Please check the link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)." 
      });
    }

    try {
      // 1. Fetch metadata (Title, Author, Thumbnail)
      const metadata = await fetchYouTubeMetadata(videoId);
      console.log(`YouTube Metadata for [${videoId}]:`, metadata.title, "by", metadata.author);

      let transcriptText = "";
      let source: "official_transcript" | "ai_synthesis" = "official_transcript";
      let segmentCount = 0;

      // 2. Attempt Tier 1: Fetch real transcript via youtube-transcript
      try {
        const segments = await Promise.race([
          YoutubeTranscript.fetchTranscript(videoId),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Transcript fetch timeout")), 6000))
        ]);

        if (segments && segments.length > 0) {
          segmentCount = segments.length;
          transcriptText = segments.map((s: any) => {
            const totalSecs = Math.floor((s.offset || 0) / 1000);
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            return `[${timeStr}] ${s.text}`;
          }).join('\n');
          console.log(`Successfully fetched official transcript for [${videoId}]: ${segmentCount} segments`);
        }
      } catch (ytErr: any) {
        console.log(`Direct transcript extraction unavailable for [${videoId}] (${ytErr.message}). Engaging AI curriculum extraction fallback.`);
      }

      // 3. Attempt Tier 2: If official captions are unavailable, use Gemini AI
      if (!transcriptText || transcriptText.trim().length === 0) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return res.status(422).json({
            error: "YouTube captions are disabled for this video, and GEMINI_API_KEY is required to generate the transcript."
          });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an expert academic curriculum transcriber.
The user wants to study and prepare a comprehensive course from this YouTube video:
Video Title: "${metadata.title}"
Channel / Author: "${metadata.author}"
YouTube URL: "https://www.youtube.com/watch?v=${videoId}"

Please provide an exhaustive, high-fidelity spoken transcript and lecture breakdown of this video.
Cover all mathematical concepts, terminology, explanations, code snippets (if applicable), and key arguments presented by the speaker in chronological order.
Format this as a detailed chronological transcript with timestamp indicators (e.g. [00:00], [03:30], [07:15], etc.) so that the educational material can be transformed into rigorous learning units, reading material, and lecture slides.`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        transcriptText = aiResponse.text || "";
        source = "ai_synthesis";
        segmentCount = transcriptText.split('\n').filter(l => l.trim().length > 0).length;
        console.log(`Successfully generated lecture transcript via AI for [${videoId}]: ${transcriptText.length} characters`);
      }

      if (!transcriptText || transcriptText.trim().length === 0) {
        return res.status(500).json({ error: "Failed to extract or reconstruct transcript for this video." });
      }

      // 4. Split into document pages for archiving
      const chunks = [];
      const chunkSize = 2000;
      for (let i = 0; i < transcriptText.length; i += chunkSize) {
        chunks.push({
          pageNumber: Math.floor(i / chunkSize) + 1,
          text: transcriptText.substring(i, i + chunkSize).trim()
        });
      }

      return res.json({
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: metadata.title,
        author: metadata.author,
        thumbnail: metadata.thumbnail,
        transcript: transcriptText,
        source,
        segmentCount,
        pages: chunks.slice(0, 50),
        truncated: chunks.length > 50
      });

    } catch (error: any) {
      console.error("YouTube Processing Error:", error);
      res.status(500).json({ 
        error: "Failed to process YouTube video", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.use("/api", apiRouter);

  // API 404 Catch-all (to prevent HTML fallback for API calls)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err instanceof Error ? err.message : String(err) 
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Retrying in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    } else {
      console.error("Server error:", e);
    }
  });
}

startServer();
