import { TrendingUp, Play } from "lucide-react";

const trendingStories = [
  {
    id: "1",
    number: "01",
    title: "Scientists discover high-speed particles at record energy levels",
    category: "Science",
    views: "124K",
  },
  {
    id: "2",
    number: "02",
    title: "New economic policy sparks debate among financial experts",
    category: "Business",
    views: "98K",
  },
  {
    id: "3",
    number: "03",
    title: "Viral video captures rare wildlife moment in national park",
    category: "Trending",
    views: "87K",
  },
  {
    id: "4",
    number: "04",
    title: "Major tech company announces plans for sustainable operations",
    category: "Tech",
    views: "76K",
  },
  {
    id: "5",
    number: "05",
    title: "Championship game draws record television viewership",
    category: "Sports",
    views: "65K",
  },
];

export function TrendingNews() {
  return (
    <aside className="space-y-6">
      {/* Live TV Widget */}
      <div className="news-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-news-live rounded-full animate-pulse-dot" />
          <h3 className="font-display font-bold text-lg">Live TV</h3>
        </div>
        <div className="relative aspect-video bg-foreground rounded-lg overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm font-medium">Watch VioNews Live</p>
          </div>
        </div>
      </div>

      {/* Trending Stories */}
      <div className="news-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {trendingStories.map((story) => (
            <article
              key={story.id}
              className="flex gap-3 group cursor-pointer"
            >
              <span className="font-display text-2xl font-bold text-primary/30 group-hover:text-primary transition-colors">
                {story.number}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {story.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{story.category}</span>
                  <span>•</span>
                  <span>{story.views} views</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}
