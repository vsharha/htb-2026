"""Paths and HTTP helpers shared by the source modules."""

import json
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import certifi

ROOT = Path(__file__).resolve().parents[4]
DATA = ROOT / "data"

# Census county codes for the five boroughs, in state 36 (New York).
NYC_COUNTIES = {
    "005": "Bronx",
    "047": "Brooklyn",
    "061": "Manhattan",
    "081": "Queens",
    "085": "Staten Island",
}

USER_AGENT = "htb-2026-tools"
PAGE_SIZE = 50_000
# The Python builds uv installs don't use the macOS certificate store, and fail
# to verify data.cityofnewyork.us without certifi's bundle.
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


def download(url: str, target: Path, attempts: int = 4) -> Path:
    """Download url to target unless target already exists."""
    if target.exists():
        return target
    target.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(
                request, timeout=300, context=SSL_CONTEXT
            ) as response:
                target.write_bytes(response.read())
            return target
        except urllib.error.URLError, TimeoutError:
            if attempt == attempts - 1:
                raise
            time.sleep(2**attempt)
    return target


def socrata(domain: str, dataset: str, params: dict[str, str]) -> list[dict[str, Any]]:
    """Fetch every row of a Socrata query, paging through results.

    Socrata is the platform behind data.cityofnewyork.us and data.ny.gov. Large
    aggregate queries time out on its servers, so callers should keep each query
    small, for example one day at a time.
    """
    rows: list[dict[str, Any]] = []
    offset = 0
    while True:
        query = urllib.parse.urlencode(
            {**params, "$limit": str(PAGE_SIZE), "$offset": str(offset)}
        )
        url = f"https://{domain}/resource/{dataset}.json?{query}"
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(
                    request, timeout=300, context=SSL_CONTEXT
                ) as response:
                    page = json.load(response)
                break
            except urllib.error.URLError, TimeoutError:
                if attempt == 3:
                    raise
                time.sleep(2**attempt)
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE
