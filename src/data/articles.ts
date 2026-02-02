export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  time: string;
  date: string;
  author: string;
  authorRole: string;
  image: string;
  views: string;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "historic-diplomatic-meeting-international-relations",
    title: "Historic diplomatic meeting sets new course for international relations",
    excerpt: "World leaders gathered today for what is being called the most significant diplomatic summit in decades.",
    content: `World leaders gathered today for what is being called the most significant diplomatic summit in decades, addressing key global challenges and forging new partnerships that could reshape the international order for years to come.

The summit, held in Geneva, brought together representatives from over 50 nations to discuss pressing issues including climate change, economic cooperation, and regional security concerns. Negotiations continued late into the night as delegates worked to finalize a comprehensive agreement.

"This is a pivotal moment in diplomatic history," said one senior official who spoke on condition of anonymity. "The agreements reached here will have lasting implications for global cooperation."

Key outcomes of the summit include:
- A renewed commitment to climate action with binding emissions targets
- Enhanced economic cooperation frameworks between major trading partners
- Security agreements addressing regional conflicts
- Investment pledges for developing nations

Critics have noted that while the summit produced significant commitments, the real test will be in implementation. Several advocacy groups have called for more ambitious targets, particularly regarding environmental protections.

The diplomatic breakthrough comes after months of behind-the-scenes negotiations and represents a significant shift in international relations dynamics.`,
    category: "World",
    categorySlug: "world",
    time: "1 hour ago",
    date: "February 2, 2026",
    author: "John Smith",
    authorRole: "Senior Correspondent",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
    views: "156K",
  },
  {
    id: "2",
    slug: "global-leaders-climate-summit-geneva",
    title: "Global leaders convene for historic climate summit in Geneva",
    excerpt: "Representatives from over 100 nations gather to address pressing environmental challenges.",
    content: `In what environmentalists are calling a watershed moment for climate action, world leaders have convened in Geneva for an unprecedented summit focused on accelerating the global response to climate change.

The three-day conference brings together heads of state, environmental ministers, and leading climate scientists to negotiate new emissions reduction targets and funding mechanisms for climate adaptation in vulnerable nations.

"We are at a critical juncture," declared the summit chair in opening remarks. "The decisions we make here will determine the trajectory of our planet for generations to come."

Early discussions have centered on strengthening commitments made in previous climate agreements, with several major economies signaling willingness to adopt more aggressive decarbonization timelines. Developing nations have emphasized the need for increased financial support to transition away from fossil fuels while maintaining economic growth.

The summit has already produced several notable announcements, including a joint declaration on phasing out coal power and a new international fund to protect endangered ecosystems.`,
    category: "World",
    categorySlug: "world",
    time: "1 hour ago",
    date: "February 2, 2026",
    author: "Sarah Chen",
    authorRole: "Environment Editor",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
    views: "124K",
  },
  {
    id: "3",
    slug: "tech-giants-renewable-energy-breakthrough",
    title: "Tech giants announce breakthrough in renewable energy storage",
    excerpt: "Major technology companies reveal revolutionary battery technology that could transform clean energy.",
    content: `A consortium of leading technology companies has unveiled what they describe as a revolutionary advancement in energy storage technology, potentially solving one of the biggest obstacles to widespread renewable energy adoption.

The new battery system, developed through a collaborative research initiative, offers significant improvements in energy density, charging speed, and lifespan compared to existing lithium-ion solutions. Perhaps most importantly, it relies on abundant, sustainably sourced materials.

"This represents a fundamental shift in what's possible with energy storage," said the lead researcher at the announcement event. "We're talking about batteries that can store more energy, charge faster, and last longer than anything currently on the market."

Industry analysts predict the technology could accelerate the transition to renewable energy by making solar and wind power viable for baseload electricity generation. Several major utilities have already expressed interest in pilot programs.

The companies involved have committed to licensing the technology widely to maximize its environmental impact, though specific terms remain under negotiation.`,
    category: "Tech",
    categorySlug: "tech",
    time: "2 hours ago",
    date: "February 2, 2026",
    author: "Lisa Zhang",
    authorRole: "Technology Correspondent",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
    views: "98K",
  },
  {
    id: "4",
    slug: "stock-markets-rally-inflation-cooling",
    title: "Stock markets rally as inflation shows signs of cooling",
    excerpt: "Global indices surge following positive economic indicators suggesting easing price pressures.",
    content: `Stock markets around the world posted significant gains following the release of economic data showing inflation moderating faster than expected, raising hopes that central banks may soon begin easing monetary policy.

Major indices in Asia, Europe, and North America all closed higher, with technology and growth stocks leading the advance. The broad-based rally reflected growing optimism that the global economy may achieve a "soft landing" – taming inflation without triggering a recession.

"The data we're seeing suggests the worst of the inflation spike is behind us," noted one chief economist at a major investment bank. "Markets are pricing in a more favorable interest rate environment going forward."

Consumer prices rose at their slowest pace in two years, while producer prices showed even more pronounced deceleration. Core inflation measures, which exclude volatile food and energy costs, also trended lower.

Central bank officials have cautioned against premature celebration, emphasizing that inflation remains above target levels and that policy decisions will continue to be data-dependent. However, futures markets are now pricing in rate cuts beginning later this year.`,
    category: "Business",
    categorySlug: "business",
    time: "3 hours ago",
    date: "February 2, 2026",
    author: "Michael Torres",
    authorRole: "Markets Editor",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    views: "87K",
  },
  {
    id: "5",
    slug: "blockbuster-film-pre-sale-records",
    title: "Upcoming blockbuster film breaks pre-sale ticket records",
    excerpt: "Highly anticipated sequel generates unprecedented demand as fans rush to secure opening weekend seats.",
    content: `The entertainment industry is buzzing following news that an upcoming blockbuster sequel has shattered pre-sale ticket records, with opening weekend screenings selling out across major markets within hours of becoming available.

The film, which continues a beloved franchise that has captivated audiences for over a decade, has generated extraordinary anticipation. Theater chains reported website crashes as fans flooded online booking platforms simultaneously.

"We've never seen demand like this," said a spokesperson for one major cinema chain. "We're adding additional screenings as quickly as possible to meet customer demand."

The previous installment in the series earned over $1 billion at the global box office, and industry analysts predict the sequel could surpass that figure. The film's marketing campaign has been lauded for building excitement while carefully avoiding spoilers.

Fan communities have organized viewing parties and charity events around the release, demonstrating the cultural phenomenon the franchise has become. The filmmakers have teased that this installment will feature significant revelations that long-time fans have been anticipating.`,
    category: "Entertainment",
    categorySlug: "entertainment",
    time: "4 hours ago",
    date: "February 2, 2026",
    author: "Emma Wilson",
    authorRole: "Entertainment Reporter",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop",
    views: "76K",
  },
  {
    id: "6",
    slug: "championship-finals-thriller",
    title: "National team advances to championship finals after thriller",
    excerpt: "Dramatic last-minute victory secures spot in the title match following an unforgettable semifinal.",
    content: `Sports fans witnessed an instant classic as the national team secured their place in the championship finals with a dramatic victory that will be remembered for years to come.

The semifinal match featured momentum swings, controversial calls, and individual brilliance that kept spectators on the edge of their seats until the final whistle. Trailing late in the contest, the team produced a remarkable comeback capped by a decisive play in the closing moments.

"I've never experienced anything like that atmosphere," said the team captain in post-match interviews. "The fans carried us through. We dug deep and found a way."

The victory extends the team's remarkable tournament run, which has captured the nation's imagination and united fans across the country. Viewing figures for the match set new records, with millions tuning in to watch the dramatic conclusion.

The finals will take place next weekend against formidable opponents who advanced through their own bracket with an undefeated record. Both teams have met twice previously this season, with the series split.`,
    category: "Sports",
    categorySlug: "sports",
    time: "5 hours ago",
    date: "February 2, 2026",
    author: "David Park",
    authorRole: "Sports Correspondent",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    views: "65K",
  },
  {
    id: "7",
    slug: "space-mission-launches-successfully",
    title: "Revolutionary space mission launches successfully from coastal facility",
    excerpt: "The groundbreaking mission marks a new era in space exploration with advanced technology.",
    content: `A revolutionary space mission launched successfully from a coastal facility early this morning, marking what scientists describe as a new chapter in humanity's exploration of the cosmos.

The mission, years in development, carries advanced instruments designed to study distant celestial objects with unprecedented detail. If successful, the data gathered could answer fundamental questions about the universe's origins and composition.

"Today we take another giant leap," declared the mission director as the rocket cleared the launch tower. "This mission will push the boundaries of what we know about our universe."

The spacecraft is equipped with next-generation sensors and communication systems that represent significant improvements over previous missions. Ground controllers reported all systems functioning normally as the vehicle achieved orbit and began its journey to the target destination.

International space agencies contributed components and expertise to the mission, reflecting the collaborative nature of modern space exploration. Scientists around the world will have access to the data collected, enabling research that could lead to new discoveries.`,
    category: "Science",
    categorySlug: "science",
    time: "2 hours ago",
    date: "February 2, 2026",
    author: "Sarah Chen",
    authorRole: "Science Editor",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&h=600&fit=crop",
    views: "54K",
  },
  {
    id: "8",
    slug: "central-bank-policy-shift",
    title: "Central bank announces major policy shift affecting global markets",
    excerpt: "Financial experts analyze the implications of the unexpected decision on investments.",
    content: `The central bank announced a significant shift in monetary policy today, catching many market observers by surprise and triggering immediate reactions across global financial markets.

The policy change, which adjusts the framework for interest rate decisions, reflects evolving economic conditions and lessons learned from recent market turbulence. Officials emphasized that the move aims to enhance economic stability while supporting sustainable growth.

"We believe this adjustment will provide greater flexibility to respond to changing conditions," explained the bank's governor in a press conference following the announcement. "Our commitment to price stability remains unwavering."

Financial analysts spent the day parsing the implications of the decision, with opinions divided on its long-term effects. Some praised the move as prudent adaptation, while others expressed concern about potential unintended consequences.

Markets initially reacted with volatility before stabilizing as investors digested the news. Currency markets saw notable movements, and bond yields adjusted to reflect new expectations for the interest rate path.`,
    category: "Business",
    categorySlug: "business",
    time: "3 hours ago",
    date: "February 2, 2026",
    author: "Michael Torres",
    authorRole: "Markets Editor",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop",
    views: "48K",
  },
  {
    id: "9",
    slug: "director-reveals-sequel-plans",
    title: "Award-winning director reveals plans for highly anticipated sequel",
    excerpt: "Fans celebrate as the beloved franchise confirms return with original cast.",
    content: `Fans of a beloved film franchise received exciting news today as the award-winning director confirmed plans for a long-awaited sequel, with the original cast set to return.

The announcement, made during a surprise appearance at a fan convention, sparked immediate celebration across social media as supporters shared their excitement about the project's confirmation.

"This story has always had more to tell," the director explained to the enthusiastic crowd. "The time finally feels right to continue the journey with these characters."

The original film achieved both critical acclaim and commercial success, developing a passionate fanbase over the years who have consistently campaigned for a continuation. The director had previously expressed reluctance to revisit the material without a story worthy of the original.

Production is expected to begin later this year, with a release targeted for the following year. Several cast members shared statements expressing their excitement about reuniting for the project.`,
    category: "Entertainment",
    categorySlug: "entertainment",
    time: "4 hours ago",
    date: "February 2, 2026",
    author: "Emma Wilson",
    authorRole: "Entertainment Reporter",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    views: "42K",
  },
  {
    id: "10",
    slug: "historic-sports-event-viewership",
    title: "Historic sports event draws millions of viewers worldwide",
    excerpt: "The championship final delivers unforgettable moments and record-breaking performances.",
    content: `A historic championship event captivated audiences around the globe, drawing record viewership as athletes delivered performances that will be etched in sporting history.

The event, which brought together the world's top competitors, exceeded expectations with dramatic competition and displays of athletic excellence. Multiple records fell across various categories as participants pushed the boundaries of human achievement.

"Days like this remind us why sports matter," reflected one legendary athlete following the competition. "The determination and spirit on display today was truly inspiring."

Broadcasting networks reported viewership figures surpassing previous records, with audiences spanning every continent. Social media engagement reached unprecedented levels as fans shared reactions in real-time.

The event's organizers praised the athletes and support staff who made the historic day possible. Plans are already underway for next year's competition, with expectations set even higher following this year's success.`,
    category: "Sports",
    categorySlug: "sports",
    time: "5 hours ago",
    date: "February 2, 2026",
    author: "David Park",
    authorRole: "Sports Correspondent",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    views: "38K",
  },
  {
    id: "11",
    slug: "tech-innovation-transportation",
    title: "Tech innovation promises to transform daily transportation",
    excerpt: "New sustainable technology could revolutionize how we commute in urban areas.",
    content: `A groundbreaking transportation technology unveiled today could fundamentally change how people navigate urban environments, offering a sustainable alternative to traditional commuting methods.

The innovation, developed by a team of engineers and urban planners, addresses multiple challenges facing modern cities including congestion, pollution, and accessibility. Early demonstrations have impressed observers with the system's efficiency and user-friendly design.

"We've reimagined urban mobility from the ground up," explained the project's lead developer. "This isn't just an incremental improvement – it's a new paradigm for how cities can function."

The technology incorporates advanced materials, smart sensors, and renewable energy systems to create an integrated transportation solution. Pilot programs are planned for several major cities, with full deployment potentially following within years.

Urban planning experts have praised the initiative for addressing multiple challenges simultaneously, though some have raised questions about implementation costs and infrastructure requirements that would need to be addressed.`,
    category: "Tech",
    categorySlug: "tech",
    time: "6 hours ago",
    date: "February 2, 2026",
    author: "Lisa Zhang",
    authorRole: "Technology Correspondent",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
    views: "35K",
  },
  {
    id: "12",
    slug: "international-leaders-global-challenges",
    title: "International leaders address pressing global challenges at summit",
    excerpt: "Delegates from over 100 nations gather to discuss solutions for the future.",
    content: `Leaders from more than 100 nations concluded a major international summit today, having addressed a wide-ranging agenda of global challenges facing the international community.

The summit covered topics including economic development, security cooperation, public health preparedness, and digital governance. Working groups produced frameworks for enhanced cooperation in each area, with implementation timelines attached.

"Multilateralism remains our best tool for addressing shared challenges," emphasized the summit's host in closing remarks. "The agreements reached here demonstrate our collective commitment to a better future."

Notable outcomes included new funding commitments for development programs, enhanced information-sharing protocols for health emergencies, and principles for governing emerging technologies. Side meetings produced additional bilateral agreements between participating nations.

Civil society observers praised several outcomes while calling for more ambitious action on certain issues. The summit concluded with agreement to reconvene annually to assess progress and address emerging challenges.`,
    category: "World",
    categorySlug: "world",
    time: "7 hours ago",
    date: "February 2, 2026",
    author: "James Wright",
    authorRole: "International Affairs Editor",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop",
    views: "32K",
  },
];

export const categories = [
  { name: "World", slug: "world", color: "bg-news-world" },
  { name: "Business", slug: "business", color: "bg-news-business" },
  { name: "Entertainment", slug: "entertainment", color: "bg-news-entertainment" },
  { name: "Sports", slug: "sports", color: "bg-news-sports" },
  { name: "Tech", slug: "tech", color: "bg-news-tech" },
  { name: "Science", slug: "science", color: "bg-news-tech" },
];

export function getArticlesByCategory(categorySlug: string): Article[] {
  return articles.filter((article) => article.categorySlug === categorySlug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getCategoryColor(categorySlug: string): string {
  const category = categories.find((c) => c.slug === categorySlug);
  return category?.color || "bg-primary";
}
