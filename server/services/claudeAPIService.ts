import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ClaudeAnalysisRequest {
  fileName: string;
  fileContent: string;
  fileType: string;
}

export interface ClaudeAnalysisResponse {
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

// Standard procurement fields mapping
const STANDARD_PROCUREMENT_FIELDS = {
  'PO_Number': ['PO_Number', 'po number', 'purchase order', 'po#', 'order number', 'po id', 'po_number', 'ponumber'],
  'Vendor_Name': ['Vendor_Name', 'vendor', 'supplier', 'vendor name', 'supplier name', 'company', 'vendor_name', 'vendorname'],
  'Item_Description': ['Item_Description', 'item', 'description', 'product', 'item description', 'product description', 'item_description', 'itemdescription'],
  'Quantity': ['Quantity', 'qty', 'quantity', 'amount', 'units', 'count'],
  'Unit_Price': ['Unit_Price', 'unit price', 'price', 'cost', 'unit cost', 'rate', 'unit_price', 'unitprice'],
  'Total_Amount': ['Total_Amount', 'total', 'total amount', 'total cost', 'amount', 'value', 'total_amount', 'totalamount'],
  'Order_Date': ['Order_Date', 'order date', 'date', 'purchase date', 'po date', 'created date', 'order_date', 'orderdate'],
  'Delivery_Date': ['delivery date', 'due date', 'expected date', 'ship date', 'delivery', 'delivery_date', 'deliverydate'],
  'Status': ['status', 'state', 'condition', 'order status'],
  'Category': ['category', 'type', 'classification', 'group', 'department'],
};

function parseFileContent(content: string, fileName: string): { sheetName: string; data: any[] }[] {
  try {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      return [{ sheetName: 'Sheet1', data: parsed.data }];
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const workbook = XLSX.read(content, { type: 'string' });
      const sheets: { sheetName: string; data: any[] }[] = [];
      
      // Parse all sheets
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Only include sheets with data
        if (data.length > 0) {
          sheets.push({ sheetName, data });
        }
      });
      
      return sheets;
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing file content:', error);
    return [];
  }
}

function createAnalysisPrompt(data: any[], fileName: string, sheetInfo?: string): string {
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const sampleRows = data.slice(0, 10); // First 10 rows for analysis
  
  return `You are a procurement data analyst. Analyze the uploaded file "${fileName}" and provide a comprehensive analysis.

**IMPORTANT**: Only mark columns as missing if they are truly not present in the data. Be very careful with column mapping.

**File Data:**
${sheetInfo ? `${sheetInfo}` : ''}
Headers Found: ${headers.join(', ')}
Total Rows: ${data.length}
Sample Data (first 10 rows):
${JSON.stringify(sampleRows, null, 2)}

**Standard Procurement Fields Expected:**
${Object.entries(STANDARD_PROCUREMENT_FIELDS).map(([field, variations]) => 
  `- ${field}: ${variations.join(', ')}`
).join('\n')}

**CRITICAL Column Mapping Instructions:**
- FIRST check for EXACT matches (case-insensitive) between data headers and standard field variations
- If you find "PO_Number" in headers, it maps to PO_Number standard field - DO NOT mark as missing
- If you find "Vendor_Name" in headers, it maps to Vendor_Name standard field - DO NOT mark as missing  
- If you find "Total_Amount" in headers, it maps to Total_Amount standard field - DO NOT mark as missing
- Only mark a column as missing if NO variation of it exists in the actual data headers
- Be extremely careful - false positives for missing columns are unacceptable

**Analysis Requirements:**
1. **Data Sufficiency**: Determine if the data contains all critical columns needed for procurement analysis
2. **Column Mapping**: Map existing columns to standard procurement fields with high accuracy
3. **Data Quality**: Identify missing values, duplicates, format issues, invalid ranges
4. **UI Decision**: Decide whether to use standard UI or custom UI based on data structure
5. **Data Preview**: Format first 10 rows for display

**Response Format (JSON only):**
{
  "dataSufficiency": "COMPLETE|PARTIAL|INSUFFICIENT",
  "qualityScore": 0-100,
  "uiRenderingDecision": "USE_STANDARD_UI|USE_CUSTOM_UI",
  "missingColumns": [
    {
      "column": "string",
      "importance": "Critical|High|Medium|Low",
      "description": "string"
    }
  ],
  "columnMappings": [
    {
      "originalName": "string",
      "standardName": "string",
      "dataType": "string",
      "completenessPercentage": 0-100
    }
  ],
  "dataQualityIssues": [
    {
      "type": "string",
      "description": "string",
      "affectedRows": [1, 2, 3],
      "severity": "Critical|High|Medium|Low"
    }
  ],
  "dataPreview": [
    // First 10 rows formatted for display
  ],
  "recommendations": [
    {
      "action": "string",
      "description": "string",
      "priority": "Critical|High|Medium|Low"
    }
  ]
}

Provide only the JSON response, no additional text.`;
}

