import { Helmet } from "react-helmet-async";

const SITE_NAME = "CivilBridge";
const BASE_URL  = import.meta.env.VITE_APP_BASE_URL || "https://civilbridge.rw";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

/**
 * SEO component — renders <head> meta tags for every page.
 *
 * Props:
 *   title       string  — page title (appended with " | CivilBridge")
 *   description string  — meta description (max ~155 chars)
 *   image       string  — OG / Twitter image URL (absolute)
 *   url         string  — canonical URL (absolute); defaults to current href
 *   noindex     bool    — set true for auth/dashboard pages
 *   jsonLd      object  — JSON-LD structured data object
 */
export default function SEO({
  title,
  description = "CivilBridge connects Rwanda's construction sector — plans, experts, marketplace, and project management in one platform.",
  image = DEFAULT_IMAGE,
  url,
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = url || (typeof window !== "undefined" ? window.location.href : BASE_URL);
  const absImage  = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={absImage} />
      <meta property="og:url"         content={canonical} />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={absImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
