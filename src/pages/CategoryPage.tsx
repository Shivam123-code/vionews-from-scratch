import { useParams, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { useCategoryNews, NewsArticle, categoryDisplayName } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const categoryMeta: Record<string, { color: string; title: string; description: string }> = {
  world: {
    color: "bg-news-world",
    title: "World News | VioNews",
    description: "Stay updated with the latest world news and international headlines on VioNews. Breaking stories from around the globe.",
  },
  technology: {
    color: "bg-news-tech",
    title: "Technology & AI News | VioNews",
    description: "Latest technology and AI news for 2025. Covering OpenAI, Google, startups, and the future of tech on VioNews.",
  },
  business: {
    color: "bg-news-business",
    title: "Business & Finance News | VioNews",
    description: "US and global business news, stock market updates, and financial headlines — updated daily on VioNews.",
  },
  politics: {
    color: "bg-news-politics",
    title: "Politics News | VioNews",
    description: "Latest US and world politics news. Congress, White House, elections and policy updates on VioNews.",
  },
  sports: {
    color: "bg-news-sports",
    title: "Sports News | VioNews",
    description: "Breaking sports news covering NFL, NBA, soccer, cricket and more. Live scores and updates on VioNews.",
  },
};

function getCategoryColor(categorySlug: string): string {
  return categoryMeta[categorySlug]?.color || "bg-primary";
}

const ARTICLES_PER_PAGE = 20;

function ArticleCard({ article }: { article: NewsArticle }) {
  const categoryColor = getCategoryColor(article.categorySlug);
  return (
    <Link to={`/${article.categorySlug}/${article.slug}`} className="news-card group cursor-pointer block">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          width={400}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop"; }}
        />
      </div>
      <div className="p-4">
        <span className={`news-category-badge ${categoryColor} text-white mb-3`}>{article.category}</span>
        <h3 className="news-headline text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.source || article.author}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.time}
          </span>
        </div>
      </div>
    </Link>
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
  const location = useLocation();
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const categorySlug = slug || location.pathname.replace('/', '');
  const displayName = categoryDisplayName[categorySlug] || categorySlug;
  const meta = categoryMeta[categorySlug];

  const { data: categoryArticles, isLoading, error } = useCategoryNews(categorySlug);

  useDocumentMeta({
    title: meta?.title || `${displayName} News | VioNews`,
    description: meta?.description || `Latest ${displayName.toLowerCase()} news on VioNews.`,
    canonical: `https://vionews.in/${categorySlug}`,
  });

  const totalArticles = categoryArticles?.length || 0;
  const visibleArticles = categoryArticles?.slice(0, visibleCount) || [];
  const hasMore = visibleCount < totalArticles;

  if (!meta && !slug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/"><Button>Return to Home</Button></Link>
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
        <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{displayName}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-8 ${meta?.color || 'bg-primary'} rounded-full`} />
            <h1 className="text-3xl md:text-4xl font-bold">{displayName} News</h1>
          </div>
          <p className="text-muted-foreground">
            {meta?.description || `Latest ${displayName.toLowerCase()} news`}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-card rounded-lg">
                <p className="text-muted-foreground">Failed to load articles. Please try again later.</p>
              </div>
            ) : totalArticles > 0 ? (
              <>
                {/* Article count */}
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {visibleArticles.length} of {totalArticles} articles
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {visibleArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + ARTICLES_PER_PAGE)}
                    >
                      Load More Articles
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                <p className="text-muted-foreground">No articles found in this category.</p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <TrendingNews />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
