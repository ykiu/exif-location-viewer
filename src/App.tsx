import { useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import ExifReader from "exifreader";
import { X } from "lucide-react";

type Photo = {
  latitude: number;
  longitude: number;
  thumbnail: string;
};

type PhotoGroup = {
  latitude: number;
  longitude: number;
  representativeThumbnail: string;
  photos: Photo[];
};

function consolidateMarkers(photos: Photo[], threshold: number): PhotoGroup[] {
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
}

function App() {
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<PhotoGroup | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newPhotos: Photo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const { gps, Thumbnail } = ExifReader.load(e.target.result, {
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
              newPhotos.push({
                latitude,
                longitude,
                thumbnail: url,
              });
              setPhotoGroups((prevGroups) =>
                consolidateMarkers(
                  [
                    ...prevGroups.flatMap((group) => group.photos),
                    ...newPhotos,
                  ],
                  0.01
                )
              );
            } else {
              console.log(`File: ${file.name}, No GPS data found.`);
            }
          } catch (error) {
            console.error(
              `Error reading EXIF data from file: ${file.name}`,
              error
            );
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }
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
          <div className="w-1/2 bg-gray-100 relative flex flex-col">
            <div className="flex items-center p-2">
              <button
                className="p-2 rounded-full hover:bg-gray-200"
                onClick={() => setSelectedGroup(null)}
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold">Photos</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto min-h-0">
              {selectedGroup.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.thumbnail}
                  alt="Photo"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
