// Standard procurement fields mapping utility
export const STANDARD_PROCUREMENT_FIELDS = {
  'PO_Number': {
    variations: ['po number', 'purchase order', 'po#', 'order number', 'po id', 'purchase order number'],
    required: true,
    dataType: 'string',
    description: 'Unique purchase order identifier'
  },
  'Vendor_Name': {
    variations: ['vendor', 'supplier', 'vendor name', 'supplier name', 'company', 'vendor company'],
    required: true,
    dataType: 'string',
    description: 'Name of the vendor or supplier'
  },
  'Item_Description': {
    variations: ['item', 'description', 'product', 'item description', 'product description', 'goods'],
    required: true,
    dataType: 'string',
    description: 'Description of the purchased item or service'
  },
  'Quantity': {
    variations: ['qty', 'quantity', 'amount', 'units', 'count', 'number of items'],
    required: true,
    dataType: 'number',
    description: 'Quantity of items ordered'
  },
  'Unit_Price': {
    variations: ['unit price', 'price', 'cost', 'unit cost', 'rate', 'price per unit'],
    required: true,
    dataType: 'number',
    description: 'Price per unit of the item'
  },
  'Total_Amount': {
    variations: ['total', 'total amount', 'total cost', 'amount', 'value', 'total price'],
    required: true,
    dataType: 'number',
    description: 'Total cost for the line item'
  },
  'Order_Date': {
    variations: ['order date', 'date', 'purchase date', 'po date', 'created date', 'order created'],
    required: true,
    dataType: 'date',
    description: 'Date when the purchase order was created'
  },
  'Delivery_Date': {
    variations: ['delivery date', 'due date', 'expected date', 'ship date', 'delivery', 'expected delivery'],
    required: false,
    dataType: 'date',
    description: 'Expected or actual delivery date'
  },
  'Status': {
    variations: ['status', 'state', 'condition', 'order status', 'po status'],
    required: false,
    dataType: 'string',
    description: 'Current status of the purchase order'
  },
  'Category': {
    variations: ['category', 'type', 'classification', 'group', 'department', 'item category'],
    required: false,
    dataType: 'string',
    description: 'Category or classification of the purchased item'
  },
  'Budget_Code': {
    variations: ['budget', 'budget code', 'cost center', 'department code', 'account code'],
    required: false,
    dataType: 'string',
    description: 'Budget or cost center code for accounting'
  },
  'Approval_Status': {
    variations: ['approval', 'approved', 'approval status', 'authorized', 'approved by'],
    required: false,
    dataType: 'string',
    description: 'Approval status of the purchase order'
  }
};

export interface ColumnMapping {
  originalName: string;
  standardName: string;
  confidence: number;
  dataType: string;
  required: boolean;
}

export interface MissingColumn {
  standardName: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  required: boolean;
}

/**
 * Maps column names from uploaded data to standard procurement fields
 */
export function mapColumnsToStandard(columnNames: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  
  columnNames.forEach(originalName => {
    const lowerOriginal = originalName.toLowerCase().trim();
    let bestMatch: { standardName: string; confidence: number } | null = null;
    
    // Find best matching standard field
    for (const [standardName, fieldInfo] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
      for (const variation of fieldInfo.variations) {
        let confidence = 0;
        
        // Exact match
        if (lowerOriginal === variation) {
          confidence = 1.0;
        }
        // Contains match
        else if (lowerOriginal.includes(variation) || variation.includes(lowerOriginal)) {
          confidence = 0.8;
        }
        // Partial word match
        else {
          const originalWords = lowerOriginal.split(/[\s_-]+/);
          const variationWords = variation.split(/[\s_-]+/);
          const matchingWords = originalWords.filter(word => 
            variationWords.some(vWord => word.includes(vWord) || vWord.includes(word))
          );
          confidence = matchingWords.length / Math.max(originalWords.length, variationWords.length);
        }
        
        if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
          bestMatch = { standardName, confidence };
        }
      }
    }
    
    mappings.push({
      originalName,
      standardName: bestMatch?.standardName || 'Unknown',
      confidence: bestMatch?.confidence || 0,
      dataType: bestMatch ? STANDARD_PROCUREMENT_FIELDS[bestMatch.standardName as keyof typeof STANDARD_PROCUREMENT_FIELDS].dataType : 'string',
      required: bestMatch ? STANDARD_PROCUREMENT_FIELDS[bestMatch.standardName as keyof typeof STANDARD_PROCUREMENT_FIELDS].required : false
    });
  });
  
  return mappings;
}

