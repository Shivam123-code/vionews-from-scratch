import { Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";
import { useCategoryNews, NewsArticle } from "@/hooks/useNews";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryBlockProps {
  title: string;
  slug: string;
  color: string;
}

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

function CategoryBlock({ title, slug, color }: CategoryBlockProps) {
  const { data: articles, isLoading } = useCategoryNews(slug);

  const mainArticle = articles?.[0];
  const sideArticles = articles?.slice(1, 3) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 ${color} rounded-full`} />
          <h2 className="font-display text-xl font-bold">{title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="aspect-[4/3]" />
          <div className="space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!mainArticle) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-6 ${color} rounded-full`} />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Link
          to={`/category/${slug}`}
          className="ml-auto text-primary text-sm font-medium hover:underline"
        >
          More →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Main article */}
        <a
          href={mainArticle.link || `/article/${mainArticle.slug}`}
          target={mainArticle.link ? "_blank" : "_self"}
          rel={mainArticle.link ? "noopener noreferrer" : undefined}
          className="news-card group cursor-pointer block"
        >
          <div className="aspect-[4/3] overflow-hidden relative">
            <img
              src={mainArticle.image}
              alt={mainArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop";
              }}
            />
            {mainArticle.link && (
              <div className="absolute top-2 right-2 bg-black/50 p-1 rounded">
                <ExternalLink className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="news-headline text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {mainArticle.title}
            </h3>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {mainArticle.time}
            </div>
          </div>
        </a>

        {/* Side articles */}
        <div className="space-y-3">
          {sideArticles.map((article) => (
            <a
              href={article.link || `/article/${article.slug}`}
              target={article.link ? "_blank" : "_self"}
              rel={article.link ? "noopener noreferrer" : undefined}
              key={article.id}
              className="news-card group cursor-pointer block"
            >
              <div className="flex gap-4 p-3">
                <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-muted relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {article.time}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategorySection() {
  return (
    <section className="container py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <CategoryBlock
          title="World"
          slug="world"
          color="bg-news-world"
        />
        <CategoryBlock
          title="Business"
          slug="business"
          color="bg-news-business"
        />
      </div>
    </section>
  );
}
