'use client';

import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const INITIAL_VIEW_STATE = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

interface CrimeData {
  longitude: number;
  latitude: number;
  weight?: number;
}

interface CrimeMapProps {
  data: CrimeData[];
}

export function CrimeMap({ data }: CrimeMapProps) {

  const layers = [
    new HeatmapLayer({
      id: 'heatmap-layer',
      data,
      getPosition: (d: CrimeData) => [d.longitude, d.latitude],
      getWeight: (d: CrimeData) => d.weight || 1,
      radiusPixels: 50,
      intensity: 1.2,
      threshold: 0.02,
      colorRange: [
        [65, 182, 196, 80],    // Light teal, more visible
        [50, 166, 240, 120],   // Blue, transparent
        [94, 79, 162, 160],    // Purple, semi-transparent
        [171, 71, 188, 180],   // Light purple, less transparent
        [236, 64, 122, 200],   // Pink-red, slightly opaque
        [255, 20, 50, 240],    // Bright red, mostly opaque
      ],
      aggregation: 'SUM',
    })
  ];

  // https://visgl.github.io/react-map-gl/docs/get-started
  return (
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
  );
}