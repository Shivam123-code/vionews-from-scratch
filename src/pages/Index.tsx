import { Header } from "@/components/Header";
import { BreakingNews } from "@/components/BreakingNews";
import { FeaturedNews } from "@/components/FeaturedNews";
import { TrendingNews } from "@/components/TrendingNews";
import { NewsGrid } from "@/components/NewsGrid";
import { CategorySection } from "@/components/CategorySection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreakingNews />

      {/* Main content with sidebar */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <FeaturedNews />
          </div>
          <div className="lg:col-span-1">
            <TrendingNews />
          </div>
        </div>
      </div>

      <NewsGrid />
      <CategorySection />
      <Footer />
    </div>
  );
};

export default Index;
