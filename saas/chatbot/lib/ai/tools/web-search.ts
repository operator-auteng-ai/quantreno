import { tool } from "ai";
import { z } from "zod";

/**
 * Web search using Tavily API.
 * Requires TAVILY_API_KEY env var.
 * Sign up at https://tavily.com — free tier covers 1,000 searches/mo.
 */

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
  query: string;
  answer?: string;
}

async function tavilySearch(
  query: string,
  options: { max_results?: number; topic?: "general" | "news" } = {}
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY env var is required for web search");
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: options.max_results ?? 5,
      topic: options.topic ?? "news",
      include_answer: true,
      search_depth: "advanced",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily search failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TavilyResponse>;
}

export const webSearch = tool({
  description: `Search the web for real-time news, events, and data to research trading theses.
Use this to find catalysts, verify market assumptions, or triangulate views before
recommending a trade. Prefer specific, targeted queries over broad ones.
Always cite sources in your analysis.`,
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Specific search query, e.g. "OPEC oil production cut September 2026" or "Fed rate decision probability March 2026"'
      ),
    topic: z
      .enum(["news", "general"])
      .default("news")
      .describe('Search mode: "news" for recent news, "general" for broader web'),
    max_results: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(5)
      .describe("Number of results to return"),
  }),
  execute: async ({ query, topic, max_results }) => {
    try {
      const data = await tavilySearch(query, { max_results, topic });

      return {
        query,
        answer: data.answer,
        results: data.results.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.content,
          published_date: r.published_date,
          score: r.score,
        })),
        count: data.results.length,
      };
    } catch (error) {
      return {
        query,
        error:
          error instanceof Error ? error.message : "Web search failed",
        results: [],
        count: 0,
      };
    }
  },
});
