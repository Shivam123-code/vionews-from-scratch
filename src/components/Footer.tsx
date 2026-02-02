import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const footerLinks = {
  categories: [
    { name: "World", href: "#" },
    { name: "Business", href: "#" },
    { name: "Entertainment", href: "#" },
    { name: "Sports", href: "#" },
    { name: "Science", href: "#" },
    { name: "Tech", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Advertise", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Youtube", icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">V</span>
              </div>
              <span className="font-display text-2xl font-bold">
                <span className="text-primary">VIO</span>
                <span className="text-background">NEWS</span>
              </span>
            </a>
            <p className="text-background/70 text-sm mb-6">
              Your trusted source for breaking news, in-depth analysis, and unbiased reporting from around the world.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/70 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/70 hover:text-primary transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-background/70 text-sm mb-4">
              Get the latest news delivered to your inbox daily.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-10 pr-4 py-2 bg-background/10 border border-background/20 rounded-lg text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2026 VioNews. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-background/50 hover:text-background transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
