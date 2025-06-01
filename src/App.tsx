import { useMemo, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import ExifReader from "exifreader";
import PhotoGroupPane from "./PhotoGroupPane";
import type { Photo, PhotoGroup } from "./types";

const consolidateMarkers = (
  photos: Photo[],
  threshold: number
): PhotoGroup[] => {
  const consolidated: PhotoGroup[] = [];

  photos.forEach((photo) => {
    const existingCluster = consolidated.find((cluster) => {
      const distance = Math.sqrt(
        Math.pow(cluster.latitude - photo.latitude, 2) +
          Math.pow(cluster.longitude - photo.longitude, 2)
      );
      return distance < threshold;
    });

    if (existingCluster) {
      existingCluster.photos.push(photo);
      existingCluster.representativeThumbnail =
        existingCluster.representativeThumbnail || photo.thumbnail;
    } else {
      consolidated.push({
        latitude: photo.latitude,
        longitude: photo.longitude,
        representativeThumbnail: photo.thumbnail,
        photos: [photo],
      });
    }
  });

  return consolidated;
};

const loadFile = (file: File): Promise<ArrayBuffer> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as ArrayBuffer);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

const isNotNullish = <T,>(value: T | null | undefined): value is T => {
  return value != null;
};

const App = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  );
  const [zoom, setZoom] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const photos = await Promise.all(
      Array.from(files).map(async (file) => {
        const { gps, Thumbnail } = ExifReader.load(await loadFile(file), {
          expanded: true,
        });
        const latitude = gps?.Latitude;
        const longitude = gps?.Longitude;

        if (latitude && longitude) {
          console.log(
            `File: ${file.name}, Latitude: ${latitude}, Longitude: ${longitude}`
          );
          const url = Thumbnail
            ? "data:image/jpeg;base64," + Thumbnail.base64
            : "";
          return {
            latitude,
            longitude,
            thumbnail: url,
            file,
          };
        }
      })
    );
    setPhotos(photos.filter(isNotNullish));
    setSelectedGroupIndex(null);
    setIsOverlayVisible(false);
  };
  const photoGroups = useMemo(
    () => consolidateMarkers(photos, 9 / 2 ** zoom), // Adjust how much to consolidate based on zoom level
    [photos, zoom]
  );
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleMarkerClick = (index: number) => {
    setSelectedGroupIndex(index);
  };
  return (
    <>
      {isOverlayVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white text-lg z-10 pointer-events-none">
          Drag & drop geo-tagged images.
        </div>
      )}
      <div
        className="flex flex-row h-dvh"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex-1">
          <Map
            style={{ width: "100%", height: "100%" }}
            onZoomEnd={(event) => setZoom(event.target.getZoom())}
            mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
          >
            {photoGroups.map((group, index) => (
              <Marker
                key={index}
                latitude={group.latitude}
                longitude={group.longitude}
                onClick={() => handleMarkerClick(index)}
              >
                <div
                  className="marker bg-cover w-16 h-16 rounded-full border-2 border-white shadow-lg"
                  style={{
                    backgroundImage: `url(${group.representativeThumbnail})`,
                  }}
                ></div>
              </Marker>
            ))}
          </Map>
        </div>
        {selectedGroupIndex != null && photoGroups[selectedGroupIndex] && (
          <PhotoGroupPane
            key={selectedGroupIndex}
            group={photoGroups[selectedGroupIndex]}
            onClose={() => setSelectedGroupIndex(null)}
          />
        )}
      </div>
    </>
  );
};

export default App;
