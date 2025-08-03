'use client';

import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ComparisonTable } from './ComparisonTable';

const INITIAL_VIEW_STATE = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

interface ComparisonData {
  longitude: number;
  latitude: number;
  weight: number;
}

interface CategoryStat {
  category: string;
  period1: number;
  period2: number;
  change: number;
  percentChange: number;
}

export function ComparisonMap() {
  const [month1, setMonth1] = useState<string>('2024-01');
  const [month2, setMonth2] = useState<string>('2024-02');
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/comparison?month1=${month1}&month2=${month2}`);
        const data = await response.json();
        setComparisonData(data.heatmapData || []);
        setCategoryStats(data.categoryStats || []);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [month1, month2]);

  const layers = [
    new HeatmapLayer({
      id: 'comparison-heatmap-layer',
      data: comparisonData,
      getPosition: (d: ComparisonData) => [d.longitude, d.latitude],
      getWeight: (d: ComparisonData) => Math.abs(d.weight),
      radiusPixels: 40,
      colorRange: [
        [0, 255, 0, 0],     // Transparent green
        [0, 255, 0, 25],    // Light green (decrease)
        [0, 255, 0, 128],   // Medium green (decrease)
        [255, 255, 0, 128], // Yellow (neutral)
        [255, 128, 0, 128], // Orange (increase)
        [255, 0, 0, 255]    // Red (high increase)
      ],
      weightRange: [0, 10],
    })
  ];

  const generateMonthOptions = () => {
    const options = [];
    const startYear = 2023;
    const endYear = 2024;
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        options.push(`${year}-${monthStr}`);
      }
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">Crime Comparison Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="month1" className="block text-sm font-medium text-gray-300 mb-2">
              First Period
            </label>
            <input
              type="range"
              id="month1"
              min={0}
              max={monthOptions.length - 1}
              value={monthOptions.indexOf(month1)}
              onChange={(e) => setMonth1(monthOptions[parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1 text-gray-400">{month1}</div>
          </div>
          
          <div>
            <label htmlFor="month2" className="block text-sm font-medium text-gray-300 mb-2">
              Second Period
            </label>
            <input
              type="range"
              id="month2"
              min={0}
              max={monthOptions.length - 1}
              value={monthOptions.indexOf(month2)}
              onChange={(e) => setMonth2(monthOptions[parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-1 text-gray-400">{month2}</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400 text-center">
          {loading ? 'Loading comparison data...' : `Showing difference: ${month2} minus ${month1}`}
        </div>
        
        <div className="mt-2 flex justify-center items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-gray-400">Decrease</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span className="text-gray-400">No change</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-gray-400">Increase</span>
          </div>
        </div>
      </div>
      
      <div className="h-[600px] relative rounded-lg overflow-hidden">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
        >
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
            mapStyle="mapbox://styles/mapbox/dark-v11"
          />
        </DeckGL>
      </div>
      
      {/* Comparison Table */}
      <div className="mt-6">
        <ComparisonTable stats={categoryStats} month1={month1} month2={month2} />
      </div>
    </div>
  );
}