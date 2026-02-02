import { Clock } from "lucide-react";

interface CategoryArticle {
  id: string;
  title: string;
  time: string;
  image: string;
}

interface CategorySectionProps {
  title: string;
  color: string;
  articles: CategoryArticle[];
}

const worldNews: CategoryArticle[] = [
  {
    id: "w1",
    title: "Peace negotiations reach critical phase in ongoing regional conflict",
    time: "1 hour ago",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop",
  },
  {
    id: "w2",
    title: "Trade agreement signed between major economic powers",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=300&fit=crop",
  },
  {
    id: "w3",
    title: "Historic preservation efforts save endangered cultural site",
    time: "3 hours ago",
    image: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=400&h=300&fit=crop",
  },
];

const businessNews: CategoryArticle[] = [
  {
    id: "b1",
    title: "Startup valued at billions following latest funding round",
    time: "30 min ago",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
  },
  {
    id: "b2",
    title: "Retail sector shows strong recovery in quarterly report",
    time: "1 hour ago",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  },
  {
    id: "b3",
    title: "Energy prices stabilize after period of volatility",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
  },
];

function CategoryBlock({ title, color, articles }: CategorySectionProps) {
  const mainArticle = articles[0];
  const sideArticles = articles.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-6 ${color} rounded-full`} />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <a href="#" className="ml-auto text-primary text-sm font-medium hover:underline">
          More →
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Main article */}
        <article className="news-card group cursor-pointer">
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
        </article>

        {/* Side articles */}
        <div className="space-y-3">
          {sideArticles.map((article) => (
            <article key={article.id} className="news-card group cursor-pointer">
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
            </article>
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
          color="bg-news-world"
          articles={worldNews}
        />
        <CategoryBlock
          title="Business"
          color="bg-news-business"
          articles={businessNews}
        />
      </div>
    </section>
  );
}
