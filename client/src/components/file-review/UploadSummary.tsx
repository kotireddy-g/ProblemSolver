import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, FileText, Calendar, BarChart3 } from "lucide-react";
import { ClaudeAnalysisResult } from "./FileReviewContainer";

interface UploadSummaryProps {
  analysisResult: ClaudeAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}

export function UploadSummary({ analysisResult, isExpanded, onToggle }: UploadSummaryProps) {
  const getStatusColor = (dataSufficiency: string, qualityScore: number) => {
    if (dataSufficiency === 'COMPLETE' && qualityScore >= 80) {
      return "bg-green-500";
    } else if (dataSufficiency === 'PARTIAL' || qualityScore >= 60) {
      return "bg-yellow-500";
    } else {
      return "bg-red-500";
    }
  };

  const getStatusIcon = (dataSufficiency: string, qualityScore: number) => {
    if (dataSufficiency === 'COMPLETE' && qualityScore >= 80) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (dataSufficiency === 'PARTIAL' || qualityScore >= 60) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Summary
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(analysisResult.dataSufficiency, analysisResult.qualityScore)}`} />
            {getStatusIcon(analysisResult.dataSufficiency, analysisResult.qualityScore)}
            <div className="flex-1">
              <div className="font-medium">
                {getStatusText(analysisResult.dataSufficiency, analysisResult.qualityScore)}
              </div>
              <div className="text-sm text-muted-foreground">
                Data sufficiency: {analysisResult.dataSufficiency.toLowerCase()}
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Quality: {analysisResult.qualityScore}%
            </Badge>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">File ID</div>
                <div className="text-xs text-muted-foreground">{analysisResult.fileId}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Analyzed</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(analysisResult.analyzedAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">UI Decision</div>
                <div className="text-xs text-muted-foreground">
                  {analysisResult.uiRenderingDecision === 'USE_STANDARD_UI' ? 'Standard UI' : 'Custom UI'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-primary">{analysisResult.columnMappings.length}</div>
              <div className="text-xs text-muted-foreground">Columns Found</div>
            </div>
            
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">{analysisResult.missingColumns?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Missing Columns</div>
            </div>
            
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{analysisResult.dataQualityIssues?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Quality Issues</div>
            </div>
            
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{analysisResult.dataPreview.length}</div>
              <div className="text-xs text-muted-foreground">Preview Rows</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
