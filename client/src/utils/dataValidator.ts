// Data validation utilities for procurement analysis

export interface ValidationIssue {
  type: string;
  description: string;
  affectedRows: number[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  column?: string;
}

export interface ValidationResult {
  qualityScore: number;
  issues: ValidationIssue[];
  recommendations: {
    action: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
}

/**
 * Validates data quality for procurement analysis
 */
export function validateDataQuality(data: Record<string, any>[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const recommendations: ValidationResult['recommendations'] = [];
  
  if (!data || data.length === 0) {
    return {
      qualityScore: 0,
      issues: [{
        type: 'No Data',
        description: 'No data found in the uploaded file',
        affectedRows: [],
        severity: 'Critical'
      }],
      recommendations: [{
        action: 'Upload valid file',
        description: 'Please upload a file with data rows',
        priority: 'Critical'
      }]
    };
  }

  const totalRows = data.length;
  const columns = Object.keys(data[0] || {});
  
  // Check for missing values
  const missingValueIssues = checkMissingValues(data, columns);
  issues.push(...missingValueIssues);
  
  // Check for duplicates
  const duplicateIssues = checkDuplicates(data);
  issues.push(...duplicateIssues);
  
  // Check data types and formats
  const formatIssues = checkDataFormats(data, columns);
  issues.push(...formatIssues);
  
  // Check for outliers in numeric fields
  const outlierIssues = checkOutliers(data, columns);
  issues.push(...outlierIssues);
  
  // Check for inconsistent data
  const consistencyIssues = checkDataConsistency(data, columns);
  issues.push(...consistencyIssues);
  
  // Generate recommendations based on issues
  recommendations.push(...generateRecommendations(issues));
  
  // Calculate quality score
  const qualityScore = calculateQualityScore(issues, totalRows);
  
  return {
    qualityScore,
    issues,
    recommendations
  };
}

function checkMissingValues(data: Record<string, any>[], columns: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  columns.forEach(column => {
    const missingRows: number[] = [];
    
    data.forEach((row, index) => {
      const value = row[column];
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        missingRows.push(index + 1);
      }
    });
    
    if (missingRows.length > 0) {
      const missingPercentage = (missingRows.length / data.length) * 100;
      let severity: 'Critical' | 'High' | 'Medium' | 'Low';
      
      if (missingPercentage > 50) severity = 'Critical';
      else if (missingPercentage > 25) severity = 'High';
      else if (missingPercentage > 10) severity = 'Medium';
      else severity = 'Low';
      
      issues.push({
        type: 'Missing Values',
        description: `Column "${column}" has ${missingRows.length} missing values (${missingPercentage.toFixed(1)}%)`,
        affectedRows: missingRows.slice(0, 50), // Limit to first 50 for performance
        severity,
        column
      });
    }
  });
  
  return issues;
}

function checkDuplicates(data: Record<string, any>[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number[]>();
  
  data.forEach((row, index) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      seen.get(key)!.push(index + 1);
    } else {
      seen.set(key, [index + 1]);
    }
  });
  
  const duplicates = Array.from(seen.entries()).filter(([_, indices]) => indices.length > 1);
  
  if (duplicates.length > 0) {
    const totalDuplicateRows = duplicates.reduce((sum, [_, indices]) => sum + indices.length - 1, 0);
    const duplicatePercentage = (totalDuplicateRows / data.length) * 100;
    
    let severity: 'Critical' | 'High' | 'Medium' | 'Low';
    if (duplicatePercentage > 20) severity = 'Critical';
    else if (duplicatePercentage > 10) severity = 'High';
    else if (duplicatePercentage > 5) severity = 'Medium';
    else severity = 'Low';
    
    const allDuplicateRows = duplicates.flatMap(([_, indices]) => indices.slice(1));
    
    issues.push({
      type: 'Duplicate Rows',
      description: `Found ${duplicates.length} sets of duplicate rows affecting ${totalDuplicateRows} rows (${duplicatePercentage.toFixed(1)}%)`,
      affectedRows: allDuplicateRows.slice(0, 50),
      severity
    });
  }
  
  return issues;
}

function checkDataFormats(data: Record<string, any>[], columns: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
    
    if (values.length === 0) return;
    
    // Check if column should be numeric based on name patterns
    const numericPatterns = /price|cost|amount|total|quantity|qty|rate|value/i;
    const datePatterns = /date|time|created|updated|delivery|due/i;
    
    if (numericPatterns.test(column)) {
      const invalidNumeric: number[] = [];
      
      values.forEach((value, index) => {
        const numValue = Number(value);
        if (isNaN(numValue) && typeof value !== 'number') {
          invalidNumeric.push(index + 1);
        }
      });
      
      if (invalidNumeric.length > 0) {
        const invalidPercentage = (invalidNumeric.length / values.length) * 100;
        
        issues.push({
          type: 'Invalid Numeric Format',
          description: `Column "${column}" appears to be numeric but has ${invalidNumeric.length} non-numeric values (${invalidPercentage.toFixed(1)}%)`,
          affectedRows: invalidNumeric.slice(0, 50),
          severity: invalidPercentage > 25 ? 'High' : invalidPercentage > 10 ? 'Medium' : 'Low',
          column
        });
      }
    }
    
    if (datePatterns.test(column)) {
      const invalidDates: number[] = [];
      
      values.forEach((value, index) => {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          invalidDates.push(index + 1);
        }
      });
      
      if (invalidDates.length > 0) {
        const invalidPercentage = (invalidDates.length / values.length) * 100;
        
        issues.push({
          type: 'Invalid Date Format',
          description: `Column "${column}" appears to be a date but has ${invalidDates.length} invalid date values (${invalidPercentage.toFixed(1)}%)`,
          affectedRows: invalidDates.slice(0, 50),
          severity: invalidPercentage > 25 ? 'High' : invalidPercentage > 10 ? 'Medium' : 'Low',
          column
        });
      }
    }
  });
  
  return issues;
}

