import { useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import ExifReader from "exifreader";

type Location = {
  latitude: number;
  longitude: number;
};

function App() {
  const [locations, setLocations] = useState<Location[]>([]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newLocations: Location[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            const { gps } = ExifReader.load(e.target.result, {
              expanded: true,
            });
            const latitude = gps?.Latitude;
            const longitude = gps?.Longitude;

            if (latitude && longitude) {
              console.log(
                `File: ${file.name}, Latitude: ${latitude}, Longitude: ${longitude}`
              );
              newLocations.push({
                latitude,
                longitude,
              });
              setLocations((prevLocations) => [
                ...prevLocations,
                ...newLocations,
              ]);
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
            {locations.map((location, index) => (
              <Marker
                key={index}
                latitude={location.latitude}
                longitude={location.longitude}
              />
            ))}
          </Map>
        </div>
      </div>
    </>
  );
}

export default App;
