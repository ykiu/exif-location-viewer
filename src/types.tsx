export type Photo = {
  latitude: number;
  longitude: number;
  thumbnail: string;
  file: File;
};

export type PhotoGroup = {
  latitude: number;
  longitude: number;
  representativeThumbnail: string;
  photos: Photo[];
};
