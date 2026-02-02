import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Clock, Search, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { useSearchNews, NewsArticle } from "@/hooks/useNews";
import { Skeleton } from "@/components/ui/skeleton";

function getCategoryColor(categorySlug: string): string {
  const colors: Record<string, string> = {
    world: "bg-news-world",
    politics: "bg-news-world",
    business: "bg-news-business",
    entertainment: "bg-news-entertainment",
    sports: "bg-news-sports",
    tech: "bg-news-tech",
    technology: "bg-news-tech",
    science: "bg-news-tech",
  };
  return colors[categorySlug] || "bg-primary";
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const categoryColor = getCategoryColor(article.categorySlug);

  return (
    <a
      href={article.link || `/article/${article.slug}`}
      target={article.link ? "_blank" : "_self"}
      rel={article.link ? "noopener noreferrer" : undefined}
      className="news-card group cursor-pointer block"
    >
      <div className="flex gap-4 p-4">
        <div className="shrink-0 w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden bg-muted relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop";
            }}
          />
          {article.link && (
            <div className="absolute top-1 right-1 bg-black/50 p-1 rounded">
              <ExternalLink className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`news-category-badge ${categoryColor} text-white mb-2`}>
            {article.category}
          </span>
          <h3 className="news-headline text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2 hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{article.source || article.author}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.time}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function ArticleSkeleton() {
  return (
    <div className="news-card">
      <div className="flex gap-4 p-4">
        <Skeleton className="shrink-0 w-32 h-24 md:w-48 md:h-32 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full hidden sm:block" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  const { data: searchResults, isLoading, error } = useSearchNews(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Search</h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for news, topics, or sources..."
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </form>
        </div>

        {query && (
          <p className="text-muted-foreground mb-6">
            {isLoading ? (
              "Searching..."
            ) : error ? (
              "Error loading results"
            ) : (
              `${searchResults?.length || 0} result${(searchResults?.length || 0) !== 1 ? "s" : ""} for "${query}"`
            )}
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <ArticleSkeleton key={i} />
                ))}
              </div>
            ) : query ? (
              searchResults && searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-lg">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-display font-bold mb-2">No results found</h2>
                  <p className="text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-display font-bold mb-2">Search VioNews</h2>
                <p className="text-muted-foreground">
                  Enter keywords to find news articles from around the world
                </p>
              </div>
            )}
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
