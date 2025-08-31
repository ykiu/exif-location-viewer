import type { MapLayer } from './types';

export const mapLayers: MapLayer[] = [
  {
    id: 'osm-japan',
    name: 'OSM Japan',
    style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
    type: 'vector'
  },
  {
    id: 'gsi-standard',
    name: '地理院標準地図',
    style: {
        version: 8,
        sources: {
          'gsi-standard': {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'gsi-standard',
            type: 'raster',
            source: 'gsi-standard',
          },
        ],
      },
    type: 'raster'
  },
  {
    id: 'gsi-photo',
    name: '地理院全国最新写真',
    style: {
      version: 8,
      sources: {
        'gsi-photo': {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'gsi-photo',
          type: 'raster',
          source: 'gsi-photo',
        },
      ],
    },
    type: 'raster'
  }
];