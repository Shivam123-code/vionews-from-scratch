import { useParams, Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { useCategoryNews, NewsArticle } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { name: "World", slug: "world", color: "bg-news-world" },
  { name: "Politics", slug: "politics", color: "bg-news-world" },
  { name: "Business", slug: "business", color: "bg-news-business" },
  { name: "Entertainment", slug: "entertainment", color: "bg-news-entertainment" },
  { name: "Sports", slug: "sports", color: "bg-news-sports" },
  { name: "Tech", slug: "tech", color: "bg-news-tech" },
  { name: "Technology", slug: "technology", color: "bg-news-tech" },
  { name: "Science", slug: "science", color: "bg-news-tech" },
];

function getCategoryColor(categorySlug: string): string {
  const category = categories.find((c) => c.slug === categorySlug);
  return category?.color || "bg-primary";
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

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const { data: categoryArticles, isLoading, error } = useCategoryNews(slug || "world");

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
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ArticleSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-card rounded-lg">
                <p className="text-muted-foreground">Failed to load articles. Please try again later.</p>
              </div>
            ) : categoryArticles && categoryArticles.length > 0 ? (
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
