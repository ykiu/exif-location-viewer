import { useState } from "react";
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
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);

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
    setPhotoGroups(consolidateMarkers(photos.filter(isNotNullish), 0.01));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleMarkerClick = (group: PhotoGroup) => {
    setSelectedGroup(group);
  };

  return (
    <>
      <div className="flex flex-row h-dvh">
        <div className="flex-1" onDrop={handleDrop} onDragOver={handleDragOver}>
          <Map
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
          >
            {photoGroups.map((group, index) => (
              <Marker
                key={index}
                latitude={group.latitude}
                longitude={group.longitude}
                onClick={() => handleMarkerClick(group)}
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
        {selectedGroup && (
          <PhotoGroupPane
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
          />
        )}
      </div>
    </>
  );
};

export default App;
