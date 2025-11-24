import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, CheckCircle, AlertTriangle, XCircle, Upload, Download } from "lucide-react";
import { UploadSummary } from "./UploadSummary";
import { AnalysisResults } from "./AnalysisResults";
import { DataPreviewTable } from "./DataPreviewTable";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export interface ClaudeAnalysisResult {
  id: string;
  sessionId: string;
  fileId: string;
  analyzedAt: Date;
  dataSufficiency: 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT';
  qualityScore: number;
  uiRenderingDecision: 'USE_STANDARD_UI' | 'USE_CUSTOM_UI';
  missingColumns: {
    column: string;
    importance: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  columnMappings: {
    originalName: string;
    standardName: string;
    dataType: string;
    completenessPercentage: number;
  }[];
  dataQualityIssues: {
    type: string;
    description: string;
    affectedRows: number[];
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  dataPreview: Record<string, any>[];
  recommendations: {
    action: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  sessionId: string;
}

interface FileReviewContainerProps {
  sessionId: string;
  onProceedWithData: (analysisResult: ClaudeAnalysisResult) => void;
  onUploadDifferentFile: () => void;
  onDownloadTemplate: () => void;
}

export function FileReviewContainer({
  sessionId,
  onProceedWithData,
  onUploadDifferentFile,
  onDownloadTemplate,
}: FileReviewContainerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ClaudeAnalysisResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<ClaudeAnalysisResult | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    analysis: false,
    preview: false,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCombiningData, setIsCombiningData] = useState(false);
  const { toast } = useToast();

  // Fetch analysis results for the session
  useEffect(() => {
    if (sessionId) {
      fetchAnalysisResults();
    }
  }, [sessionId]);

  const fetchAnalysisResults = async () => {
    try {
      const response = await fetch(`/api/claude-analysis/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data.results || []);
        if (data.results && data.results.length > 0) {
          setSelectedFile(data.results[0]); // Select the most recent file
        }
      }
    } catch (error) {
      console.error('Failed to fetch analysis results:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis results",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/analyze-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      // Refresh analysis results
      await fetchAnalysisResults();
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze file",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCombineAndAnalyze = async () => {
    if (analysisResults.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload at least one file first",
        variant: "destructive"
      });
      return;
    }

    setIsCombiningData(true);
    
    try {
      const fileIds = analysisResults.map(result => result.fileId);
      
      const response = await fetch('/api/analyze-combined', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          fileIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Combined analysis failed');
      }

      const result = await response.json();
      
      // Refresh analysis results to include the combined analysis
      await fetchAnalysisResults();
      
      toast({
        title: "Combined Analysis Complete",
        description: `Successfully analyzed ${result.filesAnalyzed} files together`,
      });
    } catch (error) {
      toast({
        title: "Combined Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze combined data",
        variant: "destructive"
      });
    } finally {
      setIsCombiningData(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles = files.filter(file => 
        file.type === 'text/csv' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      );
      
      if (validFiles.length > 0) {
        // Handle multiple files
        validFiles.forEach(file => handleFileUpload(file));
        
        if (validFiles.length < files.length) {
          toast({
            title: "Some Files Skipped",
            description: `${validFiles.length} files uploaded, ${files.length - validFiles.length} invalid files skipped`,
          });
        }
      } else {
        toast({
          title: "Invalid File Types",
          description: "Please upload CSV or Excel files only",
          variant: "destructive"
        });
      }
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (dataSufficiency: string, qualityScore: number) => {
    if (dataSufficiency === 'COMPLETE' && qualityScore >= 80) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (dataSufficiency === 'PARTIAL' || qualityScore >= 60) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (dataSufficiency: string, qualityScore: number) => {
    if (dataSufficiency === 'COMPLETE' && qualityScore >= 80) {
      return "Ready";
    } else if (dataSufficiency === 'PARTIAL' || qualityScore >= 60) {
      return "Issues Found";
    } else {
      return "Insufficient Data";
    }
  };

  const canProceed = selectedFile && 
    (selectedFile.dataSufficiency === 'COMPLETE' || 
     (selectedFile.dataSufficiency === 'PARTIAL' && selectedFile.qualityScore >= 60));

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Analyzing Your File</h3>
          <p className="text-muted-foreground">Claude is reviewing your data structure and quality...</p>
        </div>
      </div>
    );
  }

  if (!selectedFile && analysisResults.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File for Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-4">
              {isDragOver 
                ? 'Drop your files here to analyze' 
                : 'Upload Excel or CSV files to get started with intelligent analysis. Multiple files and sheets are supported.'
              }
            </p>
            <div className="flex gap-2 justify-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    // Handle multiple files
                    files.forEach(file => handleFileUpload(file));
                  }
                }}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <Button variant="outline" onClick={onDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* File Selection */}
      {analysisResults.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select File to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {analysisResults.map((result) => (
                <Button
                  key={result.id}
                  variant={selectedFile?.id === result.id ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setSelectedFile(result)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {getStatusIcon(result.dataSufficiency, result.qualityScore)}
                    <div className="text-left flex-1">
                      <div className="font-medium">{result.fileId}</div>
                      <div className="text-sm text-muted-foreground">
                        {getStatusText(result.dataSufficiency, result.qualityScore)} • 
                        Quality: {result.qualityScore}%
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFile && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Upload Summary */}
            <UploadSummary
              analysisResult={selectedFile}
              isExpanded={expandedSections.summary}
              onToggle={() => toggleSection('summary')}
            />

            {/* Analysis Results */}
            <AnalysisResults
              analysisResult={selectedFile}
              isExpanded={expandedSections.analysis}
              onToggle={() => toggleSection('analysis')}
            />

            {/* Data Preview */}
            <DataPreviewTable
              analysisResult={selectedFile}
              isExpanded={expandedSections.preview}
              onToggle={() => toggleSection('preview')}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {analysisResults.length > 1 && (
                    <Button
                      onClick={handleCombineAndAnalyze}
                      disabled={isCombiningData}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isCombiningData ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Combining Data...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Combine & Analyze All Files
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => onProceedWithData(selectedFile)}
                    disabled={!canProceed}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Proceed with Current Data
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Reset the current analysis and trigger file upload
                      setSelectedFile(null);
                      setAnalysisResults([]);
                      document.getElementById('file-upload-different')?.click();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Different File
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={onDownloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Data Template
                  </Button>
                </div>

                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      // Handle multiple files
                      files.forEach(file => handleFileUpload(file));
                    }
                  }}
                  style={{ display: 'none' }}
                  id="file-upload-different"
                />

                {!canProceed && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      The current file has insufficient data quality to proceed. 
                      Please upload a different file or download our template for the expected format.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
