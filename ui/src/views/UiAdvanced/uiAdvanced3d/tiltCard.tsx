import React, { useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";

interface TiltCardProps {
  options?: any;
  className?: string;
  children?: React.ReactNode;
}
const TiltCard: React.FC<TiltCardProps> = ({
  options,
  className = "",
  children,
}) => {
  const tiltRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentTiltRef = tiltRef.current;

    if (currentTiltRef) {
      VanillaTilt.init(currentTiltRef, options);
    }

    return () => {
      if (currentTiltRef) {
        (currentTiltRef as any).vanillaTilt.destroy();
      }
    };
  }, [options]);

  return (
    <React.Fragment>
      <div
        className={`mx-auto shadow-lg size-56 sm:size-64 md:size-80 ${className}`}
        ref={tiltRef}
      >
        {children}
      </div>
    </React.Fragment>
  );
};

export default TiltCard;
