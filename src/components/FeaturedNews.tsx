import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import featuredImg from "@/assets/featured-news.jpg";
import { useFeaturedNews, NewsArticle } from "@/hooks/useNews";
import { Skeleton } from "@/components/ui/skeleton";

function getCategoryColor(categorySlug: string): string {
  const colors: Record<string, string> = {
    world: "bg-news-world",
    politics: "bg-news-politics",
    business: "bg-news-business",
    sports: "bg-news-sports",
    technology: "bg-news-tech",
  };
  return colors[categorySlug] || "bg-primary";
}

function SideStoryCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/${article.categorySlug}/${article.slug}`}
      className="news-card group cursor-pointer block"
    >
      <div className="flex gap-4 p-3">
        <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            width={96}
            height={80}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={`news-category-badge ${getCategoryColor(article.categorySlug)} text-white mb-2`}
          >
            {article.category}
          </span>
          <h3 className="news-headline text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {article.time}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SideStorySkeleton() {
  return (
    <div className="flex gap-4 p-3">
      <Skeleton className="shrink-0 w-24 h-20 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function FeaturedNews() {
  const { data: articles, isLoading, error } = useFeaturedNews();

  if (isLoading) {
    return (
      <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-1 lg:col-span-1 order-2 md:order-1 space-y-3 md:space-y-4">
            {[...Array(5)].map((_, i) => (
              <SideStorySkeleton key={i} />
            ))}
          </div>
          <div className="md:col-span-1 lg:col-span-2 order-1 md:order-2">
            <Skeleton className="aspect-[16/9] md:aspect-[16/10] lg:aspect-auto lg:h-full min-h-[220px] md:min-h-[300px] lg:min-h-[400px] rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !articles?.length) {
    return (
      <section>
        <div className="text-center py-16 bg-card rounded-lg">
          <p className="text-muted-foreground">Unable to load news. Please try again later.</p>
        </div>
      </section>
    );
  }

  const mainArticle = articles[0];
  const sideNews = articles.slice(1, 6);

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main featured story — shows first on mobile */}
        <div className="md:col-span-1 lg:col-span-2 order-1 md:order-2 lg:order-2">
          <Link
            to={`/${mainArticle.categorySlug}/${mainArticle.slug}`}
            className="news-card group cursor-pointer block h-full"
          >
            <div className="relative aspect-[16/9] md:aspect-[16/10] lg:aspect-auto lg:h-full min-h-[220px] md:min-h-[300px] lg:min-h-[400px] overflow-hidden rounded-lg">
              <img
                src={mainArticle.image || featuredImg}
                alt={mainArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = featuredImg;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                <span className="news-category-badge bg-primary text-primary-foreground mb-2 md:mb-3">
                  {mainArticle.category}
                </span>
                <h1 className="news-headline text-lg sm:text-xl md:text-3xl lg:text-4xl mb-1 md:mb-3">
                  {mainArticle.title}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base line-clamp-2 mb-2 md:mb-4 hidden sm:block">
                  {mainArticle.excerpt}
                </p>
                <div className="flex items-center gap-3 md:gap-4 text-xs sm:text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    {mainArticle.time}
                  </span>
                  <span className="hidden sm:inline">By {mainArticle.source || mainArticle.author}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Side stories */}
        <div className="md:col-span-1 lg:col-span-1 order-2 md:order-1 lg:order-1 space-y-2 md:space-y-4">
          {sideNews.map((news) => (
            <SideStoryCard key={news.id} article={news} />
          ))}
        </div>
      </div>
    </section>
  );
}
