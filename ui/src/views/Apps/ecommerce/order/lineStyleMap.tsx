import React, { useEffect, useState } from "react";
import { VectorMap } from "@south-paw/react-vector-maps";
import World from "@src/data/world-map.json";

// Define types for markers and lines
interface Marker {
  name: string;
  coords: [number, number];
  fill: string;
}

interface Line {
  from: string;
  to: string;
}

// Component
const LineStyleOrderMap: React.FC = () => {
  const [hovered, setHovered] = React.useState<string>("None");
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Dark mode state

  const checkDarkMode = () => {
    const mode = document.documentElement.getAttribute("data-mode");
    setIsDarkMode(mode === "dark");
  };

  useEffect(() => {
    checkDarkMode();
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  // Markers definition
  const markers: Marker[] = [
    { name: "Brazil", coords: [206.37675, 617.5064], fill: "grey" },
    { name: "Greenland", coords: [151.7069, 792.6043], fill: "grey" },
  ];
  const lines: Line[] = [{ from: "Brazil", to: "Greenland" }];

  const layerProps = {
    onMouseEnter: (event: React.MouseEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement;
      setHovered(target.getAttribute("name") || "None");
    },
    onMouseLeave: () => {
      setHovered("None");
    },
    onMouseMove: (event: React.MouseEvent<SVGPathElement>) => {
      setTooltipPosition({
        top: event.clientY + 10,
        left: event.clientX - 480,
      });
    },
    onFocus: (event: React.FocusEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement;
      setHovered(target.getAttribute("name") || "None");
    },
    onBlur: () => setHovered("None"),
    onClick: (event: React.MouseEvent<SVGPathElement>) => {
      const target = event.currentTarget as SVGPathElement;
      setHovered(target.getAttribute("name") || "None");
    },
  };

  const getMarkerByName = (name: string): Marker | undefined =>
    markers.find((marker) => marker.name === name);

  return (
    <div style={{ position: "relative" }}>
      <svg style={{ width: "100%", height: "288px", position: "relative" }}>
        {/* World map */}
        <VectorMap
          {...World}
          layerProps={layerProps}
          style={{
            fill: isDarkMode ? "#1e293b" : "#f3f4f6",
            stroke: isDarkMode ? "#0f172a" : "#fff",
            height: "288px",
            width: "100%",
          }}
        />

        {/* Render lines connecting markers */}
        {lines.map((line, index) => {
          const fromMarker = getMarkerByName(line.from);
          const toMarker = getMarkerByName(line.to);

          if (fromMarker && toMarker) {
            const fromCoords = fromMarker.coords;
            const toCoords = toMarker.coords;

            return (
              <line
                key={index}
                x1={fromCoords[1]}
                y1={fromCoords[0]}
                x2={toCoords[1]}
                y2={toCoords[0]}
                stroke="#676767"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
            );
          }
          return null;
        })}

        {/* Render markers */}
        {markers.map((marker, index) => {
          const latitude = marker.coords[0]; // Using Latitude
          const longitude = marker.coords[1]; // Using Longitude

          return (
            <circle
              key={index}
              cx={longitude} // Using Longitude for cx
              cy={latitude} // Using Latitude for cy
              r="5"
              fill={marker.fill}
              stroke="#000"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      {hovered !== "None" && (
        <div
          style={{
            position: "absolute",
            background: "#007aff",
            color: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {hovered}
        </div>
      )}
    </div>
  );
};

export default LineStyleOrderMap;
