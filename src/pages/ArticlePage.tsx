import { useParams, useLocation, Link } from "react-router-dom";
import { Clock, ArrowLeft, Share2, Bookmark, Facebook, Twitter, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { NewsArticle } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";

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

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const article = location.state?.article as NewsArticle | undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has expired.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryColor = getCategoryColor(article.categorySlug);

  // Format content - split by sentences for better readability
  const formatContent = (content: string) => {
    if (content === "ONLY AVAILABLE IN PAID PLANS") {
      return article.excerpt;
    }
    return content;
  };

  const displayContent = formatContent(article.content || article.excerpt);

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
          <Link
            to={`/category/${article.categorySlug}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {article.category}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <article className="lg:col-span-2">
            <Link
              to={`/category/${article.categorySlug}`}
              className={`news-category-badge ${categoryColor} text-white mb-4 inline-block`}
            >
              {article.category}
            </Link>

            <h1 className="news-headline text-3xl md:text-4xl lg:text-5xl mb-4">
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>

            {/* Author and Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-display font-bold text-primary">
                    {(article.source || article.author).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{article.source || article.author}</p>
                  <p className="text-sm text-muted-foreground">{article.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.date}
                </span>
                <span>{article.views} views</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop";
                }}
              />
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-medium">Share:</span>
              <button className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                <Facebook className="h-4 w-4" />
              </button>
              <button className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors ml-auto">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              {displayContent.split("\n").filter(p => p.trim()).map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Source Link */}
            {article.link && (
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Original source:</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  Read full article on {article.source || 'original source'}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Back button */}
            <div className="mt-8">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </article>

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
