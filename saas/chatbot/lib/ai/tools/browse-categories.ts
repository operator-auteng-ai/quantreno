import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getKalshiClientForUser } from "@/lib/kalshi";
import { log } from "@/lib/logger";

type BrowseCategoriesProps = { session: Session };

export const browseCategories = ({ session }: BrowseCategoriesProps) =>
  tool({
    description: `Browse Kalshi market categories, tags, and series. Use this to discover what
types of markets exist on Kalshi.

Without parameters: returns all categories and their tags (e.g. Economics → [Fed, Inflation, Oil]).
With category/tag: returns the specific series (e.g. CPI, KXFED) so you can pass their
series_ticker to getMarkets to see individual contracts.

Call flow: browseCategories → get series_ticker → getMarkets(series_ticker) → analyze markets.`,
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe(
          'Filter series by category (e.g. "Economics", "Politics", "Crypto", "Financials")'
        ),
      tag: z
        .string()
        .optional()
        .describe(
          'Filter series by tag within a category (e.g. "Fed", "Inflation", "BTC", "S&P")'
        ),
    }),
    execute: async ({ category, tag }) => {
      try {
        const client = await getKalshiClientForUser(session.user.id);

        // If no filters, return the category → tags taxonomy
        if (!category && !tag) {
          const { tags_by_categories } = await client.getTagsByCategories();

          // Filter out null tags and format for readability
          const categories = Object.entries(tags_by_categories)
            .filter(([, tags]) => tags !== null)
            .map(([name, tags]) => ({ category: name, tags }));

          return {
            categories,
            category_count: categories.length,
            hint: "Pass a category or tag to see available series, then use getMarkets with series_ticker.",
          };
        }

        // With filters, return matching series
        const { series } = await client.getSeries({
          category,
          tags: tag,
        });

        log.info("browseCategories", "fetched series", {
          userId: session.user.id,
          category,
          tag,
          seriesCount: series.length,
        });

        return {
          series: series.map((s) => ({
            ticker: s.ticker,
            title: s.title,
            category: s.category,
            tags: s.tags,
          })),
          series_count: series.length,
          hint: "Use getMarkets with series_ticker to see individual contracts for a series.",
        };
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to browse categories",
          categories: [],
          series: [],
        };
      }
    },
  });
