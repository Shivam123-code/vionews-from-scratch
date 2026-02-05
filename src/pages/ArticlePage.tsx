import { useParams, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Clock, ArrowLeft, Share2, Bookmark, Facebook, Twitter, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { NewsArticle } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
 import { ArticleTopAd } from "@/components/ads/ArticleTopAd";

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
  const { toast } = useToast();

  const [fullContent, setFullContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate full content when article loads
  useEffect(() => {
    if (article && !hasGenerated) {
      generateFullArticle();
    }
  }, [article]);

  const generateFullArticle = async () => {
    if (!article || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          title: article.title,
          excerpt: article.excerpt,
          category: article.category,
          source: article.source || article.author,
        },
      });

      if (error) {
        console.error('Error generating article:', error);
        toast({
          title: "Could not generate full article",
          description: "Showing available content instead.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.content) {
        setFullContent(data.content);
      } else if (data?.error) {
        toast({
          title: "Generation failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
      setHasGenerated(true);
    }
  };

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

  // Use AI-generated content if available, otherwise fall back to excerpt
  const displayContent = fullContent || article.excerpt;
  const paragraphs = displayContent
    .split(/\n+/)
    .filter(p => p.trim())
    .map(p => p.trim());

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
         {/* Top Ad */}
         <ArticleTopAd />
 
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

            <h1 className="news-headline text-3xl md:text-4xl lg:text-5xl mb-6">
              {article.title}
            </h1>

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
                  <p className="text-sm text-muted-foreground">News Source</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.date}
                </span>
                <span>{article.time}</span>
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
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank')}
                className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors ml-auto">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>

            {/* Loading indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-muted rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating full article with AI...</span>
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 text-foreground/90 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* AI Generated Notice */}
            {fullContent && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  📰 This article was expanded by AI based on news from {article.source || 'news sources'}.
                </p>
              </div>
            )}

            {/* Back button */}
            <div className="mt-12 pt-8 border-t border-border">
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
