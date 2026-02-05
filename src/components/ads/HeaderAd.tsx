 import { useEffect, useRef } from "react";
 
 export function HeaderAd() {
   const containerRef = useRef<HTMLDivElement>(null);
 
   useEffect(() => {
     const script = document.createElement("script");
     script.src = "https://pl28652020.effectivegatecpm.com/b8/c5/4c/b8c54c0e3e48904f7d665e75071ca5b3.js";
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
     <div ref={containerRef} className="hidden md:flex flex-1 justify-center items-center mx-4" />
   );
 }