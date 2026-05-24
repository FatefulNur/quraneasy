import type { BlogPost } from "@/lib/content/types";

export function wordCountFromHtml(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, "");
  return text.split(/\s+/).filter(Boolean).length;
}