function checkOutliers(data: Record<string, any>[], columns: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  columns.forEach(column => {
    const numericValues = data
      .map((row, index) => ({ value: Number(row[column]), index: index + 1 }))
      .filter(item => !isNaN(item.value));
    
    if (numericValues.length < 10) return; // Need sufficient data for outlier detection
    
    const values = numericValues.map(item => item.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    const outliers = numericValues.filter(item => Math.abs(item.value - mean) > 3 * stdDev);
    
    if (outliers.length > 0) {
      const outlierPercentage = (outliers.length / numericValues.length) * 100;
      
      if (outlierPercentage > 1) { // Only report if more than 1% are outliers
        issues.push({
          type: 'Statistical Outliers',
          description: `Column "${column}" has ${outliers.length} statistical outliers (${outlierPercentage.toFixed(1)}% of numeric values)`,
          affectedRows: outliers.slice(0, 50).map(item => item.index),
          severity: outlierPercentage > 10 ? 'Medium' : 'Low',
          column
        });
      }
    }
  });
  
  return issues;
}

function checkDataConsistency(data: Record<string, any>[], columns: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for inconsistent text casing in categorical columns
  columns.forEach(column => {
    const textValues = data
      .map((row, index) => ({ value: String(row[column] || '').trim(), index: index + 1 }))
      .filter(item => item.value.length > 0);
    
    if (textValues.length < 5) return;
    
    const valueCounts = new Map<string, number>();
    const caseVariations = new Map<string, Set<string>>();
    
    textValues.forEach(item => {
      const lowerValue = item.value.toLowerCase();
      valueCounts.set(lowerValue, (valueCounts.get(lowerValue) || 0) + 1);
      
      if (!caseVariations.has(lowerValue)) {
        caseVariations.set(lowerValue, new Set());
      }
      caseVariations.get(lowerValue)!.add(item.value);
    });
    
    const inconsistentCasing = Array.from(caseVariations.entries())
      .filter(([_, variations]) => variations.size > 1)
      .filter(([lowerValue, _]) => valueCounts.get(lowerValue)! > 1);
    
    if (inconsistentCasing.length > 0) {
      issues.push({
        type: 'Inconsistent Text Casing',
        description: `Column "${column}" has inconsistent text casing for ${inconsistentCasing.length} values`,
        affectedRows: [],
        severity: 'Low',
        column
      });
    }
  });
  
  return issues;
}

function generateRecommendations(issues: ValidationIssue[]): ValidationResult['recommendations'] {
  const recommendations: ValidationResult['recommendations'] = [];
  
  const criticalIssues = issues.filter(i => i.severity === 'Critical');
  const highIssues = issues.filter(i => i.severity === 'High');
  const missingValueIssues = issues.filter(i => i.type === 'Missing Values');
  const duplicateIssues = issues.filter(i => i.type === 'Duplicate Rows');
  const formatIssues = issues.filter(i => i.type.includes('Format'));
  
  if (criticalIssues.length > 0) {
    recommendations.push({
      action: 'Address Critical Issues',
      description: `Fix ${criticalIssues.length} critical data quality issues before proceeding`,
      priority: 'Critical'
    });
  }
  
  if (missingValueIssues.length > 0) {
    recommendations.push({
      action: 'Handle Missing Values',
      description: 'Fill in missing values or remove incomplete rows',
      priority: highIssues.some(i => i.type === 'Missing Values') ? 'High' : 'Medium'
    });
  }
  
  if (duplicateIssues.length > 0) {
    recommendations.push({
      action: 'Remove Duplicates',
      description: 'Remove or consolidate duplicate rows to improve data accuracy',
      priority: 'Medium'
    });
  }
  
  if (formatIssues.length > 0) {
    recommendations.push({
      action: 'Fix Data Formats',
      description: 'Correct data format issues for numeric and date columns',
      priority: 'Medium'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      action: 'Data Quality Good',
      description: 'Your data quality looks good! You can proceed with analysis',
      priority: 'Low'
    });
  }
  
  return recommendations;
}

function calculateQualityScore(issues: ValidationIssue[], totalRows: number): number {
  let score = 100;
  
  issues.forEach(issue => {
    let penalty = 0;
    
    switch (issue.severity) {
      case 'Critical':
        penalty = 25;
        break;
      case 'High':
        penalty = 15;
        break;
      case 'Medium':
        penalty = 8;
        break;
      case 'Low':
        penalty = 3;
        break;
    }
    
    // Scale penalty based on affected rows percentage
    if (issue.affectedRows.length > 0) {
      const affectedPercentage = issue.affectedRows.length / totalRows;
      penalty *= Math.min(affectedPercentage * 2, 1); // Cap at full penalty
    }
    
    score -= penalty;
  });
  
  return Math.max(0, Math.round(score));
}
