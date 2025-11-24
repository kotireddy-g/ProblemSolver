import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUploadedFileSchema, insertAnalysisResultSchema, insertClaudeAnalysisResultSchema } from "@shared/schema";
import { analyzeFileWithClaude } from "./services/claudeAPIService";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/files/upload", upload.array("files", 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const sessionId = req.body.sessionId;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileData = insertUploadedFileSchema.parse({
            filename: file.originalname,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            content: file.buffer.toString("utf-8"),
            sessionId,
          });
          return await storage.saveUploadedFile(fileData);
        })
      );

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  app.get("/api/files/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = await storage.getUploadedFiles(sessionId);
      res.json({ files });
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUploadedFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  app.delete("/api/session/:sessionId/reset", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteAllFilesInSession(sessionId);
      await storage.deleteAnalysisResult(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Reset session error:", error);
      res.status(500).json({ error: "Failed to reset session" });
    }
  });

  app.post("/api/analysis", async (req, res) => {
    try {
      const analysisData = insertAnalysisResultSchema.parse(req.body);
      const result = await storage.saveAnalysisResult(analysisData);
      res.json({ result });
    } catch (error) {
      console.error("Save analysis error:", error);
      res.status(500).json({ error: "Failed to save analysis" });
    }
  });

  app.get("/api/analysis/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await storage.getAnalysisResult(sessionId);
      if (!result) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json({ result });
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve analysis" });
    }
  });

  // Claude Analysis Endpoints
  app.post("/api/analyze-upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file as Express.Multer.File;
      const { sessionId } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      // First save the uploaded file
      const fileData = insertUploadedFileSchema.parse({
        filename: file.originalname,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        content: file.buffer.toString("utf-8"),
        sessionId,
      });
      const savedFile = await storage.saveUploadedFile(fileData);

      // Analyze with Claude
      const analysisResult = await analyzeFileWithClaude({
        fileName: file.originalname,
        fileContent: file.buffer.toString("utf-8"),
        fileType: file.mimetype,
      });

      // Save Claude analysis result
      const claudeAnalysisData = insertClaudeAnalysisResultSchema.parse({
        sessionId,
        fileId: savedFile.id,
        dataSufficiency: analysisResult.dataSufficiency,
        qualityScore: analysisResult.qualityScore,
        uiRenderingDecision: analysisResult.uiRenderingDecision,
        missingColumns: analysisResult.missingColumns,
        columnMappings: analysisResult.columnMappings,
        dataQualityIssues: analysisResult.dataQualityIssues,
        dataPreview: analysisResult.dataPreview,
        recommendations: analysisResult.recommendations,
        rawClaudeResponse: JSON.stringify(analysisResult),
      });

      const savedAnalysis = await storage.saveClaudeAnalysisResult(claudeAnalysisData);

      res.json({
        file: savedFile,
        analysis: savedAnalysis,
      });
    } catch (error) {
      console.error("Claude analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/claude-analysis/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const results = await storage.getClaudeAnalysisResults(sessionId);
      res.json({ results });
    } catch (error) {
      console.error("Get Claude analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve Claude analysis results" });
    }
  });

  app.get("/api/claude-analysis/:sessionId/:fileId", async (req, res) => {
    try {
      const { sessionId, fileId } = req.params;
      const result = await storage.getClaudeAnalysisResult(sessionId, fileId);
      if (!result) {
        return res.status(404).json({ error: "Claude analysis not found" });
      }
      res.json({ result });
    } catch (error) {
      console.error("Get Claude analysis error:", error);
      res.status(500).json({ error: "Failed to retrieve Claude analysis result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
