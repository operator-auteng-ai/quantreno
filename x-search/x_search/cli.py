"""CLI for X API search and stream tools."""

import argparse
import sys
from .search import search_and_print
from .stream import stream_posts, KALSHI_RULES, get_rules, delete_all_rules


def main():
    parser = argparse.ArgumentParser(
        description="X API search and stream tools for Kalshi market research"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # --- search ---
    search_parser = subparsers.add_parser("search", help="Search recent posts (last 7 days)")
    search_parser.add_argument("query", help="Search query (e.g. 'oil prices OPEC -is:retweet')")
    search_parser.add_argument("-n", "--max-results", type=int, default=20, help="Max results (default: 20)")

    # --- stream ---
    stream_parser = subparsers.add_parser("stream", help="Stream posts in real-time")
    stream_parser.add_argument(
        "preset",
        nargs="?",
        choices=list(KALSHI_RULES.keys()),
        help=f"Pre-built rule set: {', '.join(KALSHI_RULES.keys())}",
    )
    stream_parser.add_argument("-q", "--query", help="Custom stream rule query")
    stream_parser.add_argument("-n", "--max-posts", type=int, default=0, help="Stop after N posts (0 = unlimited)")

    # --- rules ---
    rules_parser = subparsers.add_parser("rules", help="Manage stream filter rules")
    rules_parser.add_argument("action", choices=["list", "clear"], help="List or clear rules")

    args = parser.parse_args()

    if args.command == "search":
        search_and_print(args.query, args.max_results)

    elif args.command == "stream":
        if args.query:
            rules = [{"value": args.query, "tag": "custom"}]
        elif args.preset:
            rules = KALSHI_RULES[args.preset]
        else:
            parser.error("Provide a preset name or --query for custom rules")
            return
        stream_posts(rules=rules, max_posts=args.max_posts)

    elif args.command == "rules":
        if args.action == "list":
            rules = get_rules()
            if rules:
                for r in rules:
                    if isinstance(r, dict):
                        print(f"  [{r.get('tag', '?')}] {r.get('value', '')}")
                    else:
                        print(f"  [{getattr(r, 'tag', '?')}] {getattr(r, 'value', '')}")
            else:
                print("No active rules.")
        elif args.action == "clear":
            delete_all_rules()
            print("All rules cleared.")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
