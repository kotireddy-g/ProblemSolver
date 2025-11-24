import { 
  type User, 
  type InsertUser, 
  type UploadedFile,
  type InsertUploadedFile,
  type AnalysisResult,
  type InsertAnalysisResult,
  type ClaudeAnalysisResult,
  type InsertClaudeAnalysisResult
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  saveUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFiles(sessionId: string): Promise<UploadedFile[]>;
  deleteUploadedFile(id: string): Promise<void>;
  deleteAllFilesInSession(sessionId: string): Promise<void>;
  
  saveAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResult(sessionId: string): Promise<AnalysisResult | undefined>;
  deleteAnalysisResult(sessionId: string): Promise<void>;
  
  saveClaudeAnalysisResult(result: InsertClaudeAnalysisResult): Promise<ClaudeAnalysisResult>;
  getClaudeAnalysisResult(sessionId: string, fileId: string): Promise<ClaudeAnalysisResult | undefined>;
  getClaudeAnalysisResults(sessionId: string): Promise<ClaudeAnalysisResult[]>;
  deleteClaudeAnalysisResult(sessionId: string, fileId: string): Promise<void>;
  deleteAllClaudeAnalysisResults(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private uploadedFiles: Map<string, UploadedFile>;
  private analysisResults: Map<string, AnalysisResult>;
  private claudeAnalysisResults: Map<string, ClaudeAnalysisResult>;

  constructor() {
    this.users = new Map();
    this.uploadedFiles = new Map();
    this.analysisResults = new Map();
    this.claudeAnalysisResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveUploadedFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
    };
    this.uploadedFiles.set(id, file);
    return file;
  }

  async getUploadedFiles(sessionId: string): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values())
      .filter(file => file.sessionId === sessionId)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async deleteUploadedFile(id: string): Promise<void> {
    this.uploadedFiles.delete(id);
  }

  async deleteAllFilesInSession(sessionId: string): Promise<void> {
    const filesToDelete = Array.from(this.uploadedFiles.entries())
      .filter(([_, file]) => file.sessionId === sessionId)
      .map(([id]) => id);
    
    filesToDelete.forEach(id => this.uploadedFiles.delete(id));
  }

  async saveAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = {
      ...insertResult,
      id,
      analyzedAt: new Date(),
      revenueImpact: insertResult.revenueImpact ?? null,
      avgDelayDays: insertResult.avgDelayDays ?? null,
      monthlyWaste: insertResult.monthlyWaste ?? null,
      criticalIssues: (insertResult.criticalIssues as Record<string, any>[] | null) ?? null,
    };
    this.analysisResults.set(insertResult.sessionId, result);
    return result;
  }

  async getAnalysisResult(sessionId: string): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(sessionId);
  }

  async deleteAnalysisResult(sessionId: string): Promise<void> {
    this.analysisResults.delete(sessionId);
  }

  async saveClaudeAnalysisResult(insertResult: InsertClaudeAnalysisResult): Promise<ClaudeAnalysisResult> {
    const id = randomUUID();
    const result: ClaudeAnalysisResult = {
      ...insertResult,
      id,
      analyzedAt: new Date(),
      missingColumns: insertResult.missingColumns ?? null,
      dataQualityIssues: insertResult.dataQualityIssues ?? null,
      recommendations: insertResult.recommendations ?? null,
      rawClaudeResponse: insertResult.rawClaudeResponse ?? null,
    };
    const key = `${insertResult.sessionId}-${insertResult.fileId}`;
    this.claudeAnalysisResults.set(key, result);
    return result;
  }

  async getClaudeAnalysisResult(sessionId: string, fileId: string): Promise<ClaudeAnalysisResult | undefined> {
    const key = `${sessionId}-${fileId}`;
    return this.claudeAnalysisResults.get(key);
  }

  async getClaudeAnalysisResults(sessionId: string): Promise<ClaudeAnalysisResult[]> {
    return Array.from(this.claudeAnalysisResults.values())
      .filter(result => result.sessionId === sessionId)
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime());
  }

  async deleteClaudeAnalysisResult(sessionId: string, fileId: string): Promise<void> {
    const key = `${sessionId}-${fileId}`;
    this.claudeAnalysisResults.delete(key);
  }

  async deleteAllClaudeAnalysisResults(sessionId: string): Promise<void> {
    const keysToDelete = Array.from(this.claudeAnalysisResults.entries())
      .filter(([_, result]) => result.sessionId === sessionId)
      .map(([key]) => key);
    
    keysToDelete.forEach(key => this.claudeAnalysisResults.delete(key));
  }
}

export const storage = new MemStorage();
