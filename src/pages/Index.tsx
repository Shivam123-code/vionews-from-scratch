import { Link } from "react-router-dom";
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

      {/* Admin login button */}
      <Link
        to="/admin/login"
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        A
      </Link>
    </div>
  );
};

export default Index;