export async function analyzeFileWithClaude(request: ClaudeAnalysisRequest): Promise<ClaudeAnalysisResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  try {
    // Parse file content (may contain multiple sheets)
    const sheets = parseFileContent(request.fileContent, request.fileName);
    
    if (sheets.length === 0) {
      throw new Error('No data found in file or unable to parse file content');
    }

    // For multiple sheets, analyze the first non-empty sheet or combine data
    let dataToAnalyze = sheets[0].data;
    let sheetInfo = `Sheet: ${sheets[0].sheetName}`;
    
    if (sheets.length > 1) {
      // If multiple sheets, provide info about all sheets but analyze the largest one
      const largestSheet = sheets.reduce((prev, current) => 
        current.data.length > prev.data.length ? current : prev
      );
      dataToAnalyze = largestSheet.data;
      sheetInfo = `Multiple sheets found (${sheets.map(s => `${s.sheetName}: ${s.data.length} rows`).join(', ')}). Analyzing: ${largestSheet.sheetName}`;
    }

    // Create analysis prompt
    const prompt = createAnalysisPrompt(dataToAnalyze, request.fileName, sheetInfo);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract response content
    const responseContent = response.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    // Parse Claude's JSON response
    let analysisResult: ClaudeAnalysisResponse;
    try {
      analysisResult = JSON.parse(responseContent.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseContent.text);
      throw new Error('Invalid JSON response from Claude API');
    }

    // Validate and sanitize the response
    const validatedResponse = validateAndSanitizeResponse(analysisResult, dataToAnalyze);
    
    // Double-check critical column detection with local logic
    const headers = dataToAnalyze.length > 0 ? Object.keys(dataToAnalyze[0]) : [];
    const criticalFields = ['PO_Number', 'Vendor_Name', 'Total_Amount'];
    
    // Check if Claude incorrectly marked existing columns as missing
    const correctedMissingColumns = validatedResponse.missingColumns.filter(missing => {
      const fieldVariations = STANDARD_PROCUREMENT_FIELDS[missing.column as keyof typeof STANDARD_PROCUREMENT_FIELDS] || [];
      const isActuallyMissing = !headers.some(header => 
        fieldVariations.some(variation => header.toLowerCase() === variation.toLowerCase())
      );
      return isActuallyMissing;
    });
    
    // Update column mappings to include correctly mapped columns
    const correctedMappings = [...validatedResponse.columnMappings];
    headers.forEach(header => {
      const existingMapping = correctedMappings.find(m => m.originalName === header);
      if (!existingMapping || existingMapping.standardName === 'Unknown') {
        for (const [standard, variations] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
          if (variations.some(variation => header.toLowerCase() === variation.toLowerCase())) {
            if (existingMapping) {
              existingMapping.standardName = standard;
            } else {
              correctedMappings.push({
                originalName: header,
                standardName: standard,
                dataType: 'string',
                completenessPercentage: 100
              });
            }
            break;
          }
        }
      }
    });
    
    return {
      ...validatedResponse,
      missingColumns: correctedMissingColumns,
      columnMappings: correctedMappings
    };

  } catch (error) {
    console.error('Claude API analysis error:', error);
    
    // Provide fallback analysis if Claude API fails
    return createFallbackAnalysis(request);
  }
}

