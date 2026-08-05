import { site } from "@/data/site"

export interface SeoOptions {
  /** Page title. The site name is appended unless `titleRaw` is true. */
  title: string
  description: string
  /** Use the title verbatim, without the " | Trendzy Tours" suffix. */
  titleRaw?: boolean
  /** Absolute URL, or a site-relative path like "/images/x.jpg". */
  image?: string
  /** og:type — "website" for pages, "article" for blog posts. */
  type?: "website" | "article"
  /** Emit noindex,nofollow. Use for private/utility routes. */
  noindex?: boolean
  /** Override the canonical path (defaults to the current route path). */
  canonicalPath?: string
  /** Article-only Open Graph fields. */
  publishedTime?: string
  author?: string
}

/** Resolve the public origin, preferring runtime config over the build default. */
export function useSiteUrl() {
  const config = useRuntimeConfig()
  const raw = (config.public.siteUrl as string) || site.url
  return raw.replace(/\/+$/, "")
}

/** Turn a path or partial URL into an absolute one. */
export function useAbsoluteUrl(pathOrUrl?: string) {
  const origin = useSiteUrl()
  if (!pathOrUrl) return origin
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}

/**
 * Sets title, description, canonical, Open Graph and Twitter Card tags in one
 * call so every public page gets a consistent, complete head.
 */
export function useSeo(options: SeoOptions) {
  const route = useRoute()
  const origin = useSiteUrl()

  // Normalise: no trailing slash (except root) so canonicals never split.
  const path = options.canonicalPath ?? route.path
  const cleanPath = path === "/" ? "/" : path.replace(/\/+$/, "")
  const canonical = `${origin}${cleanPath}`

  const title = options.titleRaw ? options.title : `${options.title} | ${site.name}`
  const image = useAbsoluteUrl(options.image ?? site.ogImage)
  const type = options.type ?? "website"

  useSeoMeta({
    title,
    description: options.description,
    robots: options.noindex ? "noindex, nofollow" : "index, follow",

    ogTitle: title,
    ogDescription: options.description,
    ogType: type,
    ogUrl: canonical,
    ogImage: image,
    ogImageAlt: options.title,
    ogSiteName: site.name,
    ogLocale: site.locale,

    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: options.description,
    twitterImage: image,

    ...(type === "article"
      ? {
          articlePublishedTime: options.publishedTime,
          articleAuthor: options.author ? [options.author] : undefined,
        }
      : {}),
  })

  useHead({
    link: [{ rel: "canonical", href: canonical }],
  })

  return { canonical, image }
}
