import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Zap } from "lucide-react";

const footerLinks = {
  categories: [
    { name: "World", href: "/world" },
    { name: "Technology", href: "/technology" },
    { name: "Business", href: "/business" },
    { name: "Politics", href: "/politics" },
    { name: "Sports", href: "/sports" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Editorial Team", href: "/team" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "https://x.com/vionewsbusiness" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Youtube", icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'hsl(var(--header-bg))', color: 'hsl(var(--header-fg))' }} className="mt-12">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-1.5 mb-4">
              <Zap className="h-7 w-7 text-logo fill-logo" />
              <span className="text-2xl font-black tracking-tight">
                <span className="text-logo">Vio</span>
                <span style={{ color: 'hsl(var(--header-fg))' }}>News</span>
              </span>
            </Link>
            <p className="text-sm mb-6" style={{ color: 'hsl(var(--header-fg) / 0.6)' }}>
              Your trusted source for breaking news, in-depth analysis, and unbiased reporting from around the world.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.href !== "#" ? "_blank" : undefined}
                  rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-primary"
                  style={{ backgroundColor: 'hsl(var(--header-fg) / 0.1)' }}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: 'hsl(var(--header-fg) / 0.6)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: 'hsl(var(--header-fg) / 0.6)' }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--header-fg) / 0.6)' }}>
              Get the latest news delivered to your inbox daily.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    backgroundColor: 'hsl(var(--header-fg) / 0.1)',
                    borderColor: 'hsl(var(--header-fg) / 0.2)',
                    color: 'hsl(var(--header-fg))',
                  }}
                />
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTopColor: 'hsl(var(--header-fg) / 0.1)', borderTopWidth: '1px' }}>
          <p className="text-sm" style={{ color: 'hsl(var(--header-fg) / 0.4)' }}>
            © {new Date().getFullYear()} VioNews. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm transition-colors hover:text-primary"
                style={{ color: 'hsl(var(--header-fg) / 0.4)' }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
              style={{ backgroundColor: 'hsl(var(--header-fg) / 0.1)', color: 'hsl(var(--header-fg) / 0.4)' }}
            >
              A
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
