'use client';

import { useMemo } from 'react';
import { CrimeMap } from './components/CrimeMap';
import { generateFakeCrimeData } from './lib/generateFakeData';

export default function Home() {
  // Generate fake crime data
  const crimeData = useMemo(() => {
    const incidents = generateFakeCrimeData(5000);
    return incidents.map(incident => ({
      longitude: incident.longitude,
      latitude: incident.latitude,
      weight: 1
    }));
  }, []);

  return (
    <main className="h-screen w-full">
      <CrimeMap data={crimeData} />
    </main>
  );
}