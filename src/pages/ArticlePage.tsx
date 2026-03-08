import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Clock, ArrowLeft, Share2, Facebook, Twitter, Loader2, MessageCircle, Copy, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { NewsArticle, fetchViaProxy, fetchViaEdgeFunction, readFromCache, getFallbackArticles, transformArticle, categoryDisplayName, useCategoryNews } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentMeta, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/hooks/useDocumentMeta";

function getCategoryColor(categorySlug: string): string {
  const colors: Record<string, string> = {
    world: "bg-news-world",
    politics: "bg-news-politics",
    business: "bg-news-business",
    sports: "bg-news-sports",
    technology: "bg-news-tech",
  };
  return colors[categorySlug] || "bg-primary";
}

export default function ArticlePage() {
  const { slug, category } = useParams<{ slug: string; category?: string }>();
  const location = useLocation();
  const stateArticle = location.state?.article as NewsArticle | undefined;
  const [copied, setCopied] = useState(false);

  const [article, setArticle] = useState<NewsArticle | undefined>(stateArticle);
  const [isLoadingArticle, setIsLoadingArticle] = useState(!stateArticle);
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Related articles
  const { data: relatedArticles } = useCategoryNews(article?.categorySlug || category || 'world');
  const related = (relatedArticles || []).filter(a => a.id !== article?.id).slice(0, 3);

  // SEO meta
  const seoMeta = useMemo(() => {
    if (!article) return null;
    const catName = categoryDisplayName[article.categorySlug] || article.category;
    const canonical = `https://vionews.in/${article.categorySlug}/${article.slug}`;
    return {
      title: `${article.title} | VioNews`,
      description: article.excerpt?.slice(0, 155) || article.title,
      canonical,
      ogType: "article" as const,
      ogImage: article.image,
      jsonLd: [
        buildArticleJsonLd({
          title: article.title,
          seoTitle: article.title,
          description: article.excerpt || article.title,
          image: article.image,
          publishedAt: article.date,
          categorySlug: article.categorySlug,
          slug: article.slug,
        }),
        buildBreadcrumbJsonLd([
          { name: "Home", url: "https://vionews.in" },
          { name: catName, url: `https://vionews.in/${article.categorySlug}` },
          { name: article.title },
        ]),
      ],
    };
  }, [article]);

  useDocumentMeta(seoMeta || {
    title: "Article | VioNews",
    description: "Read the latest news on VioNews.",
    canonical: `https://vionews.in/${category || ""}/${slug || ""}`,
  });

  // Fetch article from DB when accessed via direct link
  useEffect(() => {
    if (stateArticle) return;
    if (!slug) return;

    const fetchArticle = async () => {
      setIsLoadingArticle(true);
      const findBySlug = (articles: NewsArticle[]) => articles.find(a => a.slug === slug);

      try {
        const articles = await fetchViaProxy(undefined, slug.replace(/-/g, ' '));
        const match = findBySlug(articles) || articles[0];
        if (match) { setArticle(match); setIsLoadingArticle(false); return; }
      } catch { /* continue */ }

      try {
        const articles = await fetchViaEdgeFunction(undefined, slug.replace(/-/g, ' '));
        const match = findBySlug(articles) || articles[0];
        if (match) { setArticle(match); setIsLoadingArticle(false); return; }
      } catch { /* continue */ }

      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (data && !error) {
          setArticle(transformArticle(data));
          setIsLoadingArticle(false);
          return;
        }
      } catch { /* continue */ }

      const allCacheKeys = ['vionews:all:', 'vionews:world:', 'vionews:business:', 'vionews:sports:', 'vionews:technology:', 'vionews:politics:'];
      for (const key of allCacheKeys) {
        const cached = readFromCache(key);
        if (cached) {
          const match = findBySlug(cached);
          if (match) { setArticle(match); setIsLoadingArticle(false); return; }
        }
      }

      const fallbackMatch = findBySlug(getFallbackArticles());
      if (fallbackMatch) { setArticle(fallbackMatch); setIsLoadingArticle(false); return; }

      setIsLoadingArticle(false);
    };

    fetchArticle();
  }, [slug, stateArticle]);

  const hasRealContent = (content: string | undefined | null): boolean => {
    if (!content) return false;
    const placeholder = content.trim().toLowerCase();
    return !placeholder.includes('only available in paid plan') &&
           !placeholder.includes('available in paid plan') &&
           placeholder.length > 50;
  };

  useEffect(() => {
    if (article && !hasGenerated && !hasRealContent(article.content)) {
      generateFullArticle();
    } else if (article && hasRealContent(article.content)) {
      setHasGenerated(true);
    }
  }, [article]);

  const generateFullArticle = async () => {
    if (!article || isGenerating) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: {
          title: article.title,
          excerpt: article.excerpt,
          category: article.category,
          source: article.source || article.author,
        },
      });
      if (!error && data?.success && data?.content) {
        setFullContent(data.content);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsGenerating(false);
      setHasGenerated(true);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has expired.</p>
          <Link to="/"><Button>Return to Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryColor = getCategoryColor(article.categorySlug);
  const displayContent = (hasRealContent(article.content) ? article.content : null) || fullContent || article.excerpt;
  const paragraphs = displayContent.split(/\n+/).filter((p) => p.trim()).map((p) => p.trim());

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link to={`/${article.categorySlug}`} className="text-muted-foreground hover:text-foreground transition-colors">
            {categoryDisplayName[article.categorySlug] || article.category}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <Link to={`/${article.categorySlug}`} className={`news-category-badge ${categoryColor} text-white mb-4 inline-block`}>
              {article.category}
            </Link>

            <h1 className="news-headline text-3xl md:text-4xl lg:text-5xl mb-6">{article.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">V</span>
                </div>
                <div>
                  <p className="font-medium">VioNews Staff</p>
                  <p className="text-sm text-muted-foreground">{article.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.time}
                </span>
              </div>
            </div>

            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img
                src={article.image}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop";
                }}
              />
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-medium">Share:</span>
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, "_blank")} className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors" aria-label="Share on Facebook">
                <Facebook className="h-4 w-4" />
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`, "_blank")} className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors" aria-label="Share on Twitter">
                <Twitter className="h-4 w-4" />
              </button>
              <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`, "_blank")} className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors" aria-label="Share on WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button onClick={handleCopyLink} className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors" aria-label="Copy link">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {isGenerating && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-muted rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading full article...</span>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 text-foreground/90 leading-relaxed text-lg">{paragraph}</p>
              ))}
            </div>

            {related.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {related.map((rel) => (
                    <Link key={rel.id} to={`/${rel.categorySlug}/${rel.slug}`} className="news-card group block">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={rel.image} alt={rel.title} loading="lazy" width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=600&fit=crop"; }} />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{rel.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{rel.time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-border">
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-1">
            <TrendingNews />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
