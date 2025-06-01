import { useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map from "react-map-gl/maplibre";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex flex-col h-dvh">
        <div className=" flex-1">
          <Map
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
          />
        </div>
      </div>
    </>
  );
}

export default App;
