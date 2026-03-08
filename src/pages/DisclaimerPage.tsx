import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12 max-w-3xl">
        <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Disclaimer</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
          <p className="text-xl leading-relaxed">
            VioNews reports on publicly available news. All content is independently written. We are not affiliated with any news agency.
          </p>

          <p>
            The information provided on VioNews (vionews.in) is for general informational and educational purposes only. While we make every effort to ensure the accuracy and reliability of our reporting, we cannot guarantee that all information is complete, current, or error-free.
          </p>

          <p>
            VioNews uses publicly available news sources as reference points for original reporting. Our editorial team independently researches and writes all articles published on this platform. Any resemblance to content from other news organizations is coincidental and reflects common reporting on the same public events.
          </p>

          <p>
            The views and opinions expressed in articles on VioNews do not necessarily reflect the official policy or position of any government, organization, or entity mentioned. Any reference to specific individuals, companies, or products does not constitute an endorsement.
          </p>

          <p>
            VioNews is not responsible for any decisions made based on the information provided on this website. Readers are encouraged to verify critical information through multiple sources before acting on it.
          </p>

          <p>
            For corrections, clarifications, or concerns about our content, please contact us at{" "}
            <a href="mailto:contact@vionews.in" className="text-primary hover:underline">contact@vionews.in</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
