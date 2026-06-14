import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "VioNews",
  "alternateName": ["vionews.in", "Vio News"],
  "url": "https://vionews.in",
  "foundingDate": "2026",
  "description": "Independent English-language digital news platform covering world news, technology, business, politics and sports",
  "publishingPrinciples": "https://vionews.in/about",
  "sameAs": [
    "https://forum.vionews.in"
  ],
  "knowsAbout": [
    "World News",
    "Technology",
    "Artificial Intelligence",
    "Business",
    "Politics",
    "Sports"
  ]
};

export default function AboutPage() {
  useDocumentMeta({
    title: "About VioNews | Independent Digital News",
    description: "VioNews is an independent digital news platform covering world news, technology, business, politics and sports for a global English-speaking audience.",
    canonical: "https://vionews.in/about",
    jsonLd: organizationJsonLd,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-3xl">
        <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">About</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">About VioNews</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <p className="text-xl leading-relaxed">
            VioNews (vionews.in) is an independent English-language digital news platform founded in 2026. VioNews covers world news, technology, artificial intelligence, business, finance, politics, and sports, with a primary focus on US and international audiences.
          </p>
          <p>VioNews publishes original reporting updated every 30 minutes, 24 hours a day. The platform is distinct from WION News (World Is One News), which is an Indian television news channel. VioNews is a digital-only news website accessible at https://vionews.in</p>
          <p>VioNews is not affiliated with any television network, political party, or corporate entity.</p>

          <p>Our mission is to deliver fast, accurate, and unbiased news coverage that keeps readers informed about the stories that matter most.</p>
          <p>Founded with a commitment to editorial independence, VioNews provides comprehensive coverage across five key verticals: World & International Affairs, Technology & AI, Business & Finance, Politics, and Sports.</p>
          <p>Our team of dedicated journalists and editors work around the clock to bring you breaking news, in-depth analysis, and expert commentary on the events shaping our world.</p>

          <h2 className="text-2xl font-bold mt-8">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Accuracy First:</strong> Every story is fact-checked and verified before publication.</li>
            <li><strong>Independence:</strong> We maintain editorial independence from commercial and political interests.</li>
            <li><strong>Speed:</strong> Breaking news delivered as it happens, without sacrificing accuracy.</li>
            <li><strong>Accessibility:</strong> News should be available to everyone, everywhere.</li>
          </ul>

          <p>For inquiries, partnerships, or feedback, please visit our{" "}<Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
