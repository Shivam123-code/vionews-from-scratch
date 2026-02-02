import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { articles, getCategoryColor } from "@/data/articles";

export function NewsGrid() {
  const gridArticles = articles.slice(6, 12);

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Latest Stories</h2>
        <Link to="/category/world" className="text-primary text-sm font-medium hover:underline">
          View All →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridArticles.map((article) => (
          <Link
            to={`/article/${article.slug}`}
            key={article.id}
            className="news-card group cursor-pointer block"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
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
                <span>{article.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.time}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
