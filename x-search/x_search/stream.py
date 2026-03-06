"""Filtered stream for real-time X post monitoring."""

import json
import signal
import sys
from .client import get_client


def get_rules() -> list | None:
    """Retrieve current stream filter rules."""
    client = get_client()
    response = client.stream.get_rules()
    return getattr(response, "data", None)


def delete_all_rules() -> None:
    """Remove all existing stream rules."""
    rules = get_rules()
    if not rules:
        return

    client = get_client()
    ids = [rule["id"] if isinstance(rule, dict) else getattr(rule, "id") for rule in rules]
    client.stream.update_rules(body={"delete": {"ids": ids}})
    print(f"Deleted {len(ids)} existing rules.")


def set_rules(rules: list[dict]) -> None:
    """Set new stream filter rules.

    Args:
        rules: List of rule dicts with 'value' and 'tag' keys.
               e.g. [{"value": "oil prices lang:en -is:retweet", "tag": "oil"}]
    """
    client = get_client()
    response = client.stream.update_rules(body={"add": rules})
    data = getattr(response, "data", None)
    if data:
        print(f"Set {len(data) if isinstance(data, list) else 1} rules.")


def stream_posts(rules: list[dict] | None = None, max_posts: int = 0) -> None:
    """Stream posts matching filter rules in real-time.

    Args:
        rules: Optional new rules to set (replaces existing).
        max_posts: Stop after N posts (0 = unlimited).
    """
    if rules:
        delete_all_rules()
        set_rules(rules)

    client = get_client()
    count = 0

    # Handle Ctrl+C gracefully
    def signal_handler(sig, frame):
        print(f"\n\nStream stopped. {count} posts received.")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    print("Streaming... (Ctrl+C to stop)\n")

    try:
        for post in client.stream.posts():
            post_data = getattr(post, "data", None)
            if not post_data:
                continue

            if isinstance(post_data, dict):
                text = post_data.get("text", "")
            else:
                text = getattr(post_data, "text", "")

            count += 1
            print(f"[{count}] {text[:280]}")
            print()

            if max_posts and count >= max_posts:
                print(f"Reached {max_posts} posts. Stopping.")
                break
    except Exception as e:
        print(f"Stream error: {e}")
        raise


# --- Pre-built rule sets for Kalshi research ---

KALSHI_RULES = {
    "geopolitical": [
        {"value": "(Iran OR Khamenei OR Tehran OR IRGC) lang:en -is:retweet", "tag": "iran"},
        {"value": "(Israel OR IDF OR Netanyahu) lang:en -is:retweet", "tag": "israel"},
        {"value": '("regime change" OR sanctions OR "military strike") lang:en -is:retweet', "tag": "conflict"},
    ],
    "oil": [
        {"value": "(crude oil OR WTI OR Brent) lang:en -is:retweet", "tag": "crude"},
        {"value": "(OPEC OR EIA OR petroleum) lang:en -is:retweet", "tag": "opec-eia"},
        {"value": '("Strait of Hormuz" OR "oil supply" OR "oil prices") lang:en -is:retweet', "tag": "supply"},
    ],
    "fed": [
        {"value": "(FOMC OR \"federal reserve\" OR \"rate cut\" OR \"rate hike\") lang:en -is:retweet", "tag": "fed"},
        {"value": "(CPI OR inflation OR PCE OR \"core inflation\") lang:en -is:retweet", "tag": "inflation"},
    ],
    "politics": [
        {"value": "(\"government shutdown\" OR \"continuing resolution\" OR appropriations) lang:en -is:retweet", "tag": "shutdown"},
        {"value": "(Congress OR Senate OR \"House vote\") lang:en -is:retweet", "tag": "congress"},
    ],
    "breaking": [
        {"value": "(\"breaking news\" OR BREAKING) lang:en -is:retweet", "tag": "breaking"},
    ],
}
