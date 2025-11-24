import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Table as TableIcon, AlertTriangle, CheckCircle } from "lucide-react";
import { ClaudeAnalysisResult } from "./FileReviewContainer";

interface DataPreviewTableProps {
  analysisResult: ClaudeAnalysisResult;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DataPreviewTable({ analysisResult, isExpanded, onToggle }: DataPreviewTableProps) {
  const getColumnStatus = (columnName: string) => {
    // Check if column has quality issues
    const hasIssues = analysisResult.dataQualityIssues?.some(issue => 
      issue.description.toLowerCase().includes(columnName.toLowerCase())
    );
    
    // Check column mapping completeness
    const mapping = analysisResult.columnMappings.find(m => 
      m.originalName.toLowerCase() === columnName.toLowerCase()
    );
    
    if (hasIssues) {
      return { status: 'error', icon: <AlertTriangle className="h-3 w-3 text-red-500" /> };
    } else if (mapping && mapping.completenessPercentage < 100) {
      return { status: 'warning', icon: <AlertTriangle className="h-3 w-3 text-yellow-500" /> };
    } else {
      return { status: 'success', icon: <CheckCircle className="h-3 w-3 text-green-500" /> };
    }
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">empty</span>;
    }
    
    if (typeof value === 'object') {
      return <span className="text-muted-foreground">[object]</span>;
    }
    
    const stringValue = String(value);
    if (stringValue.length > 50) {
      return (
        <span title={stringValue}>
          {stringValue.substring(0, 47)}...
        </span>
      );
    }
    
    return stringValue;
  };

  const previewData = analysisResult.dataPreview || [];
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Data Preview
            <Badge variant="outline" className="ml-2">
              {previewData.length} rows
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {previewData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TableIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No preview data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Column Status Summary */}
              <div className="flex flex-wrap gap-2">
                {columns.map((column) => {
                  const status = getColumnStatus(column);
                  return (
                    <Badge
                      key={column}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {status.icon}
                      {column}
                    </Badge>
                  );
                })}
              </div>

              {/* Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {columns.map((column) => {
                          const status = getColumnStatus(column);
                          const mapping = analysisResult.columnMappings.find(m => 
                            m.originalName.toLowerCase() === column.toLowerCase()
                          );
                          
                          return (
                            <TableHead key={column} className="min-w-32">
                              <div className="flex items-center gap-2">
                                {status.icon}
                                <div>
                                  <div className="font-medium">{column}</div>
                                  {mapping && (
                                    <div className="text-xs text-muted-foreground">
                                      → {mapping.standardName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          {columns.map((column) => (
                            <TableCell key={column} className="max-w-48">
                              {formatCellValue(row[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Data Quality Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {columns.filter(col => getColumnStatus(col).status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Clean Columns</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {columns.filter(col => getColumnStatus(col).status === 'warning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incomplete Columns</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {columns.filter(col => getColumnStatus(col).status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Problem Columns</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
