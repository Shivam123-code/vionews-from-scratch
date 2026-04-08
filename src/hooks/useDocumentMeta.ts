import { useEffect } from "react";

const SITE_NAME = "VioNews";
const SITE_URL = "https://vionews.in";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

export interface DocumentMeta {
  title: string;
  description: string;
  canonical: string;
  ogType?: "website" | "article";
  ogImage?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

function setJsonLd(data: Record<string, any> | Record<string, any>[]) {
  // Remove previous injected JSON-LD
  document.querySelectorAll('script[data-seo="vionews"]').forEach(el => el.remove());

  const items = Array.isArray(data) ? data : [data];
  items.forEach(item => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "vionews");
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

export function useDocumentMeta(meta: DocumentMeta) {
  useEffect(() => {
    const { title, description, canonical, ogType = "website", ogImage = DEFAULT_IMAGE, jsonLd } = meta;

    if (!canonical) return;

    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    // Title
    document.title = fullTitle;

    // Standard meta
    setMetaTag("description", description, true);

    // Open Graph
    setMetaTag("og:title", fullTitle);
    setMetaTag("og:description", description);
    setMetaTag("og:url", canonical);
    setMetaTag("og:type", ogType);
    setMetaTag("og:image", ogImage);
    setMetaTag("og:site_name", SITE_NAME);

    // Twitter
    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", fullTitle, true);
    setMetaTag("twitter:description", description, true);
    setMetaTag("twitter:image", ogImage, true);

    // Canonical
    setCanonical(canonical);

    // Robots noindex
    let robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (meta.noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.setAttribute("name", "robots");
        document.head.appendChild(robotsEl);
      }
      robotsEl.content = "noindex, nofollow";
    } else if (robotsEl) {
      robotsEl.remove();
    }

    // JSON-LD
    if (jsonLd) {
      setJsonLd(jsonLd);
    }

    return () => {
      document.querySelectorAll('script[data-seo="vionews"]').forEach(el => el.remove());
      const rb = document.querySelector('meta[name="robots"]');
      if (rb) rb.remove();
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogType, meta.ogImage, meta.jsonLd, meta.noindex]);
}

// Helper to build NewsArticle JSON-LD
export function buildArticleJsonLd(article: {
  title: string;
  seoTitle?: string;
  description: string;
  image: string;
  publishedAt: string;
  categorySlug: string;
  slug: string;
  keywords?: string[];
}) {
  const url = `${SITE_URL}/${article.categorySlug}/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.seoTitle || article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: article.image,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: url,
    keywords: article.keywords?.join(", ") || "",
  };
}

// Helper to build BreadcrumbList JSON-LD
export function buildBreadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}
