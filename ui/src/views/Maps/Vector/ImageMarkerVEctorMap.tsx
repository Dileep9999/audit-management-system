import React, { useEffect, useState } from "react";
import { VectorMap } from "@south-paw/react-vector-maps";
import World from "@data/world-map.json";

const ImageMarkerMap: React.FC = () => {
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

  // Define layerProps with correct event types for SVG elements
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
        top: event.clientY - 200,
        left: event.clientX - 900,
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

  // Image markers with their coordinates
  const imageMarkers = [
    {
      name: "Egypt",
      coords: { cx: "550", cy: "300" },
      image: "https://images.kcubeinfotech.com/domiex/images/others/pin.png",
    },
    {
      name: "United States",
      coords: { cx: "200", cy: "200" },
      image: "https://images.kcubeinfotech.com/domiex/images/others/pin.png",
    },
    {
      name: "United Kingdom",
      coords: { cx: "400", cy: "150" },
      image: "https://images.kcubeinfotech.com/domiex/images/others/pin.png",
    },
  ];

  return (
    <div style={{ position: "relative", display: "flex", gap: "10px" }}>
      <svg
        style={{ width: "100%", height: "384px", transformOrigin: "center" }}
      >
        <VectorMap
          {...World}
          layerProps={layerProps}
          style={{
            fill: isDarkMode ? "#1e293b" : "#f3f4f6",
            stroke: isDarkMode ? "#0f172a" : "#fff",
          }}
        />

        {imageMarkers.map((marker, index) => (
          <image
            key={index}
            xlinkHref={marker.image}
            x={marker.coords.cx}
            y={marker.coords.cy}
            width="20"
            height="20"
            style={{ pointerEvents: "none" }}
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

export default ImageMarkerMap;
