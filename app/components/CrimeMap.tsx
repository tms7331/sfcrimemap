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
      radiusPixels: 40,
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