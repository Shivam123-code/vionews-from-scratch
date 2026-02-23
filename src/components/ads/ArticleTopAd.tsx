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
  // Ads disabled
  return null;
}