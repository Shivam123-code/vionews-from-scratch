import { Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";
import { useNews, NewsArticle } from "@/hooks/useNews";
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
  return (
    <a
      href={article.link || `/article/${article.slug}`}
      target={article.link ? "_blank" : "_self"}
      rel={article.link ? "noopener noreferrer" : undefined}
      className="news-card group cursor-pointer block"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
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
          <div className="absolute top-2 right-2 bg-black/50 p-1 rounded">
            <ExternalLink className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <span
          className={`news-category-badge ${getCategoryColor(article.categorySlug)} text-white mb-3`}
        >
          {article.category}
        </span>
        <h3 className="news-headline text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 font-body">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.source || article.author}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.time}
          </span>
        </div>
      </div>
    </a>
  );
}

function ArticleSkeleton() {
  return (
    <div className="news-card">
      <Skeleton className="aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function NewsGrid() {
  const { data: articles, isLoading, error } = useNews();

  const gridArticles = (articles || []).slice(6, 12);

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Latest Stories</h2>
        <Link to="/category/world" className="text-primary text-sm font-medium hover:underline">
          View All →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)
        ) : gridArticles.length > 0 ? (
          gridArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No articles available
          </div>
        )}
      </div>
    </section>
  );
}
