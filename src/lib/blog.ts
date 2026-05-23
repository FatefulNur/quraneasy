import type { BlogPost } from "@/lib/content/types";

export function wordCountFromHtml(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, "");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readTimeFromHtml(html: string): number {
  return Math.max(1, Math.ceil(wordCountFromHtml(html) / 200));
}

export function loadBlogPosts(): BlogPost[] {
  const entries = import.meta.glob<BlogPost>("@/content/blog/*.json", {
    eager: true,
  });
  return Object.values(entries);
}
