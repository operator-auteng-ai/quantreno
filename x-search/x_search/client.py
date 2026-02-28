"""X API client wrapper using the official xdk."""

import os
from pathlib import Path
from dotenv import load_dotenv
from xdk import Client

# Load .env from the x-search project root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def get_client() -> Client:
    """Create an authenticated X API client from env vars."""
    bearer_token = os.environ.get("BEARER_TOKEN")
    if not bearer_token:
        raise RuntimeError(
            "BEARER_TOKEN not set. Add it to ~/projects/claude/x-search/.env\n"
            "  BEARER_TOKEN=your_token_here\n"
            "Get one from https://developer.x.com/en/portal/dashboard"
        )
    return Client(bearer_token=bearer_token)
