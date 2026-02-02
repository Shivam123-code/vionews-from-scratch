import { useParams, Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { getArticlesByCategory, getCategoryColor, categories, Article } from "@/data/articles";
import { Button } from "@/components/ui/button";

function ArticleCard({ article }: { article: Article }) {
  const categoryColor = getCategoryColor(article.categorySlug);
  
  return (
    <Link to={`/article/${article.slug}`} className="news-card group cursor-pointer">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <span className={`news-category-badge ${categoryColor} text-white mb-3`}>
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
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const categoryArticles = getArticlesByCategory(slug || "");

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 ${category.color} rounded-full`} />
            <h1 className="font-display text-3xl md:text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Latest news and updates from {category.name.toLowerCase()}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-2">
            {categoryArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {categoryArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <p className="text-muted-foreground">No articles found in this category.</p>
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
