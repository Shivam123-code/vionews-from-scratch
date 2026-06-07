import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top (0, 0) whenever the route pathname changes.
 * This fixes the React SPA issue where navigating between pages preserves the
 * previous scroll position, causing users to land mid-page or at the footer.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
