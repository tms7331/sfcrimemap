import { sql } from '@vercel/postgres';

export interface MonthlyData {
  date: string;
  count: number;
}

export interface CategoryTrendData {
  date: string;
  [category: string]: string | number;
}

export async function getMonthlyDistribution(): Promise<MonthlyData[]> {
  try {
    const result = await sql<{ month: string; count: string }>`
      SELECT 
        DATE_TRUNC('month', incident_datetime)::date::text as month,
        COUNT(*)::text as count
      FROM incidents
      WHERE incident_datetime >= '2018-01-01'
        AND incident_datetime < '2025-01-01'
      GROUP BY DATE_TRUNC('month', incident_datetime)
      ORDER BY month
    `;
    
    return result.rows.map(row => ({
      date: row.month,
      count: parseInt(row.count)
    }));
  } catch (error) {
    console.error('Error fetching monthly distribution:', error);
    throw error;
  }
}

export async function getCategoryTrends(): Promise<CategoryTrendData[]> {
  try {
    // First get the top categories
    const topCategoriesResult = await sql<{ incident_category: string }>`
      SELECT incident_category, COUNT(*) as count
      FROM incidents
      WHERE incident_datetime >= '2018-01-01'
        AND incident_datetime < '2025-01-01'
      GROUP BY incident_category
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const topCategories = topCategoriesResult.rows.map(row => row.incident_category);
    
    // Then get monthly counts for each category
    const result = await sql<{ month: string; incident_category: string; count: string }>`
      SELECT 
        DATE_TRUNC('month', incident_datetime)::date::text as month,
        incident_category,
        COUNT(*)::text as count
      FROM incidents
      WHERE incident_datetime >= '2018-01-01'
        AND incident_datetime < '2025-01-01'
        AND incident_category = ANY(${topCategories})
      GROUP BY DATE_TRUNC('month', incident_datetime), incident_category
      ORDER BY month, incident_category
    `;
    
    // Transform data into the format needed for the area chart
    const dataMap = new Map<string, CategoryTrendData>();
    
    result.rows.forEach(row => {
      const month = row.month;
      if (!dataMap.has(month)) {
        dataMap.set(month, { date: month });
      }
      const monthData = dataMap.get(month)!;
      monthData[row.incident_category] = parseInt(row.count);
    });
    
    // Fill in missing values with 0
    const allMonths = Array.from(dataMap.keys()).sort();
    const completeData: CategoryTrendData[] = allMonths.map(month => {
      const data = dataMap.get(month)!;
      topCategories.forEach(category => {
        if (!(category in data)) {
          data[category] = 0;
        }
      });
      return data;
    });
    
    return completeData;
  } catch (error) {
    console.error('Error fetching category trends:', error);
    throw error;
  }
}