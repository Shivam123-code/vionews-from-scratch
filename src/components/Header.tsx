import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "World", href: "/world" },
  { name: "Technology", href: "/technology" },
  { name: "Business", href: "/business" },
  { name: "Politics", href: "/politics" },
  { name: "Sports", href: "/sports" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: 'hsl(var(--header-bg))' }}>
      {/* Top bar */}
      <div className="container flex items-center justify-between py-4">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-2"
          style={{ color: 'hsl(var(--header-fg))' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-logo">
            <Zap className="h-6 w-6 md:h-7 md:w-7 fill-logo" />
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
            <span className="text-logo">Vio</span>
            <span style={{ color: 'hsl(var(--header-fg))' }}>News</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            className="p-2 rounded-full transition-colors"
            style={{ color: 'hsl(var(--header-fg) / 0.7)' }}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <a href="https://x.com/vionewsbusiness" target="_blank" rel="noopener noreferrer">
              Follow on 𝕏
            </a>
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
              className="w-full pl-12 pr-4 py-3 bg-background rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              autoFocus
            />
          </div>
        </form>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t" style={{ borderColor: 'hsl(var(--header-fg) / 0.1)' }}>
        <div className="container">
          <ul className="flex items-center gap-1 py-2 overflow-x-auto">
            <li>
              <Link
                to="/"
                className={`nav-link px-4 py-2 text-sm whitespace-nowrap ${location.pathname === '/' ? 'active' : ''}`}
              >
                Latest
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.href}
                  className={`nav-link px-4 py-2 text-sm whitespace-nowrap ${location.pathname === category.href ? 'active' : ''}`}
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
        <nav className="lg:hidden border-t" style={{ borderColor: 'hsl(var(--header-fg) / 0.1)', backgroundColor: 'hsl(var(--header-bg))' }}>
          <ul className="container py-4 space-y-1">
            <li>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg transition-colors"
                style={{ color: 'hsl(var(--header-fg) / 0.8)' }}
              >
                Latest
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg transition-colors"
                  style={{ color: 'hsl(var(--header-fg) / 0.8)' }}
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
