import { sql } from '@vercel/postgres';

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

export async function getIncidents(limit: number = 1000): Promise<CrimeIncident[]> {
  try {
    console.log('Fetching incidents from database with limit:', limit);

    const result = await sql<CrimeIncident>`
      SELECT 
        id,
        longitude,
        latitude,
        incident_category,
        incident_category_custom,
        incident_subcategory,
        incident_description,
        incident_datetime,
        incident_day_of_week,
        police_district,
        analysis_neighborhood,
        resolution,
        intersection,
        report_datetime,
        report_type_description,
        incident_code,
        supervisor_district
      FROM incidents
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      ORDER BY incident_datetime DESC
      LIMIT ${limit}
    `;

    console.log('Database query returned', result.rows.length, 'rows');
    if (result.rows.length > 0) {
      console.log('Sample row before conversion:', result.rows[0]);
      console.log('Longitude type:', typeof result.rows[0].longitude);
    }

    return result.rows.map(row => ({
      ...row,
      address: row.intersection || 'Unknown Location',
      incident_datetime: new Date(row.incident_datetime),
      report_datetime: row.report_datetime ? new Date(row.report_datetime) : undefined
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch incidents from database');
  }
}

export async function getIncidentsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 5000
): Promise<CrimeIncident[]> {
  try {
    const result = await sql<CrimeIncident>`
      SELECT 
        id,
        longitude,
        latitude,
        incident_category,
        incident_category_custom,
        incident_subcategory,
        incident_description,
        incident_datetime,
        incident_day_of_week,
        police_district,
        analysis_neighborhood,
        resolution,
        intersection,
        report_datetime,
        report_type_description,
        incident_code,
        supervisor_district
      FROM incidents
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND incident_datetime >= ${startDate.toISOString()}
        AND incident_datetime <= ${endDate.toISOString()}
      ORDER BY incident_datetime DESC
      LIMIT ${limit}
    `;

    return result.rows.map(row => ({
      ...row,
      address: row.intersection || 'Unknown Location',
      incident_datetime: new Date(row.incident_datetime),
      report_datetime: row.report_datetime ? new Date(row.report_datetime) : undefined
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch incidents from database');
  }
}

export async function getIncidentStats() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(DISTINCT incident_category_custom) as total_categories,
        COUNT(DISTINCT police_district) as total_districts,
        MIN(incident_datetime) as earliest_incident,
        MAX(incident_datetime) as latest_incident
      FROM incidents
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;

    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch incident statistics');
  }
}