/**
 * Identifies missing critical columns
 */
export function findMissingColumns(mappings: ColumnMapping[]): MissingColumn[] {
  const mappedStandardNames = new Set(
    mappings
      .filter(m => m.confidence > 0.5)
      .map(m => m.standardName)
  );
  
  const missing: MissingColumn[] = [];
  
  for (const [standardName, fieldInfo] of Object.entries(STANDARD_PROCUREMENT_FIELDS)) {
    if (!mappedStandardNames.has(standardName)) {
      let importance: 'Critical' | 'High' | 'Medium' | 'Low';
      
      if (fieldInfo.required) {
        // Critical required fields
        if (['PO_Number', 'Vendor_Name', 'Total_Amount'].includes(standardName)) {
          importance = 'Critical';
        } else {
          importance = 'High';
        }
      } else {
        // Optional fields
        if (['Status', 'Category'].includes(standardName)) {
          importance = 'Medium';
        } else {
          importance = 'Low';
        }
      }
      
      missing.push({
        standardName,
        importance,
        description: fieldInfo.description,
        required: fieldInfo.required
      });
    }
  }
  
  return missing.sort((a, b) => {
    const importanceOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });
}

/**
 * Calculates data sufficiency based on mapped columns
 */
export function calculateDataSufficiency(mappings: ColumnMapping[]): 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT' {
  const criticalFields = ['PO_Number', 'Vendor_Name', 'Total_Amount'];
  const requiredFields = Object.entries(STANDARD_PROCUREMENT_FIELDS)
    .filter(([_, info]) => info.required)
    .map(([name]) => name);
  
  const mappedStandardNames = new Set(
    mappings
      .filter(m => m.confidence > 0.5)
      .map(m => m.standardName)
  );
  
  const mappedCritical = criticalFields.filter(field => mappedStandardNames.has(field));
  const mappedRequired = requiredFields.filter(field => mappedStandardNames.has(field));
  
  // Must have all critical fields for any level of sufficiency
  if (mappedCritical.length < criticalFields.length) {
    return 'INSUFFICIENT';
  }
  
  // Complete if we have all required fields
  if (mappedRequired.length === requiredFields.length) {
    return 'COMPLETE';
  }
  
  // Partial if we have critical fields and at least 60% of required fields
  if (mappedRequired.length / requiredFields.length >= 0.6) {
    return 'PARTIAL';
  }
  
  return 'INSUFFICIENT';
}

/**
 * Determines UI rendering decision based on data structure
 */
export function determineUIRendering(
  mappings: ColumnMapping[], 
  dataSufficiency: string
): 'USE_STANDARD_UI' | 'USE_CUSTOM_UI' {
  const wellMappedColumns = mappings.filter(m => m.confidence > 0.7).length;
  const totalColumns = mappings.length;
  
  // Use standard UI if we have good data sufficiency and most columns map well
  if (dataSufficiency === 'COMPLETE' && wellMappedColumns / totalColumns > 0.8) {
    return 'USE_STANDARD_UI';
  }
  
  // Use standard UI if we have partial sufficiency and decent mapping
  if (dataSufficiency === 'PARTIAL' && wellMappedColumns / totalColumns > 0.6) {
    return 'USE_STANDARD_UI';
  }
  
  return 'USE_CUSTOM_UI';
}
