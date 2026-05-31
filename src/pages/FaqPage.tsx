import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const SITE_URL = "https://vionews.in";

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is VioNews?",
    answer:
      "VioNews is an independent digital news platform covering world news, technology, business, politics and sports with original reporting for global readers.",
  },
  {
    question: "How often does VioNews publish new articles?",
    answer:
      "VioNews publishes new articles every 30 minutes, 24 hours a day, covering breaking news across 5 categories.",
  },
  {
    question: "Is VioNews free to read?",
    answer: "Yes, all VioNews content is completely free.",
  },
  {
    question: "How can I contact VioNews?",
    answer:
      "You can reach us at contact@vionews.in or through our contact page.",
  },
  {
    question: "Where does VioNews get its news?",
    answer:
      "VioNews has an editorial team that monitors global news sources and produces original, independently written articles on breaking stories.",
  },
];

export default function FaqPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "FAQ" },
      ],
    },
  ];

  useDocumentMeta({
    title: "Frequently Asked Questions — VioNews",
    description:
      "Answers to common questions about VioNews — what we cover, how often we publish, how to contact us and where our news comes from.",
    canonical: `${SITE_URL}/faq`,
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-16">
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">FAQ</span>
        </nav>

        <header className="mb-8 md:mb-12 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Everything you might want to know about VioNews — our coverage, publishing
            cadence and how to get in touch.
          </p>
        </header>

        <section className="max-w-3xl space-y-4">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-lg border border-border bg-card/40 p-5 open:bg-card/70 transition-colors"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h2 className="text-base md:text-lg font-semibold">{f.question}</h2>
                <span className="text-primary text-xl leading-none mt-0.5 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm md:text-base text-foreground/80 leading-relaxed">
                {f.answer}
              </p>
            </details>
          ))}
        </section>

        <section className="mt-10 md:mt-14 max-w-3xl">
          <p className="text-muted-foreground">
            Still have a question?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact our editorial team
            </Link>{" "}
            and we'll get back to you.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}