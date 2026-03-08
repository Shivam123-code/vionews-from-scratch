import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function PrivacyPolicyPage() {
  useDocumentMeta({
    title: "Privacy Policy | VioNews",
    description: "Read the VioNews privacy policy. Learn how we collect, use, and protect your personal information on our ad-supported news platform.",
    canonical: "https://vionews.in/privacy-policy",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-3xl">
        <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Privacy Policy</span>
        </nav>
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <p>Last updated: March 2026</p>
          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p>When you visit VioNews, we may collect certain information automatically, including your IP address, browser type, device information, and pages visited. If you subscribe to our newsletter or contact us, we collect the personal information you provide, such as your name and email address.</p>
          <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate and improve our news platform, deliver personalized content, send newsletters (if subscribed), respond to inquiries, and analyze usage patterns to enhance user experience.</p>
          <h2 className="text-2xl font-bold">3. Cookies and Tracking</h2>
          <p>VioNews uses cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and serve relevant advertisements. You can control cookie preferences through your browser settings.</p>
          <h2 className="text-2xl font-bold">4. Third-Party Services</h2>
          <p>We may use third-party services for analytics, advertising, and content delivery. These services may collect information about your browsing activity across different websites.</p>
          <h2 className="text-2xl font-bold">5. Advertising</h2>
          <p>VioNews is an ad-supported platform. Third-party advertisers may use cookies and tracking technologies to serve targeted advertisements. We do not share personally identifiable information with advertisers without your consent.</p>
          <h2 className="text-2xl font-bold">6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <h2 className="text-2xl font-bold">7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at contact@vionews.in.</p>
          <h2 className="text-2xl font-bold">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          <h2 className="text-2xl font-bold">9. Contact</h2>
          <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:contact@vionews.in" className="text-primary hover:underline">contact@vionews.in</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
