import { AlertCircle } from "lucide-react";
import { useNews } from "@/hooks/useNews";

export function BreakingNews() {
  const { data: articles } = useNews();

  // Use first 3 articles as breaking news or fallback to defaults
  const breakingHeadlines = articles?.slice(0, 3).map(a => a.title) || [
    "Loading latest breaking news...",
  ];

  return (
    <div className="breaking-news-bar">
      <div className="container flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">Breaking</span>
        </div>
        <div className="overflow-hidden relative flex-1">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...breakingHeadlines, ...breakingHeadlines].map((headline, index) => (
              <span key={index} className="mx-8 text-sm font-medium">
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
