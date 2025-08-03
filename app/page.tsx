'use client';

import { useEffect, useState } from 'react';
import { CrimeMap } from './components/CrimeMap';
import { CrimeCharts } from './components/CrimeCharts';

interface HeatmapData {
  longitude: number;
  latitude: number;
  weight: number;
}

export default function Home() {
  const [crimeData, setCrimeData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/incidents?limit=5000');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();

        setCrimeData(result.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="h-screen w-full flex items-center justify-center">
        <div className="text-white text-xl">Loading crime data...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen w-full flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full flex">
      {/* Map Section - 2/3 of screen */}
      <div className="flex-1 relative">
        <CrimeMap data={crimeData} />
      </div>
      
      {/* Charts Section - 1/3 of screen */}
      <div className="w-1/3 bg-gray-800 overflow-y-auto">
        <CrimeCharts />
      </div>
    </main>
  );
}