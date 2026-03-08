import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-3xl">
        <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Terms of Service</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <p>Last updated: March 2026</p>

          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p>By accessing and using VioNews (vionews.in), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>

          <h2 className="text-2xl font-bold">2. Use of Content</h2>
          <p>All content on VioNews, including articles, images, and graphics, is protected by copyright. You may read and share articles for personal, non-commercial purposes. Reproduction or redistribution of our content without written permission is prohibited.</p>

          <h2 className="text-2xl font-bold">3. User Conduct</h2>
          <p>You agree not to use VioNews for any unlawful purpose, attempt to gain unauthorized access to our systems, interfere with the proper functioning of the website, or use automated tools to scrape or harvest content.</p>

          <h2 className="text-2xl font-bold">4. Disclaimer</h2>
          <p>VioNews provides news and information for general informational purposes only. While we strive for accuracy, we make no warranties regarding the completeness, reliability, or timeliness of the information provided.</p>

          <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
          <p>VioNews shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of or inability to use our website or services.</p>

          <h2 className="text-2xl font-bold">6. Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these external sites.</p>

          <h2 className="text-2xl font-bold">7. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms of Service at any time. Continued use of VioNews after changes constitutes acceptance of the updated terms.</p>

          <h2 className="text-2xl font-bold">8. Contact</h2>
          <p>For questions about these Terms of Service, contact us at <a href="mailto:contact@vionews.in" className="text-primary hover:underline">contact@vionews.in</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
