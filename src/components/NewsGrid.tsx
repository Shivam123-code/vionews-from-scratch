import { Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  time: string;
  author: string;
  image: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Revolutionary space mission launches successfully from coastal facility",
    excerpt: "The groundbreaking mission marks a new era in space exploration with advanced technology.",
    category: "Science",
    categoryColor: "bg-news-tech",
    time: "2 hours ago",
    author: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Central bank announces major policy shift affecting global markets",
    excerpt: "Financial experts analyze the implications of the unexpected decision on investments.",
    category: "Business",
    categoryColor: "bg-news-business",
    time: "3 hours ago",
    author: "Michael Torres",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Award-winning director reveals plans for highly anticipated sequel",
    excerpt: "Fans celebrate as the beloved franchise confirms return with original cast.",
    category: "Entertainment",
    categoryColor: "bg-news-entertainment",
    time: "4 hours ago",
    author: "Emma Wilson",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "Historic sports event draws millions of viewers worldwide",
    excerpt: "The championship final delivers unforgettable moments and record-breaking performances.",
    category: "Sports",
    categoryColor: "bg-news-sports",
    time: "5 hours ago",
    author: "David Park",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    title: "Tech innovation promises to transform daily transportation",
    excerpt: "New sustainable technology could revolutionize how we commute in urban areas.",
    category: "Tech",
    categoryColor: "bg-news-tech",
    time: "6 hours ago",
    author: "Lisa Zhang",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    title: "International leaders address pressing global challenges at summit",
    excerpt: "Delegates from over 100 nations gather to discuss solutions for the future.",
    category: "World",
    categoryColor: "bg-news-world",
    time: "7 hours ago",
    author: "James Wright",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop",
  },
];

export function NewsGrid() {
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Latest Stories</h2>
        <a href="#" className="text-primary text-sm font-medium hover:underline">
          View All →
        </a>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article key={article.id} className="news-card group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <span className={`news-category-badge ${article.categoryColor} text-white mb-3`}>
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
          </article>
        ))}
      </div>
    </section>
  );
}
