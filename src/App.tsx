import { useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import ExifReader from "exifreader";

type Photo = {
  latitude: number;
  longitude: number;
  thumbnail: string;
};

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);

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
              setPhotos((prevLocations) => [...prevLocations, ...newPhotos]);
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

  return (
    <>
      <div className="flex flex-col h-dvh">
        <div className="flex-1" onDrop={handleDrop} onDragOver={handleDragOver}>
          <Map
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
          >
            {photos.map((photo, index) => (
              <Marker
                key={index}
                latitude={photo.latitude}
                longitude={photo.longitude}
              >
                <div
                  className="marker bg-cover w-16 h-16 rounded-full border-2 border-white shadow-lg"
                  style={{
                    backgroundImage: `url(${photo.thumbnail})`,
                  }}
                ></div>
              </Marker>
            ))}
          </Map>
        </div>
      </div>
    </>
  );
}

export default App;
