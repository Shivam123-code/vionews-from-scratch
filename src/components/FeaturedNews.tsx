import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import featuredImg from "@/assets/featured-news.jpg";
import { articles, getCategoryColor } from "@/data/articles";

export function FeaturedNews() {
  const sideNews = articles.slice(1, 6);
  const mainArticle = articles[0];

  return (
    <section>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Side stories */}
        <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
          {sideNews.map((news) => (
            <Link
              to={`/article/${news.slug}`}
              key={news.id}
              className="news-card group cursor-pointer block"
            >
              <div className="flex gap-4 p-3">
                <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`news-category-badge ${getCategoryColor(news.categorySlug)} text-white mb-2`}
                  >
                    {news.category}
                  </span>
                  <h3 className="news-headline text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {news.time}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Main featured story */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Link
            to={`/article/${mainArticle.slug}`}
            className="news-card group cursor-pointer block h-full"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[400px] overflow-hidden rounded-lg">
              <img
                src={featuredImg}
                alt="Featured news"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="news-category-badge bg-primary text-primary-foreground mb-3">
                  {mainArticle.category}
                </span>
                <h2 className="news-headline text-2xl md:text-3xl lg:text-4xl mb-3">
                  {mainArticle.title}
                </h2>
                <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 font-body">
                  {mainArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mainArticle.time}
                  </span>
                  <span>By {mainArticle.author}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
