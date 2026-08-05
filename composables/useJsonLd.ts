import { business, site } from "@/data/site"
import type { Tour } from "@/types/tour"

/**
 * Escape characters that could terminate the <script> block early.
 * JSON-LD is injected as innerHTML, so this is the injection boundary.
 */
function serialize(node: Record<string, unknown>) {
  return JSON.stringify(node)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}

/** Inject one or more JSON-LD graph nodes into <head>. Nullish nodes are skipped. */
export function useJsonLd(...nodes: (Record<string, unknown> | null | undefined)[]) {
  const valid = nodes.filter((n): n is Record<string, unknown> => Boolean(n))
  if (!valid.length) return

  useHead({
    script: valid.map((node, i) => ({
      key: `ld-${(node["@type"] as string) ?? i}`,
      type: "application/ld+json",
      innerHTML: serialize(node),
    })),
  })
}

/** The agency itself — emit once, on the home page. */
export function travelAgencySchema() {
  const origin = useSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${origin}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: origin,
    logo: useAbsoluteUrl(site.logo),
    image: useAbsoluteUrl(site.ogImage),
    description: site.description,
    telephone: business.phone,
    email: business.email,
    priceRange: business.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.street,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.latitude,
      longitude: business.longitude,
    },
    openingHours: business.openingHours,
    areaServed: { "@type": "Country", name: "India" },
    sameAs: [...business.sameAs],
  }
}

/** Site-level node enabling sitelinks / name disambiguation. */
export function webSiteSchema() {
  const origin = useSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: origin,
    name: site.name,
    description: site.description,
    inLanguage: "en-IN",
    publisher: { "@id": `${origin}/#organization` },
  }
}

/** A bookable tour, with price offer — drives rich results on detail pages. */
export function tourSchema(tour: Tour) {
  const origin = useSiteUrl()
  const url = `${origin}/tours/${tour.slug}`

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${url}#trip`,
    name: tour.name,
    description: tour.seoDescription || tour.shortDescription,
    url,
    image: [tour.heroImage, ...(tour.gallery ?? [])].filter(Boolean).map((i) => useAbsoluteUrl(i)),
    touristType: tour.category,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: tour.itinerary?.length ?? 0,
      itemListElement: (tour.itinerary ?? []).map((day) => ({
        "@type": "ListItem",
        position: day.day,
        item: {
          "@type": "TouristAttraction",
          name: day.title,
          description: day.description,
        },
      })),
    },
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      price: tour.pricePerPerson,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url,
      validFrom: tour.publishedAt ?? undefined,
      category: tour.category,
    },
    provider: { "@id": `${origin}/#organization` },
  }
}

/** Breadcrumbs. Pass trail items in order, excluding "Home" (added for you). */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const origin = useSiteUrl()
  const items = [{ name: "Home", path: "/" }, ...trail]

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path === "/" ? "" : item.path}` || origin,
    })),
  }
}

/** Blog post. */
export function articleSchema(post: {
  title: string
  description: string
  path: string
  image?: string
  publishedAt?: string
  author?: string
}) {
  const origin = useSiteUrl()
  const url = `${origin}${post.path}`

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: post.image ? useAbsoluteUrl(post.image) : useAbsoluteUrl(site.ogImage),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: post.author ?? site.name },
    publisher: { "@id": `${origin}/#organization` },
    inLanguage: "en-IN",
  }
}

/**
 * A category/listing page presented as an ordered list of tours.
 * Returns null for an empty list — an ItemList claiming zero items is worse
 * than no ItemList at all.
 */
export function tourListSchema(tours: Tour[], listName: string) {
  if (!tours.length) return null
  const origin = useSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${origin}/tours/${tour.slug}`,
      name: tour.name,
    })),
  }
}
