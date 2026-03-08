// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import AdminLogin from "./pages/AdminLogin";
import AdminCallback from "./pages/AdminCallback";
import AdminDashboard from "./pages/AdminDashboard";
import ArticleForm from "./pages/ArticleForm";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import DisclaimerPage from "./pages/DisclaimerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Category pages */}
          <Route path="/world" element={<CategoryPage />} />
          <Route path="/technology" element={<CategoryPage />} />
          <Route path="/business" element={<CategoryPage />} />
          <Route path="/politics" element={<CategoryPage />} />
          <Route path="/sports" element={<CategoryPage />} />
          {/* Static pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          {/* Search */}
          <Route path="/search" element={<SearchPage />} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/callback" element={<AdminCallback />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/articles/new" element={<ArticleForm />} />
          <Route path="/admin/articles/:id/edit" element={<ArticleForm />} />
          {/* Legacy redirects */}
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          {/* Article: /:category/:slug */}
          <Route path="/:category/:slug" element={<ArticlePage />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
