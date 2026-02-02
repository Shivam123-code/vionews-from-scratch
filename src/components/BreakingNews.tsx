import { AlertCircle } from "lucide-react";

const breakingHeadlines = [
  "BREAKING: Major diplomatic talks underway between global leaders",
  "ALERT: Stock markets surge after economic policy announcement",
  "UPDATE: Historic climate agreement reached at international summit",
];

export function BreakingNews() {
  return (
    <div className="breaking-news-bar">
      <div className="container flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4" />
          <span className="font-bold text-sm uppercase tracking-wider">Breaking</span>
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
