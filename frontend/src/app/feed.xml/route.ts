import type { BlogPost } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { getSiteUrl } from "@/lib/seo/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const posts = (await serverFetch<BlogPost[]>("/blog-posts")) ?? [];

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/career-advice/${post.slug}`;
      const pubDate = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.authorName)}</author>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>JobsFinder.lk Career Advice</title>
    <link>${siteUrl}/career-advice</link>
    <description>Career tips and professional resources from JobsFinder.lk</description>
    <language>en-lk</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
