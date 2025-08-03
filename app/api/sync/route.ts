import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Mapping logic from dbwrite.py
function getCustomCategory(incidentCategory: string | null | undefined): string | null {
  if (!incidentCategory) return null;

  const category = incidentCategory.trim();

  const exactMappings: Record<string, string> = {
    // Property Theft & Larceny
    "Larceny Theft": "Property Theft & Larceny",
    "Stolen Property": "Property Theft & Larceny",
    // Burglary
    "Burglary": "Burglary",
    // Vehicle-Related Crimes
    "Motor Vehicle Theft": "Vehicle-Related Crimes",
    "Motor Vehicle Theft?": "Vehicle-Related Crimes",
    // Physical Violence & Assault
    "Assault": "Physical Violence & Assault",
    "Weapons Offense": "Physical Violence & Assault",
    "Weapons Carrying Etc": "Physical Violence & Assault",
    "Offences Against The Family And Children": "Physical Violence & Assault",
    "Homicide": "Physical Violence & Assault",
    "Weapons Offence": "Physical Violence & Assault",
    // Robbery
    "Robbery": "Robbery",
    // Sexual & Violent Crimes
    "Sex Offense": "Sexual & Violent Crimes",
    "Rape": "Sexual & Violent Crimes",
    "Human Trafficking (A), Commercial Sex Acts": "Sexual & Violent Crimes",
    "Human Trafficking, Commercial Sex Acts": "Sexual & Violent Crimes",
    "Human Trafficking (B), Involuntary Servitude": "Sexual & Violent Crimes",
    // Drug & Public Order
    "Drug Offense": "Drug & Public Order",
    "Disorderly Conduct": "Drug & Public Order",
    "Traffic Violation Arrest": "Drug & Public Order",
    "Prostitution": "Drug & Public Order",
    "Drug Violation": "Drug & Public Order",
    "Liquor Laws": "Drug & Public Order",
    "Civil Sidewalks": "Drug & Public Order",
    "Gambling": "Drug & Public Order",
    // Financial Crimes
    "Fraud": "Financial Crimes",
    "Forgery And Counterfeiting": "Financial Crimes",
    "Embezzlement": "Financial Crimes",
    // Administrative & Investigative
    "Other Miscellaneous": "Administrative & Investigative",
    "Non-Criminal": "Administrative & Investigative",
    "Warrant": "Administrative & Investigative",
    "Lost Property": "Administrative & Investigative",
    "Missing Person": "Administrative & Investigative",
    "Suspicious Occ": "Administrative & Investigative",
    "Miscellaneous Investigation": "Administrative & Investigative",
    "Courtesy Report": "Administrative & Investigative",
    "Fire Report": "Administrative & Investigative",
    "Traffic Collision": "Administrative & Investigative",
    "Vehicle Impounded": "Administrative & Investigative",
    "Suicide": "Administrative & Investigative",
    "Vehicle Misplaced": "Administrative & Investigative",
    "Suspicious": "Administrative & Investigative",
    // Property Damage
    "Malicious Mischief": "Property Damage",
    "Arson": "Property Damage",
    "Vandalism": "Property Damage",
  };

  // Check for exact match
  if (exactMappings[category]) {
    return exactMappings[category];
  }

  // Check if this is an excluded category
  const excludedCategories = [
    "Other",
    "Other Offenses",
    "Case Closure",
    "Recovered Vehicle",
  ];

  if (excludedCategories.includes(category)) {
    return null; // Filter out excluded categories
  }

  // Log unexpected category but return null to avoid errors
  console.warn(`Unexpected incident category: '${incidentCategory}'`);
  return null;
}

interface SFIncident {
  incident_datetime: string;
  incident_day_of_week: string;
  report_datetime: string;
  report_type_description: string;
  incident_code: string;
  incident_category: string;
  incident_subcategory: string;
  incident_description: string;
  resolution: string;
  intersection: string;
  latitude: string;
  longitude: string;
  police_district: string;
  analysis_neighborhood: string;
  supervisor_district: string;
}

export async function POST() {
  try {
    // Step 1: Get the most recent incident datetime from database
    const latestResult = await sql`
      SELECT MAX(incident_datetime) as latest_datetime
      FROM incidents
    `;

    const latestDatetime = latestResult.rows[0]?.latest_datetime;

    // Format datetime for API query (ISO 8601 format)
    const whereClause = latestDatetime
      ? `incident_datetime > '${new Date(latestDatetime).toISOString()}'`
      : `incident_datetime > '2025-01-01T00:00:00.000'`; // Default to recent data

    console.log('Querying for incidents after:', whereClause);

    // Step 2: Fetch new incidents from SF Open Data API
    const apiUrl = new URL('https://data.sfgov.org/resource/wg3w-h783.json');
    apiUrl.searchParams.append('$limit', '5000');
    apiUrl.searchParams.append('$where', whereClause);
    apiUrl.searchParams.append('$order', 'incident_datetime ASC');

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`SF Open Data API error: ${response.statusText}`);
    }

    const incidents: SFIncident[] = await response.json();

    console.log(`Fetched ${incidents.length} new incidents from API`);

    if (incidents.length === 0) {
      return NextResponse.json({
        message: 'No new incidents to sync',
        lastChecked: new Date().toISOString()
      });
    }

    // Step 3: Transform and filter data
    let insertedCount = 0;
    let skippedCount = 0;

    for (const incident of incidents) {
      // Get custom category
      const customCategory = getCustomCategory(incident.incident_category);

      // Skip if no incident category or excluded category
      if (!incident.incident_category || !customCategory) {
        skippedCount++;
        continue;
      }

      // Skip if no valid coordinates
      if (!incident.latitude || !incident.longitude) {
        skippedCount++;
        continue;
      }

      // Parse numeric values
      const latitude = parseFloat(incident.latitude);
      const longitude = parseFloat(incident.longitude);
      const incidentCode = incident.incident_code ? parseInt(incident.incident_code) : null;
      const supervisorDistrict = incident.supervisor_district ? parseInt(incident.supervisor_district) : null;

      // Skip if coordinates are invalid
      if (isNaN(latitude) || isNaN(longitude)) {
        skippedCount++;
        continue;
      }

      try {
        // Insert into database
        await sql`
          INSERT INTO incidents (
            incident_datetime,
            incident_day_of_week,
            report_datetime,
            report_type_description,
            incident_code,
            incident_category_custom,
            incident_category,
            incident_subcategory,
            incident_description,
            resolution,
            intersection,
            latitude,
            longitude,
            police_district,
            analysis_neighborhood,
            supervisor_district
          ) VALUES (
            ${incident.incident_datetime},
            ${incident.incident_day_of_week || null},
            ${incident.report_datetime || null},
            ${incident.report_type_description || null},
            ${incidentCode},
            ${customCategory},
            ${incident.incident_category},
            ${incident.incident_subcategory || null},
            ${incident.incident_description || null},
            ${incident.resolution || null},
            ${incident.intersection || null},
            ${latitude},
            ${longitude},
            ${incident.police_district || null},
            ${incident.analysis_neighborhood || null},
            ${supervisorDistrict}
          )
        `;

        insertedCount++;
      } catch (error) {
        console.error('Error inserting incident:', error, incident);
        // Continue with next incident
      }
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      totalFetched: incidents.length,
      inserted: insertedCount,
      skipped: skippedCount,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync incidents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}