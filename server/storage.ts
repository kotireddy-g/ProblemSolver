import { 
  type User, 
  type InsertUser, 
  type UploadedFile,
  type InsertUploadedFile,
  type AnalysisResult,
  type InsertAnalysisResult
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private uploadedFiles: Map<string, UploadedFile>;
  private analysisResults: Map<string, AnalysisResult>;

  constructor() {
    this.users = new Map();
    this.uploadedFiles = new Map();
    this.analysisResults = new Map();
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
}

export const storage = new MemStorage();
