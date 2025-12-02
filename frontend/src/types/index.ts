export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface RevenueResponse {
  data: RevenueDataPoint[];
  range_days: number;
}

export interface CategoryData {
  category: string;
  total: number;
  percentage: number;
}

export interface CategoryResponse {
  categories: CategoryData[];
  total_revenue: number;
}

export interface CustomerData {
  customerID: number;
  total_spent: number;
  transaction_count: number;
}

export interface CustomerStatsResponse {
  total_customers: number;
  total_revenue: number;
  avg_spent_per_customer: number;
  top_customers: CustomerData[];
}

export interface ValidationIssue {
  type: string;
  message: string;
  severity: 'warning' | 'error';
  column?: string;
  count?: number;
  percentage?: number;
  examples?: Array<{
    row?: number;
    value?: string | number;
    column?: string;
    message?: string;
  }>;
}

export interface ValidationSummary {
  total_rows: number;
  valid_rows: number;
  warning_count: number;
  error_count: number;
  has_errors: boolean;
  has_warnings: boolean;
}

export interface UploadResponse {
  message: string;
  rows_inserted: number;
  filename: string;
  warnings?: ValidationIssue[];
  errors?: ValidationIssue[];
  summary?: ValidationSummary;
}

export interface ForecastResponse {
  dates: string[];
  predicted: number[];
  lower: number[];
  upper: number[];
}

export interface AnomalyData {
  date: string;
  value: number;
  score: number;
}

export interface AnomalyResponse {
  dates: string[];
  revenue: number[];
  anomalies: AnomalyData[];
}

export interface Sale {
  id: number;
  date: string;
  amount: number;
  category: string;
  customerID: number;
}

export interface TransformPreviewResponse {
  preview: Record<string, any>[];
  total_rows: number;
  preview_rows: number;
  columns: string[];
  success: boolean;
  error?: string;
}

export interface InsightsRequest {
  revenue: RevenueDataPoint[];
  categories: CategoryData[];
  top_customers: CustomerData[];
  period: string;
}

export interface InsightsResponse {
  insights: string;
  success: boolean;
}
