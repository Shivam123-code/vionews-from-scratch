import { useEffect, useRef } from "react";

export function BreakingNewsAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pl28652047.effectivegatecpm.com/723691cc071f8171a6b370218d78974c/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="container py-2">
      <div ref={containerRef}>
        <div id="container-723691cc071f8171a6b370218d78974c"></div>
      </div>
    </div>
  );
}
