import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerAdviceArticlePage } from "@/components/pages/career-advice-article-page";
import type { BlogPost } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetch<BlogPost>(`/blog-posts/${slug}`);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
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

  return <CareerAdviceArticlePage post={post} relatedPosts={relatedPosts} />;
}
