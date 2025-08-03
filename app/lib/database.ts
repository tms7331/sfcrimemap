import { sql } from '@vercel/postgres';
import { CrimeIncident } from './generateFakeData';

interface DatabaseIncident {
  id: number;
  longitude: string;  // PostgreSQL returns DECIMAL as string
  latitude: string;   // PostgreSQL returns DECIMAL as string
  incident_category: string;
  incident_subcategory: string;
  incident_description: string;
  incident_datetime: Date;
  incident_date: string;
  incident_time: string;
  incident_year: number;
  incident_day_of_week: string;
  police_district: string;
  analysis_neighborhood: string;
  resolution: string;
  intersection: string;
}

export async function getIncidents(limit: number = 1000): Promise<CrimeIncident[]> {
  try {
    console.log('Fetching incidents from database with limit:', limit);
    
    const result = await sql<DatabaseIncident>`
      SELECT 
        id,
        longitude,
        latitude,
        incident_category,
        incident_subcategory,
        incident_description,
        incident_datetime,
        incident_date::text as incident_date,
        incident_time::text as incident_time,
        incident_year,
        incident_day_of_week,
        police_district,
        analysis_neighborhood,
        resolution,
        COALESCE(intersection, '') as address
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
      longitude: parseFloat(row.longitude),
      latitude: parseFloat(row.latitude),
      address: row.intersection || 'Unknown Location',
      incident_datetime: new Date(row.incident_datetime)
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
    const result = await sql<DatabaseIncident>`
      SELECT 
        id,
        longitude,
        latitude,
        incident_category,
        incident_subcategory,
        incident_description,
        incident_datetime,
        incident_date::text as incident_date,
        incident_time::text as incident_time,
        incident_year,
        incident_day_of_week,
        police_district,
        analysis_neighborhood,
        resolution,
        COALESCE(intersection, '') as address
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
      longitude: parseFloat(row.longitude),
      latitude: parseFloat(row.latitude),
      address: row.intersection || 'Unknown Location',
      incident_datetime: new Date(row.incident_datetime)
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
        COUNT(DISTINCT incident_category) as total_categories,
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