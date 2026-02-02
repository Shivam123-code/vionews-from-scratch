import { useParams, Link } from "react-router-dom";
import { Clock, ArrowLeft, Share2, Bookmark, Facebook, Twitter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingNews } from "@/components/TrendingNews";
import { getArticleBySlug, getArticlesByCategory, getCategoryColor, Article } from "@/data/articles";
import { Button } from "@/components/ui/button";

function RelatedArticle({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="news-card group cursor-pointer">
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
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = getArticlesByCategory(article.categorySlug)
    .filter((a) => a.id !== article.id)
    .slice(0, 4);

  const categoryColor = getCategoryColor(article.categorySlug);

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
                    {article.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{article.author}</p>
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
              {article.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="font-display text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedArticles.map((related) => (
                    <RelatedArticle key={related.id} article={related} />
                  ))}
                </div>
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
