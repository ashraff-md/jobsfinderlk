import { absoluteUrl } from "@/lib/seo/site";

type PaginationLinksProps = {
  prevPath?: string;
  nextPath?: string;
};

/**
 * Renders prev/next link elements for paginated job search.
 * Included in the server HTML for crawlers that still honor rel prev/next.
 */
export function PaginationLinks({ prevPath, nextPath }: PaginationLinksProps) {
  if (!prevPath && !nextPath) return null;

  return (
    <>
      {prevPath ? <link rel="prev" href={absoluteUrl(prevPath)} /> : null}
      {nextPath ? <link rel="next" href={absoluteUrl(nextPath)} /> : null}
    </>
  );
}
