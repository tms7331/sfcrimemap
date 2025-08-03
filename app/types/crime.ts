// Crime incident data structure from database
export interface CrimeIncident {
  id: number;
  longitude: number;
  latitude: number;
  incident_category: string;
  incident_category_custom: string;
  incident_subcategory: string;
  incident_description: string;
  incident_datetime: Date;
  incident_day_of_week: string;
  police_district: string;
  analysis_neighborhood: string;
  resolution: string;
  intersection: string;
  address: string;
  // Optional fields from schema that might be useful later
  report_datetime?: Date;
  report_type_description?: string;
  incident_code?: number;
  supervisor_district?: number;
}

// Chart data types
export interface MonthlyData {
  date: string;
  count: number;
}

export interface CategoryTrendData {
  date: string;
  [category: string]: string | number;
}

// Comparison data types
export interface ComparisonData {
  longitude: number;
  latitude: number;
  weight: number;
}

export interface CategoryStat {
  category: string;
  period1: number;
  period2: number;
  change: number;
  percentChange: number;
}