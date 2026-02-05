 import { useEffect } from "react";
 
 export function FooterAd() {
   useEffect(() => {
     const script = document.createElement("script");
     script.src = "https://pl28652020.effectivegatecpm.com/b8/c5/4c/b8c54c0e3e48904f7d665e75071ca5b3.js";
     script.async = true;
     document.body.appendChild(script);
 
     return () => {
       document.body.removeChild(script);
     };
   }, []);
 
   return null;
 }