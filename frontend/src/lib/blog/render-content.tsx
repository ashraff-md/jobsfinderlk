function parseBlocks(content: string) {
  const lines = content.split("\n");
  const blocks: Array<
    | { type: "paragraph"; text: string }
    | { type: "heading"; text: string }
    | { type: "quote"; lines: string[] }
  > = [];

  let paragraph: string[] = [];
  let quote: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushQuote = () => {
    const lines = quote.map((line) => line.replace(/^>\s?/, "").trim()).filter(Boolean);
    if (lines.length) blocks.push({ type: "quote", lines });
    quote = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushQuote();
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      quote.push(trimmed);
      continue;
    }

    flushQuote();

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "heading", text: trimmed.slice(3).trim() });
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushQuote();
  return blocks;
}

export function BlogArticleContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="prose max-w-none font-body-lg text-body-lg">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              key={`${block.type}-${index}`}
              className="mb-4 mt-10 font-headline-md text-headline-md text-on-surface"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "quote") {
          const [quoteText, ...rest] = block.lines;
          const attribution = rest.find((line) => line.startsWith("—") || line.startsWith("-"));
          return (
            <div
              key={`${block.type}-${index}`}
              className="my-stack-lg border-l-4 border-secondary bg-surface-container-low py-2 pl-8"
            >
              <blockquote className="text-[22px] font-medium italic leading-snug text-on-background">
                {quoteText}
              </blockquote>
              {attribution ? (
                <p className="mt-4 font-label-bold text-on-surface-variant">{attribution}</p>
              ) : null}
            </div>
          );
        }

        const isLead = index === 0;
        return (
          <p
            key={`${block.type}-${index}`}
            className={
              isLead
                ? "mb-8 font-headline-md text-headline-md font-bold leading-relaxed text-on-surface"
                : "mb-6 leading-relaxed text-on-surface-variant"
            }
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
