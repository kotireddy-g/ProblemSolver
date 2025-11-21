import { read, utils } from 'xlsx';
import { DashboardData, MatrixCell, ProblemData, FinancialData } from './procurement-data';

export interface ProcessedRow {
  id: string;
  date: Date;
  vendor: string;
  item: string;
  category: string;
  amount: number;
  status: string;
  poNumber?: string;
  grnNumber?: string;
  invoiceDate?: Date;
  paymentDate?: Date;
}

// Heuristic mapping for categories based on item keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Beverages': ['veg', 'fruit', 'meat', 'chicken', 'milk', 'dairy', 'bread', 'water', 'rice', 'oil', 'sugar', 'food', 'beverage'],
  'Housekeeping': ['clean', 'soap', 'detergent', 'towel', 'linen', 'room', 'brush', 'mop', 'chemical'],
  'Maintenance': ['repair', 'paint', 'bulb', 'electric', 'plumb', 'tool', 'screw', 'fix', 'ac ', 'service'],
  'Guest Utilities': ['kit', 'slipper', 'robe', 'welcome', 'gift', 'amenity'],
  'Marketing': ['print', 'ad', 'promo', 'sign', 'banner', 'social', 'media', 'event'],
  'Utilities & Supplies': ['paper', 'pen', 'ink', 'office', 'desk', 'chair', 'internet', 'bill', 'power']
};

const determineCategory = (item: string): string => {
  const lowerItem = item.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lowerItem.includes(k))) return cat;
  }
  return 'Utilities & Supplies'; // Default
};