function validateAndSanitizeResponse(response: any, originalData: any[]): ClaudeAnalysisResponse {
  // Ensure all required fields are present with defaults
  return {
    dataSufficiency: response.dataSufficiency || 'PARTIAL',
    qualityScore: Math.min(100, Math.max(0, response.qualityScore || 50)),
    uiRenderingDecision: response.uiRenderingDecision || 'USE_CUSTOM_UI',
    missingColumns: Array.isArray(response.missingColumns) ? response.missingColumns : [],
    columnMappings: Array.isArray(response.columnMappings) ? response.columnMappings : [],
    dataQualityIssues: Array.isArray(response.dataQualityIssues) ? response.dataQualityIssues : [],
    dataPreview: Array.isArray(response.dataPreview) ? response.dataPreview.slice(0, 10) : originalData.slice(0, 10),
    recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
  };
}

export interface CombinedAnalysisRequest {
  fileContents: Array<{ fileName: string; content: string; fileType: string }>;
}

export async function analyzeMultipleFilesWithClaude(request: CombinedAnalysisRequest): Promise<ClaudeAnalysisResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  try {
    // Parse all files and combine their data
    const allSheets: Array<{ fileName: string; sheetName: string; data: any[] }> = [];
    
    request.fileContents.forEach(file => {
      const sheets = parseFileContent(file.content, file.fileName);
      sheets.forEach(sheet => {
        allSheets.push({
          fileName: file.fileName,
          sheetName: sheet.sheetName,
          data: sheet.data
        });
      });
    });

    if (allSheets.length === 0) {
      throw new Error('No data found in any of the uploaded files');
    }

    // Combine all data from all sheets
    const combinedData: any[] = [];
    const fileInfo: string[] = [];
    
    allSheets.forEach(sheet => {
      fileInfo.push(`${sheet.fileName} (${sheet.sheetName}): ${sheet.data.length} rows`);
      combinedData.push(...sheet.data);
    });

    // Create analysis prompt for combined data
    const prompt = createCombinedAnalysisPrompt(combinedData, fileInfo);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract response content
    const responseContent = response.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    // Parse Claude's JSON response
    let analysisResult: ClaudeAnalysisResponse;
    try {
      analysisResult = JSON.parse(responseContent.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseContent.text);
      throw new Error('Invalid JSON response from Claude API');
    }

    // Validate and sanitize the response
    const validatedResponse = validateAndSanitizeResponse(analysisResult, combinedData);
    
    // Double-check critical column detection with local logic
    const headers = combinedData.length > 0 ? Object.keys(combinedData[0]) : [];
    
    // Check if Claude incorrectly marked existing columns as missing
    const correctedMissingColumns = validatedResponse.missingColumns.filter(missing => {
      const fieldVariations = STANDARD_PROCUREMENT_FIELDS[missing.column as keyof typeof STANDARD_PROCUREMENT_FIELDS] || [];
      const isActuallyMissing = !headers.some(header => 
        fieldVariations.some(variation => header.toLowerCase() === variation.toLowerCase())
      );
      return isActuallyMissing;
    });
    
    // Update column mappings to include correctly mapped columns
    const correctedMappings = [...validatedResponse.columnMappings];
    headers.forEach(header => {
      const existingMapping = correctedMappings.find(m => m.originalName === header);
      if (!existingMapping || existingMapping.standardName === 'Unknown') {
        for (const [standard, variations] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
          if (variations.some(variation => header.toLowerCase() === variation.toLowerCase())) {
            if (existingMapping) {
              existingMapping.standardName = standard;
            } else {
              correctedMappings.push({
                originalName: header,
                standardName: standard,
                dataType: 'string',
                completenessPercentage: 100
              });
            }
            break;
          }
        }
      }
    });
    
    return {
      ...validatedResponse,
      missingColumns: correctedMissingColumns,
      columnMappings: correctedMappings
    };

  } catch (error) {
    console.error('Claude API combined analysis error:', error);
    
    // Provide fallback analysis if Claude API fails
    return createFallbackCombinedAnalysis(request);
  }
}

