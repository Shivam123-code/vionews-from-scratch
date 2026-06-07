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
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: 'hsl(var(--header-bg))' }}>
      {/* Top bar */}
      <div className="container flex items-center justify-between py-3 md:py-4 gap-2">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors"
          style={{ color: 'hsl(var(--header-fg))' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 shrink-0" onClick={closeMobileMenu}>
          <span className="text-logo">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 fill-logo" />
          </span>
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
            <span className="text-logo">Vio</span>
            <span style={{ color: 'hsl(var(--header-fg))' }}>News</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <button
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'hsl(var(--header-fg) / 0.7)' }}
            onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMobileMenuOpen(false); }}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Button size="sm" className="hidden sm:inline-flex text-xs md:text-sm px-2 md:px-3" asChild>
            <a href="https://x.com/vionewsbusiness" target="_blank" rel="noopener noreferrer">
              Follow on 𝕏
            </a>
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <form onSubmit={handleSearch} className="container pb-3 md:pb-4">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-background rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm md:text-base"
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
                className={`nav-link px-3 xl:px-4 py-2 text-sm whitespace-nowrap ${location.pathname === '/' ? 'active' : ''}`}
              >
                Latest
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.href}
                  className={`nav-link px-3 xl:px-4 py-2 text-sm whitespace-nowrap ${location.pathname === category.href ? 'active' : ''}`}
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
        <nav
          className="lg:hidden border-t"
          style={{ borderColor: 'hsl(var(--header-fg) / 0.1)', backgroundColor: 'hsl(var(--header-bg))' }}
        >
          <ul className="container py-2 space-y-0.5">
            {[{ name: 'Latest', href: '/' }, ...categories].map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-3 rounded-lg transition-colors min-h-[44px] text-sm font-medium"
                    style={{
                      color: isActive ? 'hsl(var(--header-fg))' : 'hsl(var(--header-fg) / 0.7)',
                      backgroundColor: isActive ? 'hsl(var(--header-fg) / 0.08)' : 'transparent',
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
            {/* Follow on X — only on very small screens where the button is hidden */}
            <li className="sm:hidden pt-1 pb-2 px-1">
              <a
                href="https://x.com/vionewsbusiness"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="flex items-center justify-center w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
              >
                Follow on 𝕏
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
