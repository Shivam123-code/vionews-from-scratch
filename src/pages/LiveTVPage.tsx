import { Play, Volume2, Maximize, Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { Link } from "react-router-dom";
import { articles } from "@/data/articles";

export default function LiveTVPage() {
  const latestNews = articles.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Live TV</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-3 h-3 bg-news-live rounded-full animate-pulse-dot" />
          <h1 className="font-display text-3xl md:text-4xl font-bold">Live TV</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video bg-foreground rounded-lg overflow-hidden group">
              {/* Placeholder for video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  <p className="text-white text-lg font-medium">VioNews Live Stream</p>
                  <p className="text-white/60 text-sm">Click to play</p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Play className="h-5 w-5" fill="currentColor" />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <span className="text-sm">LIVE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Settings className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-news-live text-white px-3 py-1 rounded-md text-sm font-medium">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Program Info */}
            <div className="news-card p-6">
              <h2 className="font-display text-xl font-bold mb-2">VioNews Prime Time</h2>
              <p className="text-muted-foreground mb-4">
                Your comprehensive evening news broadcast covering the day's top stories from around the world.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Currently Airing</span>
                <span>•</span>
                <span>HD Quality</span>
                <span>•</span>
                <span>English</span>
              </div>
            </div>

            {/* Latest Headlines */}
            <div className="news-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Latest Headlines</h2>
              <div className="space-y-4">
                {latestNews.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="flex items-start gap-4 group"
                  >
                    <span className="font-display text-2xl font-bold text-primary/30 group-hover:text-primary transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{article.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <TrendingNews />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
