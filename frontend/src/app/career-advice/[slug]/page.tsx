import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerAdviceArticlePage } from "@/components/pages/career-advice-article-page";
import { JsonLd } from "@/components/seo/json-ld";
import type { BlogPost } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/seo/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetch<BlogPost>(`/blog-posts/${slug}`);
  if (!post) return { title: "Article Not Found" };
  return buildArticleMetadata(post);
}

export default async function CareerAdviceArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    serverFetch<BlogPost>(`/blog-posts/${slug}`),
    serverFetch<BlogPost[]>("/blog-posts"),
  ]);

  if (!post) notFound();

  const relatedPosts = (allPosts ?? [])
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  const siteUrl = getSiteUrl();

  return (
    <>
      <JsonLd
        data={[
          buildArticleJsonLd(post, siteUrl),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Career Advice", path: "/career-advice" },
            { name: post.title, path: `/career-advice/${post.slug}` },
          ]),
        ]}
      />
      <CareerAdviceArticlePage post={post} relatedPosts={relatedPosts} />
    </>
  );
}
