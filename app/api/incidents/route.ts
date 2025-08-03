import { NextResponse } from 'next/server';
import { getIncidents, getIncidentsByDateRange } from '@/app/lib/database';

export async function GET(request: Request) {
  try {
    console.log('API /api/incidents called');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5000');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('Request params:', { limit, startDate, endDate });
    
    let incidents;
    
    if (startDate && endDate) {
      incidents = await getIncidentsByDateRange(
        new Date(startDate),
        new Date(endDate),
        limit
      );
    } else {
      incidents = await getIncidents(limit);
    }
    
    console.log('Retrieved', incidents.length, 'incidents from database');
    
    // Transform to the format expected by the heatmap
    const heatmapData = incidents.map(incident => ({
      longitude: incident.longitude,
      latitude: incident.latitude,
      weight: 1
    }));
    
    console.log('Transformed to heatmap data:', heatmapData.length, 'points');
    if (heatmapData.length > 0) {
      console.log('Sample heatmap point:', heatmapData[0]);
    }
    
    return NextResponse.json({ 
      data: heatmapData,
      count: incidents.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident data' },
      { status: 500 }
    );
  }
}