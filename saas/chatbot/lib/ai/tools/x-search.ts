import { tool } from "ai";
import { z } from "zod";

/**
 * X (Twitter) API v2 recent tweet search.
 * Requires BEARER_TOKEN env var.
 * Searches tweets from the last 7 days (free tier limit).
 */

interface XTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface XUser {
  id: string;
  name: string;
  username: string;
}

interface XSearchResponse {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
  };
  meta?: {
    newest_id?: string;
    oldest_id?: string;
    result_count: number;
    next_token?: string;
  };
}

async function searchRecentTweets(
  query: string,
  options: { max_results?: number; sort_order?: "recency" | "relevancy" } = {}
): Promise<XSearchResponse> {
  const bearerToken = process.env.BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error("BEARER_TOKEN env var is required for X search");
  }

  const params = new URLSearchParams({
    query: `${query} -is:retweet lang:en`,
    max_results: String(Math.min(options.max_results ?? 10, 100)),
    sort_order: options.sort_order ?? "relevancy",
    "tweet.fields": "created_at,author_id,public_metrics",
    expansions: "author_id",
    "user.fields": "name,username",
  });

  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`X API search failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<XSearchResponse>;
}

export const xSearch = tool({
  description: `Search recent X (Twitter) posts for real-time market sentiment, breaking news,
and trader chatter relevant to Kalshi prediction markets. Use for gauging public opinion on
political events, economic data releases, or breaking news before it's reflected in prices.
Always cite tweet IDs and authors in your analysis.`,
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'X search query, e.g. "Fed rate cut March 2026" or "OPEC oil production". Avoid quotes — the tool adds filters automatically.'
      ),
    max_results: z
      .number()
      .int()
      .min(10)
      .max(100)
      .default(10)
      .describe("Number of tweets to return (10–100)"),
    sort_order: z
      .enum(["recency", "relevancy"])
      .default("relevancy")
      .describe(
        '"relevancy" for most relevant (default), "recency" for most recent first'
      ),
  }),
  execute: async ({ query, max_results, sort_order }) => {
    try {
      const data = await searchRecentTweets(query, {
        max_results,
        sort_order,
      });

      const userMap = new Map<string, XUser>();
      for (const u of data.includes?.users ?? []) {
        userMap.set(u.id, u);
      }

      const tweets = (data.data ?? []).map((t) => {
        const author = t.author_id ? userMap.get(t.author_id) : undefined;
        return {
          id: t.id,
          text: t.text,
          created_at: t.created_at,
          author: author
            ? { name: author.name, username: author.username }
            : undefined,
          metrics: t.public_metrics,
          url: author
            ? `https://x.com/${author.username}/status/${t.id}`
            : `https://x.com/i/status/${t.id}`,
        };
      });

      return {
        query,
        count: data.meta?.result_count ?? tweets.length,
        tweets,
      };
    } catch (error) {
      return {
        query,
        error: error instanceof Error ? error.message : "X search failed",
        count: 0,
        tweets: [],
      };
    }
  },
});
