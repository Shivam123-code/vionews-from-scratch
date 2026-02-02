import { Clock } from "lucide-react";
import featuredImg from "@/assets/featured-news.jpg";

interface NewsItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  time: string;
  image: string;
}

const sideNews: NewsItem[] = [
  {
    id: "1",
    title: "Global leaders convene for historic climate summit in Geneva",
    category: "World",
    categoryColor: "bg-news-world",
    time: "1 hour ago",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=200&h=150&fit=crop",
  },
  {
    id: "2",
    title: "Tech giants announce breakthrough in renewable energy storage",
    category: "Tech",
    categoryColor: "bg-news-tech",
    time: "2 hours ago",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=150&fit=crop",
  },
  {
    id: "3",
    title: "Stock markets rally as inflation shows signs of cooling",
    category: "Business",
    categoryColor: "bg-news-business",
    time: "3 hours ago",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=150&fit=crop",
  },
  {
    id: "4",
    title: "Upcoming blockbuster film breaks pre-sale ticket records",
    category: "Entertainment",
    categoryColor: "bg-news-entertainment",
    time: "4 hours ago",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=150&fit=crop",
  },
  {
    id: "5",
    title: "National team advances to championship finals after thriller",
    category: "Sports",
    categoryColor: "bg-news-sports",
    time: "5 hours ago",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=150&fit=crop",
  },
];

export function FeaturedNews() {
  return (
    <section>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Side stories */}
        <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
          {sideNews.map((news) => (
            <article key={news.id} className="news-card group cursor-pointer">
              <div className="flex gap-4 p-3">
                <div className="shrink-0 w-24 h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=150&fit=crop";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`news-category-badge ${news.categoryColor} text-white mb-2`}>
                    {news.category}
                  </span>
                  <h3 className="news-headline text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {news.time}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Main featured story */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <article className="news-card group cursor-pointer h-full">
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[400px] overflow-hidden rounded-lg">
              <img
                src={featuredImg}
                alt="Featured news"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="news-category-badge bg-primary text-primary-foreground mb-3">
                  World
                </span>
                <h2 className="news-headline text-2xl md:text-3xl lg:text-4xl mb-3">
                  Historic diplomatic meeting sets new course for international relations
                </h2>
                <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 font-body">
                  World leaders gathered today for what is being called the most significant diplomatic summit in decades, addressing key global challenges and forging new partnerships.
                </p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    1 hour ago
                  </span>
                  <span>By John Smith</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
