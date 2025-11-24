import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { FileReviewContainer, ClaudeAnalysisResult } from "@/components/file-review/FileReviewContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FileReviewPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/file-review/:sessionId");
  const [sessionId, setSessionId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (params?.sessionId) {
      setSessionId(params.sessionId);
    } else {
      // Generate new session if none provided
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      setLocation(`/file-review/${newSessionId}`);
    }
  }, [params, setLocation]);

  const handleProceedWithData = (analysisResult: ClaudeAnalysisResult) => {
    // Store analysis result in sessionStorage for the dashboard to use
    sessionStorage.setItem('claudeAnalysisResult', JSON.stringify(analysisResult));
    sessionStorage.setItem('proceedWithAnalysis', 'true');
    
    // Navigate back to dashboard with the session ID
    setLocation(`/?session=${sessionId}&mode=live`);
    
    toast({
      title: "Analysis Complete",
      description: "Proceeding with your data analysis",
    });
  };

  const handleUploadDifferentFile = () => {
    // Stay on the same page to allow new file upload
    toast({
      title: "Upload New File",
      description: "You can upload a different file for analysis",
    });
  };

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const templateData = [
      ['PO_Number', 'Vendor_Name', 'Item_Description', 'Quantity', 'Unit_Price', 'Total_Amount', 'Order_Date', 'Delivery_Date', 'Status', 'Category'],
      ['PO-001', 'ABC Supplies Inc', 'Office Chairs', '10', '150.00', '1500.00', '2024-01-15', '2024-01-25', 'Pending', 'Furniture'],
      ['PO-002', 'Tech Solutions LLC', 'Laptops', '5', '1200.00', '6000.00', '2024-01-16', '2024-01-30', 'Approved', 'Technology'],
      ['PO-003', 'Green Office Co', 'Recycled Paper', '100', '25.00', '2500.00', '2024-01-17', '2024-01-20', 'Delivered', 'Supplies']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procurement_data_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Use this template to format your procurement data",
    });
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your analysis session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold">
                PI
              </div>
              <h1 className="text-lg font-display font-bold text-white tracking-wide">
                File Review & Analysis
              </h1>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Intelligent File Analysis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your procurement data files and get instant AI-powered analysis with 
              data quality insights, column mapping, and recommendations.
            </p>
          </div>

          <FileReviewContainer
            sessionId={sessionId}
            onProceedWithData={handleProceedWithData}
            onUploadDifferentFile={handleUploadDifferentFile}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </div>
      </main>
    </div>
  );
}