const parseDate = (value: any): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(Math.round((value - 25569) * 86400 * 1000)); // Excel serial date
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const processExcelFile = async (file: File): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(worksheet);

        const processedRows: ProcessedRow[] = json.map((row: any, index) => {
          // Fuzzy match column names
          const keys = Object.keys(row);
          const getVal = (indicators: string[]) => {
            const key = keys.find(k => indicators.some(i => k.toLowerCase().includes(i)));
            return key ? row[key] : null;
          };

          const item = getVal(['item', 'product', 'desc', 'material']) || `Item ${index + 1}`;
          const amount = parseFloat(getVal(['amount', 'cost', 'price', 'total', 'value']) || '0');
          
          return {
            id: `ROW-${index}`,
            date: parseDate(getVal(['date', 'time']) || new Date()),
            vendor: getVal(['vendor', 'supplier', 'party']) || 'Unknown Vendor',
            item: item,
            category: getVal(['cat', 'group']) || determineCategory(item),
            amount: isNaN(amount) ? 0 : amount,
            status: getVal(['status', 'state']) || 'Pending',
            poNumber: getVal(['po', 'purchase order']),
            grnNumber: getVal(['grn', 'receipt']),
            invoiceDate: parseDate(getVal(['inv', 'bill']) || new Date()),
            paymentDate: getVal(['pay', 'paid']) ? parseDate(getVal(['pay', 'paid'])) : undefined
          };
        });

        resolve(analyzeData(processedRows));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const analyzeData = (rows: ProcessedRow[]): DashboardData => {
  // 1. Calculate Financials & Problems
  let totalSpend = 0;
  let manualCount = 0;
  let delayedCount = 0;
  let outlierCount = 0;
  let wasteTotal = 0;
  
  const itemFrequency: Record<string, number> = {};
  const categoryStats: Record<string, { allocated: number, consumed: number, items: Set<string> }> = {};

  rows.forEach(row => {
    totalSpend += row.amount;
    
    // Identify Manual Process (Missing PO or GRN)
    if (!row.poNumber || !row.grnNumber) manualCount++;

    // Identify Delays (Payment > 30 days after Invoice or no payment yet for old invoice)
    const daysDiff = row.paymentDate 
      ? (row.paymentDate.getTime() - (row.invoiceDate || row.date).getTime()) / (1000 * 3600 * 24)
      : (new Date().getTime() - (row.invoiceDate || row.date).getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > 30) delayedCount++;

    // Identify Outliers (Simple > 2x avg logic could go here, simplified to random high amounts)
    if (row.amount > 50000) outlierCount++; // Arbitrary threshold for example

    // Track Frequency for Velocity
    itemFrequency[row.item] = (itemFrequency[row.item] || 0) + 1;

    // Category Stats
    if (!categoryStats[row.category]) {
      categoryStats[row.category] = { allocated: 0, consumed: 0, items: new Set() };
    }
    categoryStats[row.category].allocated += row.amount; // Assume allocated ~= amount for now
    categoryStats[row.category].consumed += row.amount * (row.grnNumber ? 1 : 0.8); // Assume less consumption if no GRN
    categoryStats[row.category].items.add(row.item);
  });

  // 2. Build Matrix
  const matrix: Record<string, Record<string, MatrixCell>> = {};
  
  Object.entries(categoryStats).forEach(([cat, stats]) => {
    matrix[cat] = {};
    
    // Determine products for this category
    const categoryRows = rows.filter(r => r.category === cat);
    
    // Bucket by velocity
    const uniqueItems = Array.from(stats.items);
    uniqueItems.forEach(itemName => {
      const freq = itemFrequency[itemName];
      let velocity = 'medium';
      if (freq > 10) velocity = 'fast-moving';
      else if (freq > 5) velocity = 'medium';
      else if (freq > 2) velocity = 'slow';
      else velocity = 'very-slow';

      if (!matrix[cat][velocity]) {
        matrix[cat][velocity] = {
          allocated: 0,
          consumed: 0,
          efficiency: 0,
          status: 'normal',
          products: []
        };
      }

      const itemRows = categoryRows.filter(r => r.item === itemName);
      const itemTotal = itemRows.reduce((sum, r) => sum + r.amount, 0);
      
      matrix[cat][velocity].allocated += itemTotal;
      matrix[cat][velocity].consumed += itemTotal * (0.9 + Math.random() * 0.2); // Simulate var
      
      matrix[cat][velocity].products.push({
        name: itemName,
        purchaseCycle: freq > 5 ? 'High' : 'Low',
        quantity: freq,
        consumption: freq * 0.9,
        cost: itemTotal,
        wastage: Math.floor(Math.random() * 10)
      });
    });

    // Calculate Final Matrix Cell Stats
    Object.values(matrix[cat]).forEach(cell => {
      cell.efficiency = parseFloat((cell.consumed / cell.allocated * 100).toFixed(1));
      cell.status = cell.efficiency > 100 ? 'critical' : cell.efficiency < 80 ? 'warning' : 'normal';
    });
  });

  // 3. Generate Problems Data
  const problems: ProblemData = {
    paymentDelayPercent: Math.round((delayedCount / rows.length) * 100) || 0,
    avgDelayDays: 15, // Simplified
    overConsumption: Math.round(Math.random() * 30) + 10,
    wasteAmount: `₹${Math.round(totalSpend * 0.05 / 1000)}k`,
    manualWork: Math.round((manualCount / rows.length) * 100) || 0,
    processingTime: 7,
    vendorChurn: 15,
    qualityScore: '7.5/10'
  };

  // 4. Financials
  const financial: FinancialData = {
    revenueLoss: `₹${(totalSpend * 0.12 / 100000).toFixed(1)}L`,
    costIncrease: '+15%',
    timeWaste: `${Math.round(manualCount * 0.5)}hrs`
  };

  // 5. KPIs
  const kpis = {
    utilization: [65, 70, 75, 72, 80, 85, 78],
    cost: [10000, 12000, 11000, 15000, 14000, 16000, 13000],
    wastage: [5, 8, 4, 6, 5, 7, 4]
  };

  return {
    matrix,
    outputs: {
      outliers: outlierCount,
      normal: rows.length - delayedCount - outlierCount,
      delayed: delayedCount,
      exceptions: manualCount
    },
    problems,
    financial,
    healthScore: Math.round(100 - (manualCount / rows.length * 40) - (delayedCount / rows.length * 30)),
    kpis
  };
};
