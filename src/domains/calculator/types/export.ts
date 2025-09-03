export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
}

export interface ExportCalculationItem {
  date: string | Date;
  cost?: string;
  margin?: number;
  tax?: string;
  cardFee?: string;
  shipping?: string;
  result?: {
    sellingPrice?: number;
    breakdown?: { profit?: number };
  };
}

export interface ExportData {
  calculations: Array<ExportCalculationItem | import('./calculator').CalculationHistory>;
  marketplaceData?: Record<string, unknown>;
  period?: string;
  filters?: Record<string, unknown>;
  charts?: {
    trends: ChartData;
    categories: ChartData;
    volume: ChartData;
  };
  summary?: {
    totalCalculations: number;
    avgMargin: number;
    avgSellingPrice: number;
    totalRevenue: number;
    periodLabel: string;
  };
}

export interface ScheduleOptions {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  emails: string[];
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
}

export interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  emails: string[];
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
  data: ExportData;
  createdAt: Date;
  nextExecution: Date;
}