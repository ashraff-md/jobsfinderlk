import type { Metadata } from "next";
import { CareerAdvicePage } from "@/components/pages/career-advice-page";
import type { BlogPost } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { ROUTE_META } from "@/lib/routes";

const meta = ROUTE_META["/career-advice"];

export const metadata: Metadata = {
  title: meta.title,
  description: "Career advice blog and professional resources.",
};

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
