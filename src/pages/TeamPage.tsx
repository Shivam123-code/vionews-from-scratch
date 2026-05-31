import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const SITE_URL = "https://vionews.in";

const team = [
  {
    name: "Aarav Mehta",
    role: "Editor-in-Chief",
    bio: "Aarav leads editorial direction at VioNews, with 12+ years covering global affairs, technology and policy across major newsrooms.",
  },
  {
    name: "Sophia Carter",
    role: "Managing Editor, World & Politics",
    bio: "Sophia oversees world and political coverage, focusing on diplomacy, elections and cross-border policy.",
  },
  {
    name: "Daniel Park",
    role: "Senior Editor, Business & Markets",
    bio: "Daniel reports on markets, corporate strategy and macroeconomics, with previous experience covering Wall Street and Asian markets.",
  },
  {
    name: "Priya Nair",
    role: "Senior Editor, Technology",
    bio: "Priya covers AI, consumer technology and digital policy, translating complex tech stories for everyday readers.",
  },
  {
    name: "Marcus Bennett",
    role: "Sports Editor",
    bio: "Marcus leads sports coverage across leagues and international tournaments, with a focus on data-driven analysis.",
  },
  {
    name: "VioNews Newsroom",
    role: "Editorial Desk",
    bio: "Our 24/7 newsroom produces original reporting and analysis across world, politics, business, technology and sports.",
  },
];

export default function TeamPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "VioNews",
      url: SITE_URL,
      employee: team.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        description: m.bio,
        worksFor: { "@type": "Organization", name: "VioNews" },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Editorial Team" },
      ],
    },
  ];

  useDocumentMeta({
    title: "Editorial Team — VioNews",
    description:
      "Meet the VioNews editorial team — the editors and journalists behind our world, politics, business, technology and sports coverage.",
    canonical: `${SITE_URL}/team`,
    jsonLd,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 md:py-16">
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Editorial Team</span>
        </nav>

        <header className="mb-8 md:mb-12 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Editorial Team</h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            VioNews is produced by an independent editorial team committed to accurate,
            balanced reporting. Meet the editors and journalists who oversee our coverage
            across world, politics, business, technology and sports.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {team.map((member) => (
            <article
              key={member.name}
              className="rounded-lg border border-border bg-card p-5 md:p-6 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                  {member.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">{member.name}</h2>
                  <p className="text-sm text-primary">{member.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 md:mt-16 max-w-3xl">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Editorial Standards</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every VioNews article is produced by our editorial desk, reviewed for accuracy
            and written in line with our standards on independence, sourcing and corrections.
            For questions about a story or to reach a member of the team, visit our{" "}
            <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}