function createCombinedAnalysisPrompt(combinedData: any[], fileInfo: string[]): string {
  const headers = combinedData.length > 0 ? Object.keys(combinedData[0]) : [];
  const sampleRows = combinedData.slice(0, 10);
  
  return `You are a procurement data analyst. Analyze the combined data from multiple uploaded files and provide a comprehensive analysis for identifying procurement bottlenecks.

**IMPORTANT**: Only mark columns as missing if they are truly not present in the combined data. Be very careful with column mapping.

**Combined File Data:**
Files analyzed: ${fileInfo.join('; ')}
Total combined rows: ${combinedData.length}
Headers Found: ${headers.join(', ')}
Sample Data (first 10 rows):
${JSON.stringify(sampleRows, null, 2)}

**Standard Procurement Fields Expected:**
${Object.entries(STANDARD_PROCUREMENT_FIELDS).map(([field, variations]) => 
  `- ${field}: ${variations.join(', ')}`
).join('\n')}

**CRITICAL Column Mapping Instructions:**
- FIRST check for EXACT matches (case-insensitive) between data headers and standard field variations
- If you find "PO_Number" in headers, it maps to PO_Number standard field - DO NOT mark as missing
- If you find "Vendor_Name" in headers, it maps to Vendor_Name standard field - DO NOT mark as missing
- If you find "Total_Amount" in headers, it maps to Total_Amount standard field - DO NOT mark as missing
- Only mark a column as missing if NO variation of it exists in the actual data headers
- Be extremely careful - false positives for missing columns are unacceptable

**Analysis Requirements:**
1. **Data Sufficiency**: Determine if the combined data contains all critical columns needed for procurement analysis
2. **Column Mapping**: Map existing columns to standard procurement fields with high accuracy
3. **Data Quality**: Identify missing values, duplicates, format issues, invalid ranges across all files
4. **Bottleneck Identification**: Analyze the combined data to identify procurement bottlenecks such as:
   - Manual processes vs automated processes
   - Invoice receipt delays
   - GRN creation delays
   - 3-way matching issues
   - Payment authorization delays
   - Exception handling issues
5. **UI Decision**: Decide whether to use standard UI or custom UI based on data structure
6. **Data Preview**: Format first 10 rows for display

**Response Format (JSON only):**
{
  "dataSufficiency": "COMPLETE|PARTIAL|INSUFFICIENT",
  "qualityScore": 0-100,
  "uiRenderingDecision": "USE_STANDARD_UI|USE_CUSTOM_UI",
  "missingColumns": [
    {
      "column": "string",
      "importance": "Critical|High|Medium|Low",
      "description": "string"
    }
  ],
  "columnMappings": [
    {
      "originalName": "string",
      "standardName": "string",
      "dataType": "string",
      "completenessPercentage": 0-100
    }
  ],
  "dataQualityIssues": [
    {
      "type": "string",
      "description": "string",
      "affectedRows": [1, 2, 3],
      "severity": "Critical|High|Medium|Low"
    }
  ],
  "dataPreview": [
    // First 10 rows formatted for display
  ],
  "recommendations": [
    {
      "action": "string",
      "description": "string",
      "priority": "Critical|High|Medium|Low"
    }
  ]
}

Provide only the JSON response, no additional text.`;
}

