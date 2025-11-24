import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  content: text("content").notNull(),
  sessionId: varchar("session_id").notNull(),
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
  totalRecords: integer("total_records").notNull(),
  outliers: integer("outliers").notNull(),
  normal: integer("normal").notNull(),
  delayed: integer("delayed").notNull(),
  healthScore: integer("health_score").notNull(),
  revenueImpact: real("revenue_impact"),
  avgDelayDays: real("avg_delay_days"),
  monthlyWaste: real("monthly_waste"),
  matrixData: json("matrix_data").$type<Record<string, Record<string, any>>>().notNull(),
  problemData: json("problem_data").$type<Record<string, any>>().notNull(),
  criticalIssues: json("critical_issues").$type<Record<string, any>[]>(),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  analyzedAt: true,
});

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Claude Analysis Results Schema
export const claudeAnalysisResults = pgTable("claude_analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  fileId: varchar("file_id").notNull(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
  dataSufficiency: varchar("data_sufficiency", { enum: ["COMPLETE", "PARTIAL", "INSUFFICIENT"] }).notNull(),
  qualityScore: integer("quality_score").notNull(), // 0-100
  uiRenderingDecision: varchar("ui_rendering_decision", { enum: ["USE_STANDARD_UI", "USE_CUSTOM_UI"] }).notNull(),
  missingColumns: json("missing_columns").$type<{
    column: string;
    importance: "Critical" | "High" | "Medium" | "Low";
    description: string;
  }[]>(),
  columnMappings: json("column_mappings").$type<{
    originalName: string;
    standardName: string;
    dataType: string;
    completenessPercentage: number;
  }[]>().notNull(),
  dataQualityIssues: json("data_quality_issues").$type<{
    type: string;
    description: string;
    affectedRows: number[];
    severity: "Critical" | "High" | "Medium" | "Low";
  }[]>(),
  dataPreview: json("data_preview").$type<Record<string, any>[]>().notNull(),
  recommendations: json("recommendations").$type<{
    action: string;
    description: string;
    priority: "Critical" | "High" | "Medium" | "Low";
  }[]>(),
  rawClaudeResponse: text("raw_claude_response"),
});

export const insertClaudeAnalysisResultSchema = createInsertSchema(claudeAnalysisResults).omit({
  id: true,
  analyzedAt: true,
});

export type InsertClaudeAnalysisResult = z.infer<typeof insertClaudeAnalysisResultSchema>;
export type ClaudeAnalysisResult = typeof claudeAnalysisResults.$inferSelect;
