"""Search recent posts on X for market research."""

import json
from .client import get_client


def search_recent(query: str, max_results: int = 20) -> list[dict]:
    """Search posts from the last 7 days.

    Args:
        query: X search query using operators (e.g. 'oil prices OPEC -is:retweet')
        max_results: Number of results (10-100 per page)

    Returns:
        List of post dicts with text, author_id, created_at, public_metrics.
    """
    client = get_client()
    all_posts = []

    for page in client.posts.search_recent(
        query=query,
        max_results=min(max_results, 100),
        tweet_fields=["author_id", "created_at", "public_metrics", "lang"],
    ):
        page_data = getattr(page, "data", []) or []
        all_posts.extend(page_data)
        if len(all_posts) >= max_results:
            break

    return all_posts[:max_results]


def search_and_print(query: str, max_results: int = 20) -> None:
    """Search and print results as formatted output."""
    posts = search_recent(query, max_results)

    if not posts:
        print(f"No results for: {query}")
        return

    print(f"\n--- X Search: '{query}' ({len(posts)} results) ---\n")
    for i, post in enumerate(posts, 1):
        if isinstance(post, dict):
            text = post.get("text", "")
            created = post.get("created_at", "")
            metrics = post.get("public_metrics", {})
        else:
            text = getattr(post, "text", "")
            created = getattr(post, "created_at", "")
            metrics = getattr(post, "public_metrics", {})
            if metrics and not isinstance(metrics, dict):
                metrics = metrics.__dict__ if hasattr(metrics, "__dict__") else {}

        likes = metrics.get("like_count", 0) if isinstance(metrics, dict) else 0
        retweets = metrics.get("retweet_count", 0) if isinstance(metrics, dict) else 0

        print(f"[{i}] {created}")
        print(f"    {text[:280]}")
        if likes or retweets:
            print(f"    Likes: {likes} | Retweets: {retweets}")
        print()
