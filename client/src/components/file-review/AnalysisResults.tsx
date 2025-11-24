import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Lightbulb,
  Database
} from "lucide-react";
import { ClaudeAnalysisResult } from "./FileReviewContainer";

interface AnalysisResultsProps {
  analysisResult: ClaudeAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AnalysisResults({ analysisResult, isExpanded, onToggle }: AnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <XCircle className="h-4 w-4" />;
      case 'High': return <AlertTriangle className="h-4 w-4" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4" />;
      case 'Low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis Results
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Data Sufficiency Status */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Sufficiency Check
            </h4>
            <Alert>
              <div className="flex items-center gap-2">
                {analysisResult.dataSufficiency === 'COMPLETE' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : analysisResult.dataSufficiency === 'PARTIAL' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  <strong>Status: {analysisResult.dataSufficiency}</strong>
                  <br />
                  {analysisResult.dataSufficiency === 'COMPLETE' && 
                    "All required columns are present for procurement analysis."}
                  {analysisResult.dataSufficiency === 'PARTIAL' && 
                    "Some required columns are missing, but analysis can proceed with limitations."}
                  {analysisResult.dataSufficiency === 'INSUFFICIENT' && 
                    "Critical columns are missing. Upload a different file or use our template."}
                </AlertDescription>
              </div>
            </Alert>
          </div>

          {/* Missing Columns */}
          {analysisResult.missingColumns && analysisResult.missingColumns.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Missing Columns</h4>
              <div className="space-y-2">
                {analysisResult.missingColumns.map((missing, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getSeverityIcon(missing.importance)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{missing.column}</span>
                        <Badge className={getSeverityColor(missing.importance)}>
                          {missing.importance}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {missing.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column Mappings */}
          <div className="space-y-3">
            <h4 className="font-semibold">Column Mappings</h4>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {analysisResult.columnMappings.map((mapping, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{mapping.originalName}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{mapping.standardName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {mapping.dataType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {mapping.completenessPercentage}% complete
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Issues */}
          {analysisResult.dataQualityIssues && analysisResult.dataQualityIssues.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Data Quality Issues</h4>
              <div className="space-y-2">
                {analysisResult.dataQualityIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{issue.type}</span>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {issue.description}
                      </p>
                      {issue.affectedRows.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Affected rows: {issue.affectedRows.slice(0, 10).join(', ')}
                          {issue.affectedRows.length > 10 && ` and ${issue.affectedRows.length - 10} more`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rec.action}</span>
                        <Badge className={getSeverityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UI Rendering Decision */}
          <div className="space-y-3">
            <h4 className="font-semibold">UI Rendering Decision</h4>
            <Alert>
              <AlertDescription>
                <strong>
                  {analysisResult.uiRenderingDecision === 'USE_STANDARD_UI' 
                    ? 'Standard UI Recommended' 
                    : 'Custom UI Required'
                  }
                </strong>
                <br />
                {analysisResult.uiRenderingDecision === 'USE_STANDARD_UI' 
                  ? 'Your data structure is compatible with our standard procurement analysis interface.'
                  : 'Your data structure requires a custom interface for optimal display and analysis.'
                }
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
