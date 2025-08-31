import React, { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";
import type { MapLayer } from "./types";
import { mapLayers } from "./mapLayers";

interface LayerSwitcherProps {
  selectedLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
  selectedLayer,
  onLayerChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-9">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
        >
          <Layers size={16} />
          <span>{selectedLayer.name}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48 overflow-hidden">
            {mapLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  onLayerChange(layer);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  selectedLayer.id === layer.id
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                    : "text-gray-700"
                }`}
              >
                <div className="font-medium">{layer.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {layer.type === "vector" ? "Vector" : "Raster"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerSwitcher;