import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
 import { HeaderAd } from "@/components/ads/HeaderAd";

const categories = [
  { name: "Latest", href: "/" },
  { name: "World", href: "/category/world" },
  { name: "Business", href: "/category/business" },
  { name: "Entertainment", href: "/category/entertainment" },
  { name: "Sports", href: "/category/sports" },
  { name: "Science", href: "/category/science" },
  { name: "Technology", href: "/category/tech" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top bar */}
      <div className="container flex items-center justify-between py-4">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">V</span>
            </div>
            <span className="font-display text-2xl md:text-3xl font-bold ml-2 tracking-tight">
              <span className="text-primary">VIO</span>
              <span className="text-foreground">NEWS</span>
            </span>
          </div>
        </Link>

         {/* Header Ad - between logo and search */}
         <HeaderAd />
 
        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Button size="sm" className="hidden sm:inline-flex">
            Subscribe
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <form onSubmit={handleSearch} className="container pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </form>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t border-border">
        <div className="container">
          <ul className="flex items-center gap-1 py-2 overflow-x-auto">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.href}
                  className="nav-link px-4 py-2 text-sm whitespace-nowrap"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-card">
          <ul className="container py-4 space-y-1">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
