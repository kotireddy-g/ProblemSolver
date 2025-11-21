import { useState, useEffect } from "react";
import { TunnelAnimation } from "@/components/dashboard/tunnel-animation";
import { MatrixGrid } from "@/components/dashboard/matrix-grid";
import { ProblemSection } from "@/components/dashboard/problem-section";
import { FileUpload } from "@/components/dashboard/file-upload";
import { FileManager, UploadedFile } from "@/components/dashboard/file-manager";
import { generateSyntheticData, DashboardData, MatrixCell } from "@/lib/procurement-data";
import { processExcelFile } from "@/lib/excel-processor";
import { processMultipleFiles, UploadedFileData } from "@/lib/multi-file-processor";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Play, Activity, TrendingUp, DollarSign, ArrowRight, Database, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [mode, setMode] = useState<'prototype' | 'live'>('prototype');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [data, setData] = useState<DashboardData>(generateSyntheticData('monthly'));
  const [liveData, setLiveData] = useState<DashboardData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCell, setSelectedCell] = useState<{category: string, velocity: string, cell: MatrixCell} | null>(null);
  const { toast } = useToast();

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Fetch uploaded files for session
  const { data: filesData, refetch: refetchFiles } = useQuery<UploadedFile[]>({
    queryKey: ['/api/files', sessionId],
    enabled: mode === 'live' && !!sessionId,
    queryFn: async () => {
      if (!sessionId) return [];
      try {
        const res = await fetch(`/api/files/${sessionId}`);
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    }
  });

  // Update uploaded files from query
  useEffect(() => {
    if (filesData) {
      setUploadedFiles(filesData);
    }
  }, [filesData]);

  // Reset when switching modes
  useEffect(() => {
    if (mode === 'prototype') {
      setHasData(true);
      setData(generateSyntheticData(filter));
    } else {
      if (liveData) {
        setData(liveData);
        setHasData(true);
      } else {
        setHasData(false);
        setData(generateSyntheticData('monthly'));
      }
    }
  }, [mode, filter, liveData]);

  const handleStartAnalysis = () => {
    if (mode === 'live') {
      setShowUpload(true);
    } else {
      setIsAnalyzing(true);
      setHasData(false);
      setTimeout(() => {
        setHasData(true);
        setIsAnalyzing(false); 
        toast({
          title: "Analysis Complete",
          description: "Prototype data loaded successfully.",
        });
      }, 3000);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setShowUpload(false);
    setIsAnalyzing(true);
    setHasData(false);

    try {
      // Upload files to server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('sessionId', sessionId);

      const uploadedFilesData = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadedFilesData.ok) {
        throw new Error('Upload failed');
      }

      const uploadedFilesResponse: UploadedFile[] = await uploadedFilesData.json();
      
      // Read file contents for processing
      const fileDataPromises = files.map(async (file) => {
        const content = await file.text();
        return {
          id: crypto.randomUUID(),
          filename: file.name,
          content: content,
        } as UploadedFileData;
      });

      const fileData = await Promise.all(fileDataPromises);
      
      // Process files using multi-file processor
      const processedData = await processMultipleFiles(fileData);
      
      setTimeout(async () => {
        setLiveData(processedData);
        setData(processedData);
        setHasData(true);
        setIsAnalyzing(false);
        setUploadedFiles(uploadedFilesResponse);
        
        // Save analysis results
        try {
          await apiRequest('POST', '/api/analysis', {
            sessionId,
            data: processedData,
          });
        } catch (error) {
          console.error('Failed to save analysis:', error);
        }

        // Refetch files
        refetchFiles();
        
        toast({
          title: "Files Processed Successfully",
          description: `Analyzed ${files.length} file(s) with multi-file processing.`,
        });
      }, 3000);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Could not process files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: "File Removed",
        description: "File has been removed from the session.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove file.",
        variant: "destructive"
      });
    }
  };

  const handleResetAll = async () => {
    try {
      await apiRequest('DELETE', `/api/session/${sessionId}/reset`, undefined);
      
      setUploadedFiles([]);
      setLiveData(null);
      setHasData(false);
      setData(generateSyntheticData('monthly'));
      
      queryClient.invalidateQueries({ queryKey: ['/api/files', sessionId] });
      
      toast({
        title: "Session Reset",
        description: "All files and analysis data have been cleared.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Could not reset session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddMoreFiles = () => {
    setShowUpload(true);
  };

  // Check if critical issues exist
  const hasCriticalIssues = data.criticalIssues && data.criticalIssues.length > 0;
  const criticalCount = data.criticalIssues?.filter(i => i.severity === 'critical').length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold">
              PI
            </div>
            <h1 className="text-lg font-display font-bold text-white tracking-wide">
              Procurement<span className="text-primary">Intelligence</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMode('prototype')}
                className={cn(
                  "rounded-full h-7 text-xs px-3 hover:bg-transparent hover:text-white",
                  mode === 'prototype' ? "bg-primary text-black hover:bg-primary hover:text-black" : "text-muted-foreground"
                )}
                data-testid="button-mode-prototype"
              >
                Prototype
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setMode('live')}
                className={cn(
                  "rounded-full h-7 text-xs px-3 hover:bg-transparent hover:text-white",
                  mode === 'live' ? "bg-green-500 text-black hover:bg-green-500 hover:text-black" : "text-muted-foreground"
                )}
                data-testid="button-mode-live"
              >
                Live Data
              </Button>
            </div>

            {hasData && (
              <Link href="/roadmap">
                <Button variant="outline" className="hidden md:flex border-primary/50 text-primary hover:bg-primary/10" data-testid="button-view-roadmap">
                  View Solution Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}

            {!hasData && !isAnalyzing && mode === 'live' && (
              <Button 
                onClick={handleStartAnalysis} 
                className="bg-green-500 text-black hover:bg-green-600"
                data-testid="button-upload-data"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Data
              </Button>
            )}

            {!hasData && !isAnalyzing && mode === 'prototype' && (
              <Button 
                onClick={handleStartAnalysis} 
                className="bg-primary text-black hover:bg-primary/90"
                data-testid="button-run-analysis"
              >
                <Play className="mr-2 h-4 w-4" />
                Re-Run Analysis
              </Button>
            )}

            {isAnalyzing && (
               <Button disabled className="bg-white/10 text-white" data-testid="button-processing">
                 <Activity className="mr-2 h-4 w-4 animate-spin" />
                 Processing...
               </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Critical Revenue Impact Banner */}
        {hasCriticalIssues && hasData && (
          <Alert className="bg-red-500/10 border-red-500/50 text-red-400" data-testid="alert-critical-issues">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-bold text-lg text-red-300">
                    {criticalCount} Critical Issue{criticalCount !== 1 ? 's' : ''} Detected
                  </p>
                  <p className="text-sm text-red-400/80 mt-1">
                    Revenue Impact: {data.revenueImpact ? `₹${(data.revenueImpact / 100000).toFixed(1)}L/month` : data.financial?.revenueLoss || 'High'} 
                    {data.avgDelayDays ? ` • Avg Delay: ${data.avgDelayDays} days` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {data.criticalIssues?.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30" data-testid={`critical-issue-${idx}`}>
                      <p className="text-xs font-medium text-red-200">{issue.type}</p>
                      <p className="text-xs text-red-400/80">{issue.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Manager - Show when files are uploaded in live mode */}
        {mode === 'live' && uploadedFiles.length > 0 && (
          <FileManager 
            files={uploadedFiles}
            onRemoveFile={handleRemoveFile}
            onResetAll={handleResetAll}
            onAddMore={handleAddMoreFiles}
          />
        )}

        {/* Top Section: Tunnel & Controls */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h2 className="text-xl text-white font-medium">Data Ingestion Pipeline</h2>
                {mode === 'live' && hasData && (
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1" data-testid="badge-live-source">
                    <Database className="h-3 w-3" /> Live Source
                  </span>
                )}
             </div>
             
             {hasData && (
               <Tabs defaultValue="monthly" onValueChange={(v) => setFilter(v as any)} className="w-[400px]">
                 <TabsList className="grid w-full grid-cols-4 bg-white/5">
                   <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                   <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
                   <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
                   <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
                 </TabsList>
               </Tabs>
             )}
          </div>
          
          <TunnelAnimation isActive={isAnalyzing || (hasData && mode === 'prototype')} />
        </section>

        <AnimatePresence>
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4" data-testid="card-outliers">
                  <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                    <AlertTriangleIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.outliers}</div>
                    <div className="text-xs text-muted-foreground">Outliers Detected</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4" data-testid="card-normal">
                  <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.normal}</div>
                    <div className="text-xs text-muted-foreground">Normal Operations</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4" data-testid="card-delayed">
                  <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.delayed}</div>
                    <div className="text-xs text-muted-foreground">Delayed Payments</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4" data-testid="card-health">
                  <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.healthScore}/100</div>
                    <div className="text-xs text-muted-foreground">Procurement Health</div>
                  </div>
                </div>
              </div>

              {/* Matrix Grid - Full Width */}
              <div className="w-full">
                <MatrixGrid 
                  data={data.matrix} 
                  onCellClick={(c, v, cell) => setSelectedCell({category: c, velocity: v, cell})} 
                />
              </div>

              {/* Problems Section - Full Width */}
              <div className="w-full">
                  <ProblemSection data={data} />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {!hasData && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl" data-testid="empty-state">
             {mode === 'live' ? (
               <>
                 <Upload className="h-12 w-12 mb-4 opacity-50" />
                 <p>Upload raw procurement data to begin analysis</p>
                 <Button variant="link" onClick={() => setShowUpload(true)} className="text-primary mt-2" data-testid="link-upload">
                   Click to Upload
                 </Button>
               </>
             ) : (
               <>
                 <Database className="h-12 w-12 mb-4 opacity-50" />
                 <p>Prototype Mode Active</p>
                 <Button variant="link" onClick={handleStartAnalysis} className="text-primary mt-2" data-testid="link-start-simulation">
                   Start Simulation
                 </Button>
               </>
             )}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <FileUpload 
            onFileUpload={handleFileUpload} 
            onCancel={() => setShowUpload(false)} 
            isProcessing={isAnalyzing}
          />
        )}
      </AnimatePresence>

      {/* Details Drawer */}
      <Sheet open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <SheetContent className="bg-[#0f0f23] border-l border-white/10 text-white w-[400px] sm:w-[540px]">
          {selectedCell && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-display text-primary">
                  {selectedCell.category}
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  Velocity: <span className="text-white font-mono uppercase">{selectedCell.velocity}</span>
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      selectedCell.cell.efficiency < 80 ? "text-orange-400" : "text-green-400"
                    )}>
                      {selectedCell.cell.efficiency}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                     <div className="text-xs text-muted-foreground mb-1">Status</div>
                     <div className="text-lg font-medium capitalize text-white">
                       {selectedCell.cell.status}
                     </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Top Products Impacted</h3>
                  <div className="space-y-3">
                    {selectedCell.cell.products.map((prod, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
                        <div>
                          <div className="text-sm font-medium text-white">{prod.name}</div>
                          <div className="text-xs text-gray-500">Cycle: {prod.purchaseCycle}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-mono text-primary">Qty: {prod.quantity}</div>
                           <div className="text-xs text-red-400">Waste: {prod.wastage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                   <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                     <Activity className="h-4 w-4" /> Recommended Action
                   </h4>
                   <p className="text-xs text-blue-200/80 leading-relaxed">
                     High wastage detected in this category. Consider implementing 
                     <strong> GRN Automation</strong> to verify quality at entry and 
                     <strong> 3-Way Matching</strong> to ensure invoice accuracy.
                   </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Icons
function AlertTriangleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
}
function CheckCircleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
