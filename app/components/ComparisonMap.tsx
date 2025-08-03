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

interface ComparisonMapProps {
  month1?: string;
  month2?: string;
  hideControls?: boolean;
}

export function ComparisonMap({ month1 = '2024-01', month2 = '2024-02', hideControls = false }: ComparisonMapProps) {
  const [internalMonth1, setInternalMonth1] = useState<string>(month1);
  const [internalMonth2, setInternalMonth2] = useState<string>(month2);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInternalMonth1(month1);
    setInternalMonth2(month2);
  }, [month1, month2]);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/comparison?month1=${internalMonth1}&month2=${internalMonth2}`);
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
  }, [internalMonth1, internalMonth2]);

  const layers = [
    new HeatmapLayer({
      id: 'comparison-heatmap-layer',
      data: comparisonData,
      getPosition: (d: ComparisonData) => [d.longitude, d.latitude],
      getWeight: (d: ComparisonData) => d.weight,
      radiusPixels: 50,
      intensity: 1.2,
      threshold: 0.02,
      colorRange: [
        [65, 182, 196, 180],   // Teal for strong decrease
        [50, 166, 240, 140],   // Blue for moderate decrease
        [94, 79, 162, 100],    // Purple for slight decrease
        [255, 255, 255, 50],   // White/transparent for no change
        [236, 64, 122, 140],   // Pink for moderate increase
        [255, 20, 50, 200],    // Red for strong increase
      ],
      weightRange: [-10, 10],
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
    <div className="w-full h-full flex flex-col">
      {!hideControls && (
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="month1" className="block text-sm font-medium text-slate-300 mb-2">
                First Period
              </label>
              <input
                type="range"
                id="month1"
                min={0}
                max={monthOptions.length - 1}
                value={monthOptions.indexOf(internalMonth1)}
                onChange={(e) => setInternalMonth1(monthOptions[parseInt(e.target.value)])}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-1 text-slate-400">{internalMonth1}</div>
            </div>
            
            <div>
              <label htmlFor="month2" className="block text-sm font-medium text-slate-300 mb-2">
                Second Period
              </label>
              <input
                type="range"
                id="month2"
                min={0}
                max={monthOptions.length - 1}
                value={monthOptions.indexOf(internalMonth2)}
                onChange={(e) => setInternalMonth2(monthOptions[parseInt(e.target.value)])}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-1 text-slate-400">{internalMonth2}</div>
            </div>
          </div>
        
          <div className="mt-4 text-sm text-slate-400 text-center">
            {loading ? 'Loading comparison data...' : `Showing difference: ${internalMonth2} minus ${internalMonth1}`}
          </div>
        
        <div className="mt-2 flex justify-center items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-slate-400">Decrease</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span className="text-slate-400">No change</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-slate-400">Increase</span>
          </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 relative rounded-lg overflow-hidden min-h-[400px]">
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
      {!hideControls && (
        <div className="mt-6">
          <ComparisonTable stats={categoryStats} month1={internalMonth1} month2={internalMonth2} />
        </div>
      )}
    </div>
  );
}