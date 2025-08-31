import type { StyleSpecification } from "maplibre-gl";

export type Photo = {
  latitude: number;
  longitude: number;
  thumbnail: string;
  file: File;
};

export type PhotoGroup = {
  id: number;
  latitude: number;
  longitude: number;
  representativeThumbnail: string;
  photos: Photo[];
};

export type MapLayer = {
  id: string;
  name: string;
  style: string | StyleSpecification;
  type: 'vector' | 'raster';
};

