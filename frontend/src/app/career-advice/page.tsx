import { CareerAdvicePage } from "@/components/pages/career-advice-page";
import type { BlogPost } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Career Advice",
  description:
    "Career tips, interview guidance, and professional resources for job seekers in Sri Lanka.",
  path: "/career-advice",
});

export default async function CareerAdviceRoute() {
  const [posts, featured] = await Promise.all([
    serverFetch<BlogPost[]>("/blog-posts"),
    serverFetch<BlogPost | null>("/blog-posts/featured"),
  ]);

  return (
    <CareerAdvicePage
      initialPosts={posts ?? []}
      initialFeatured={featured ?? null}
    />
  );
}
