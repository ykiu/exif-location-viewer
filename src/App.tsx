import { useMemo, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import ExifReader from "exifreader";
import PhotoGroupPane from "./PhotoGroupPane";
import LayerSwitcher from "./LayerSwitcher";
import type { Photo, PhotoGroup, MapLayer } from "./types";
import { mapLayers } from "./mapLayers";

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
        id: consolidated.length,
        latitude: photo.latitude,
        longitude: photo.longitude,
        representativeThumbnail: photo.thumbnail,
        photos: [photo],
      });
    }
  });

  return consolidated;
};

const isNotNullish = <T,>(value: T | null | undefined): value is T => {
  return value != null;
};

const App = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);
  const [zoom, setZoom] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>(mapLayers[0]);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    console.time();
    const photos = await Promise.all(
      Array.from(files).map(async (file) => {
        const { gps, Thumbnail } = await ExifReader.load(
          new File(
            // Limit to first 128KB to avoid loading large image data.
            [file.slice(0, 128 * 1024)],
            file.name,
          {}),
          {
            expanded: true,
          }
        );
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
    console.timeEnd();

    setPhotos(photos.filter(isNotNullish));
    setSelectedGroup(null);
    setIsOverlayVisible(false);
  };
  const photoGroups = useMemo(
    () => consolidateMarkers(photos, 6 / 2 ** zoom), // Adjust how much to consolidate based on zoom level
    [photos, zoom]
  );
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
        <div className="flex-1 relative">
          <Map
            style={{ width: "100%", height: "100%" }}
            onZoomEnd={(event) => setZoom(event.target.getZoom())}
            mapStyle={selectedLayer.style}
          >
            {photoGroups.map((group, index) => (
              <Marker
                key={index}
                latitude={group.latitude}
                longitude={group.longitude}
                onClick={() => setSelectedGroup(group)}
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
          <LayerSwitcher
            selectedLayer={selectedLayer}
            onLayerChange={setSelectedLayer}
          />
        </div>
        {selectedGroup != null && (
          <PhotoGroupPane
            key={selectedGroup.id}
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
          />
        )}
      </div>
    </>
  );
};

export default App;
