import { NextResponse } from 'next/server';
import { getIncidentsByDateRange, CrimeIncident } from '@/app/lib/database';

interface IncidentCount {
  longitude: number;
  latitude: number;
  count: number;
}

function aggregateIncidentsByLocation(incidents: CrimeIncident[]): Map<string, IncidentCount> {
  const locationMap = new Map<string, IncidentCount>();

  incidents.forEach(incident => {
    const key = `${incident.longitude},${incident.latitude}`;
    const existing = locationMap.get(key);

    if (existing) {
      existing.count++;
    } else {
      locationMap.set(key, {
        longitude: incident.longitude,
        latitude: incident.latitude,
        count: 1
      });
    }
  });

  return locationMap;
}

function getLastDayOfMonth(yearMonth: string): number {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month1 = searchParams.get('month1');
  const month2 = searchParams.get('month2');

  if (!month1 || !month2) {
    return NextResponse.json({ error: 'Both month1 and month2 are required' }, { status: 400 });
  }

  try {
    // Get last days of months
    const lastDay1 = getLastDayOfMonth(month1);
    const lastDay2 = getLastDayOfMonth(month2);

    // Fetch incidents for both months
    const [incidents1, incidents2] = await Promise.all([
      getIncidentsByDateRange(
        new Date(`${month1}-01`),
        new Date(`${month1}-${lastDay1}`)
      ),
      getIncidentsByDateRange(
        new Date(`${month2}-01`),
        new Date(`${month2}-${lastDay2}`)
      )
    ]);

    // Aggregate incidents by location for both periods
    const locationMap1 = aggregateIncidentsByLocation(incidents1);
    const locationMap2 = aggregateIncidentsByLocation(incidents2);

    // Calculate differences
    const comparisonData: Array<{ longitude: number; latitude: number; weight: number }> = [];
    const allLocations = new Set([...locationMap1.keys(), ...locationMap2.keys()]);

    allLocations.forEach(locationKey => {
      const count1 = locationMap1.get(locationKey)?.count || 0;
      const count2 = locationMap2.get(locationKey)?.count || 0;
      const difference = count2 - count1;

      if (difference !== 0) {
        const [lng, lat] = locationKey.split(',').map(Number);
        comparisonData.push({
          longitude: lng,
          latitude: lat,
          weight: difference
        });
      }
    });

    // Calculate category statistics
    const categoryStats = calculateCategoryStats(incidents1, incidents2);

    return NextResponse.json({
      heatmapData: comparisonData,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
  }
}

function calculateCategoryStats(incidents1: CrimeIncident[], incidents2: CrimeIncident[]) {
  // Count incidents by category for period 1
  const categoryCounts1 = new Map<string, number>();
  incidents1.forEach(incident => {
    const count = categoryCounts1.get(incident.incident_category) || 0;
    categoryCounts1.set(incident.incident_category, count + 1);
  });

  // Count incidents by category for period 2
  const categoryCounts2 = new Map<string, number>();
  incidents2.forEach(incident => {
    const count = categoryCounts2.get(incident.incident_category) || 0;
    categoryCounts2.set(incident.incident_category, count + 1);
  });

  // Get all unique categories
  const allCategories = new Set([...categoryCounts1.keys(), ...categoryCounts2.keys()]);

  // Build comparison stats
  const stats = Array.from(allCategories).map(category => {
    const period1Count = categoryCounts1.get(category) || 0;
    const period2Count = categoryCounts2.get(category) || 0;
    const change = period2Count - period1Count;
    const percentChange = period1Count > 0 ? ((change / period1Count) * 100) : (period2Count > 0 ? 100 : 0);

    return {
      category,
      period1: period1Count,
      period2: period2Count,
      change,
      percentChange
    };
  });

  // Sort by absolute change (descending)
  return stats.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}