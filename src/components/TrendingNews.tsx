import { Link } from "react-router-dom";
import { TrendingUp, Play, Loader2 } from "lucide-react";
import { useNews, NewsArticle } from "@/hooks/useNews";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingNews() {
  const { data: articles, isLoading } = useNews();

  const trendingStories = (articles || []).slice(0, 5).map((article, index) => ({
    ...article,
    number: String(index + 1).padStart(2, "0"),
  }));

  return (
    <aside className="space-y-6">
      {/* Live TV Widget */}
      <Link to="/live-tv" className="news-card p-4 block">
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
      </Link>

      {/* Trending Stories */}
      <div className="news-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : trendingStories.length > 0 ? (
            trendingStories.map((story) => (
              <a
                href={story.link || `/article/${story.slug}`}
                target={story.link ? "_blank" : "_self"}
                rel={story.link ? "noopener noreferrer" : undefined}
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
                    <span>{story.source || 'VioNews'}</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No trending stories available</p>
          )}
        </div>
      </div>
    </aside>
  );
}
