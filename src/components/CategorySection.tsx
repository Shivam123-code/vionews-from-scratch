import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { getArticlesByCategory, getCategoryColor, Article } from "@/data/articles";

interface CategorySectionProps {
  title: string;
  slug: string;
  color: string;
  articles: Article[];
}

function CategoryBlock({ title, slug, color, articles }: CategorySectionProps) {
  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 3);

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
        <Link
          to={`/article/${mainArticle.slug}`}
          className="news-card group cursor-pointer block"
        >
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={mainArticle.image}
              alt={mainArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
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
        </Link>

        {/* Side articles */}
        <div className="space-y-3">
          {sideArticles.map((article) => (
            <Link
              to={`/article/${article.slug}`}
              key={article.id}
              className="news-card group cursor-pointer block"
            >
              <div className="flex gap-4 p-3">
                <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategorySection() {
  const worldNews = getArticlesByCategory("world");
  const businessNews = getArticlesByCategory("business");

  return (
    <section className="container py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <CategoryBlock
          title="World"
          slug="world"
          color="bg-news-world"
          articles={worldNews}
        />
        <CategoryBlock
          title="Business"
          slug="business"
          color="bg-news-business"
          articles={businessNews}
        />
      </div>
    </section>
  );
}
