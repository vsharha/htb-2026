/** The bare hostname a logo service is asked about, or null when the site isn't usable. */
export function siteHost(website: string | null): string | null {
  if (!website) return null;
  try {
    const url = new URL(website.includes("://") ? website : `https://${website}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/** A brand logo from DuckDuckGo's favicon cache, which answers with a PNG for any host. */
export function logoUrl(website: string | null): string | null {
  const host = siteHost(website);
  return host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : null;
}

/** The one or two letters that stand in for a name without a logo. */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return [...(words[0] ?? "")].slice(0, 2).join("").toUpperCase();
}
