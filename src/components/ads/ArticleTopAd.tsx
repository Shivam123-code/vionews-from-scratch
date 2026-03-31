import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

export function ArticleTopAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.atOptions = {
      key: "930ef2b327d517141f0a4fe7c7e6e7a6",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };

    const script = document.createElement("script");
    script.src = "https://www.highperformanceformat.com/930ef2b327d517141f0a4fe7c7e6e7a6/invoke.js";
    script.async = true;

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
    <div className="flex justify-center py-4">
      <div ref={containerRef} className="max-w-full overflow-hidden" />
    </div>
  );
}