function createFallbackCombinedAnalysis(request: CombinedAnalysisRequest): ClaudeAnalysisResponse {
  // Parse all files and combine their data
  const allSheets: Array<{ fileName: string; sheetName: string; data: any[] }> = [];
  
  request.fileContents.forEach(file => {
    const sheets = parseFileContent(file.content, file.fileName);
    sheets.forEach(sheet => {
      allSheets.push({
        fileName: file.fileName,
        sheetName: sheet.sheetName,
        data: sheet.data
      });
    });
  });

  const combinedData: any[] = [];
  allSheets.forEach(sheet => {
    combinedData.push(...sheet.data);
  });

  const headers = combinedData.length > 0 ? Object.keys(combinedData[0]) : [];
  
  // Improved column matching with exact matching first
  const columnMappings = headers.map(header => {
    let standardName = 'Unknown';
    let bestMatch = 0;
    
    for (const [standard, variations] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
      for (const variation of variations) {
        // Check for exact match first (case-insensitive)
        if (header.toLowerCase() === variation.toLowerCase()) {
          standardName = standard;
          bestMatch = 100;
          break;
        }
        // Check for partial match
        else if (header.toLowerCase().includes(variation.toLowerCase()) && bestMatch < 80) {
          standardName = standard;
          bestMatch = 80;
        }
      }
      if (bestMatch === 100) break;
    }
    
    return {
      originalName: header,
      standardName,
      dataType: 'string',
      completenessPercentage: 100,
    };
  });

  const criticalFields = ['PO_Number', 'Vendor_Name', 'Total_Amount'];
  const foundCriticalFields = columnMappings.filter(cm => criticalFields.includes(cm.standardName));
  
  console.log('Fallback Combined Analysis Debug:');
  console.log('Headers found:', headers);
  console.log('Column mappings:', columnMappings);
  console.log('Found critical fields:', foundCriticalFields);
  console.log('Total combined rows:', combinedData.length);
  
  const dataSufficiency = foundCriticalFields.length >= 3 ? 'COMPLETE' : 
                         foundCriticalFields.length >= 2 ? 'PARTIAL' : 'INSUFFICIENT';
  
  return {
    dataSufficiency,
    qualityScore: Math.max(70, Math.round((foundCriticalFields.length / criticalFields.length) * 100)),
    uiRenderingDecision: foundCriticalFields.length >= 2 ? 'USE_STANDARD_UI' : 'USE_CUSTOM_UI',
    missingColumns: criticalFields
      .filter(field => !foundCriticalFields.some(f => f.standardName === field))
      .map(field => ({
        column: field,
        importance: 'Critical' as const,
        description: `${field} is required for procurement analysis`,
      })),
    columnMappings,
    dataQualityIssues: [],
    dataPreview: combinedData.slice(0, 10),
    recommendations: [
      {
        action: 'Review column mappings',
        description: 'Verify that columns are correctly mapped to standard procurement fields',
        priority: 'High' as const,
      },
    ],
  };
}

function createFallbackAnalysis(request: ClaudeAnalysisRequest): ClaudeAnalysisResponse {
  // Basic fallback analysis when Claude API is unavailable
  const sheets = parseFileContent(request.fileContent, request.fileName);
  const data = sheets.length > 0 ? sheets[0].data : [];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  
  // Improved column matching with exact matching first
  const columnMappings = headers.map(header => {
    let standardName = 'Unknown';
    let bestMatch = 0;
    
    for (const [standard, variations] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
      for (const variation of variations) {
        // Check for exact match first (case-insensitive)
        if (header.toLowerCase() === variation.toLowerCase()) {
          standardName = standard;
          bestMatch = 100;
          break;
        }
        // Check for partial match
        else if (header.toLowerCase().includes(variation.toLowerCase()) && bestMatch < 80) {
          standardName = standard;
          bestMatch = 80;
        }
      }
      if (bestMatch === 100) break;
    }
    
    return {
      originalName: header,
      standardName,
      dataType: 'string',
      completenessPercentage: 100, // Simplified
    };
  });

  const criticalFields = ['PO_Number', 'Vendor_Name', 'Total_Amount'];
  const foundCriticalFields = columnMappings.filter(cm => criticalFields.includes(cm.standardName));
  
  // Debug logging
  console.log('Fallback Analysis Debug:');
  console.log('Headers found:', headers);
  console.log('Column mappings:', columnMappings);
  console.log('Found critical fields:', foundCriticalFields);
  
  // More lenient data sufficiency calculation
  const dataSufficiency = foundCriticalFields.length >= 3 ? 'COMPLETE' : 
                         foundCriticalFields.length >= 2 ? 'PARTIAL' : 'INSUFFICIENT';
  
  return {
    dataSufficiency,
    qualityScore: Math.max(70, Math.round((foundCriticalFields.length / criticalFields.length) * 100)),
    uiRenderingDecision: foundCriticalFields.length >= 2 ? 'USE_STANDARD_UI' : 'USE_CUSTOM_UI',
    missingColumns: criticalFields
      .filter(field => !foundCriticalFields.some(f => f.standardName === field))
      .map(field => ({
        column: field,
        importance: 'Critical' as const,
        description: `${field} is required for procurement analysis`,
      })),
    columnMappings,
    dataQualityIssues: [],
    dataPreview: data.slice(0, 10),
    recommendations: [
      {
        action: 'Review column mappings',
        description: 'Verify that columns are correctly mapped to standard procurement fields',
        priority: 'High' as const,
      },
    ],
  };
}
