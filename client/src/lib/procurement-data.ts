// Ported from script.js to TypeScript/React logic

export interface Product {
  name: string;
  purchaseCycle: string;
  quantity: number;
  consumption: number;
  cost: number;
  wastage: number;
}

export interface MatrixCell {
  allocated: number;
  consumed: number;
  efficiency: number;
  status: 'normal' | 'warning' | 'critical';
  products: Product[];
}

export interface FinancialData {
  revenueLoss: string;
  costIncrease: string;
  timeWaste: string;
}

export interface ProblemData {
  paymentDelayPercent: number;
  avgDelayDays: number;
  overConsumption: number;
  wasteAmount: string;
  manualWork: number;
  processingTime: number;
  vendorChurn: number;
  qualityScore: string;
}

export interface DashboardData {
  matrix: Record<string, Record<string, MatrixCell>>;
  outputs: {
    outliers: number;
    normal: number;
    delayed: number;
    exceptions: number;
  };
  problems: ProblemData;
  financial: FinancialData;
  healthScore: number;
  kpis: {
    utilization: number[];
    cost: number[];
    wastage: number[];
  };
}

export const CATEGORIES = [
  'Food & Beverages',
  'Housekeeping',
  'Maintenance',
  'Guest Utilities',
  'Utilities & Supplies',
  'Marketing'
];

export const VELOCITIES = ['fast-moving', 'medium', 'slow', 'very-slow', 'once-in-a-while'];

export const generateSyntheticData = (filter: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): DashboardData => {
  const getFilterMultiplier = (f: string) => {
    const multipliers: Record<string, number> = {
      'daily': 1,
      'weekly': 7,
      'monthly': 30,
      'yearly': 365
    };
    return multipliers[f] || 1;
  };

  const baseMultiplier = getFilterMultiplier(filter);

  const generateOutputs = () => ({
    outliers: Math.floor(Math.random() * 15 * baseMultiplier) + 5,
    normal: Math.floor(Math.random() * 50 * baseMultiplier) + 100,
    delayed: Math.floor(Math.random() * 20 * baseMultiplier) + 10,
    exceptions: Math.floor(Math.random() * 8 * baseMultiplier) + 2
  });

  const generateProblems = () => {
    const problems: Record<string, ProblemData> = {
      daily: {
        paymentDelayPercent: 45,
        avgDelayDays: 8.2,
        overConsumption: 28,
        wasteAmount: '₹1.8L',
        manualWork: 82,
        processingTime: 5.8,
        vendorChurn: 22,
        qualityScore: '7.1/10'
      },
      weekly: {
        paymentDelayPercent: 67,
        avgDelayDays: 12.3,
        overConsumption: 34,
        wasteAmount: '₹2.8L',
        manualWork: 79,
        processingTime: 7.2,
        vendorChurn: 31,
        qualityScore: '6.2/10'
      },
      monthly: {
        paymentDelayPercent: 72,
        avgDelayDays: 15.8,
        overConsumption: 41,
        wasteAmount: '₹4.2L',
        manualWork: 76,
        processingTime: 8.5,
        vendorChurn: 38,
        qualityScore: '5.8/10'
      },
      yearly: {
        paymentDelayPercent: 58,
        avgDelayDays: 9.7,
        overConsumption: 29,
        wasteAmount: '₹3.2L',
        manualWork: 81,
        processingTime: 6.8,
        vendorChurn: 26,
        qualityScore: '6.8/10'
      }
    };
    return problems[filter];
  };

  const generateFinancial = () => {
    const financial: Record<string, FinancialData> = {
      daily: { revenueLoss: '₹8.2L', costIncrease: '+22%', timeWaste: '280hrs' },
      weekly: { revenueLoss: '₹12.4L', costIncrease: '+28%', timeWaste: '340hrs' },
      monthly: { revenueLoss: '₹18.6L', costIncrease: '+35%', timeWaste: '420hrs' },
      yearly: { revenueLoss: '₹15.2L', costIncrease: '+31%', timeWaste: '380hrs' }
    };
    return financial[filter];
  };

  const getPurchaseCycle = (velocity: string) => {
    // Simplified logic
    return velocity === 'fast-moving' ? 'Daily' : 'Weekly';
  };

  const generateProductDetails = (category: string, velocity: string) => {
    const products: Record<string, string[]> = {
      'Food & Beverages': ['Fresh Vegetables', 'Dairy Products', 'Beverages', 'Meat & Poultry', 'Bakery Items'],
      'Housekeeping': ['Cleaning Supplies', 'Linens', 'Toiletries', 'Room Amenities', 'Laundry Detergents'],
      'Maintenance': ['Tools', 'Spare Parts', 'Electrical Components', 'Plumbing Supplies', 'Safety Equipment'],
      'Guest Utilities': ['Towels', 'Bathrobes', 'Slippers', 'Welcome Kits', 'Room Service Items'],
      'Utilities & Supplies': ['Office Supplies', 'Printing Materials', 'IT Equipment', 'Furniture', 'Lighting'],
      'Marketing': ['Promotional Materials', 'Signage', 'Brochures', 'Digital Assets', 'Event Supplies']
    };
    
    const categoryProducts = products[category] || ['Generic Items'];
    const selectedProducts = categoryProducts.slice(0, Math.floor(Math.random() * 3) + 1);

    return selectedProducts.map(product => ({
      name: product,
      purchaseCycle: getPurchaseCycle(velocity),
      quantity: Math.floor(Math.random() * 500) + 100,
      consumption: Math.floor(Math.random() * 400) + 80,
      cost: Math.floor(Math.random() * 10000) + 1000,
      wastage: Math.floor(Math.random() * 15) + 2
    }));
  };

  const matrix: Record<string, Record<string, MatrixCell>> = {};
  CATEGORIES.forEach(category => {
    matrix[category] = {};
    VELOCITIES.forEach(velocity => {
      const allocated = Math.floor(Math.random() * 100 * baseMultiplier) + 20;
      const consumed = Math.floor(allocated * (0.7 + Math.random() * 0.6));
      const efficiency = parseFloat((consumed / allocated * 100).toFixed(1));
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      
      if (efficiency > 100) status = 'critical';
      else if (efficiency < 80) status = 'warning';
      
      matrix[category][velocity] = {
        allocated,
        consumed,
        efficiency,
        status,
        products: generateProductDetails(category, velocity)
      };
    });
  });

  const points = filter === 'daily' ? 24 : filter === 'weekly' ? 7 : filter === 'monthly' ? 30 : 12;

  return {
    matrix,
    outputs: generateOutputs(),
    problems: generateProblems(),
    financial: generateFinancial(),
    healthScore: filter === 'daily' ? 42 : 38,
    kpis: {
      utilization: Array.from({length: points}, () => Math.floor(Math.random() * 40) + 60),
      cost: Array.from({length: points}, () => Math.floor(Math.random() * 5000) + 10000),
      wastage: Array.from({length: points}, () => Math.floor(Math.random() * 20) + 5)
    }
  };
};
