import React, { useEffect, useState } from "react";
import { VectorMap } from "@south-paw/react-vector-maps";
import World from "@data/world-map.json";

// Define a type for the marker values
type MarkerValue = 0 | 1 | 2;
type MarkerData = { coords: [number, number]; value: MarkerValue };
const dataMarkers: MarkerData[] = [
  { coords: [101.7069, 252.6043], value: 0 },
  { coords: [132.7069, 150.6043], value: 1 },
  { coords: [280.235, 230.9253], value: 2 },
  { coords: [220.8025, 360.8206], value: 0 },
  { coords: [205.864, 498.643], value: 1 },
  { coords: [140.8617, 478.1954], value: 2 },
];

const markerStyles: Record<MarkerValue, string> = {
  0: "#ffc371",
  1: "#c79efd",
  2: "#c79efd",
};

const legendItems = [
  { color: markerStyles[0], label: "mScale1" },
  { color: markerStyles[1], label: "mScale2" },
];

const BasicVectorMapWithMarkers: React.FC = () => {
  const [hovered, setHovered] = React.useState<string>("None");
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const zoom: number = 1;
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

  // Marker hover events
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
        top: event.clientY - 400,
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

  return (
    <div style={{ position: "relative", display: "flex", gap: "10px" }}>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: isDarkMode ? "#1e293b" : "white",
          padding: "1rem",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p style={{ margin: 0 }}>Somthing (marker)</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {legendItems.map((item, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "0.5rem 0",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: item.color,
                  marginRight: "0.5rem",
                }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <svg
        style={{ width: "100%", height: "384px", transformOrigin: "center" }}
      >
        <VectorMap
          {...World}
          layerProps={layerProps}
          style={{
            fill: isDarkMode ? "#1e293b" : "#f3f4f6",
            stroke: isDarkMode ? "#0f172a" : "#fff",
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            height: "384px",
            width: "100%",
          }}
        />
        {dataMarkers.map((marker, index) => (
          <circle
            key={index}
            cx={marker.coords[1]}
            cy={marker.coords[0]}
            r={5}
            fill={markerStyles[dataMarkers[index].value]}
          />
        ))}
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

export default BasicVectorMapWithMarkers;
