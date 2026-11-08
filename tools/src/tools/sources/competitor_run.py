"""Record the web app's sample competitor research for an offline demo fallback."""

import json
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import Request, urlopen

OUTPUT = Path(__file__).resolve().parents[4] / "data/competitors/sample-run.json"
BRIEF = {
    "industry": "Consumer app",
    "description": "a dating app for people looking for a serious relationship",
    "targetCustomer": "single professionals in their late twenties and thirties living in Manhattan and Brooklyn",
    "customerPays": {"amount": 30, "per": "month"},
    "monthlyBudget": 8000,
    "city": "new-york",
    "markets": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
}


def load(refresh: bool = False, base_url: str = "http://localhost:3000") -> dict:
    """Read the recording, or capture a complete live run from the web app."""
    if OUTPUT.exists() and not refresh:
        return json.loads(OUTPUT.read_text())
    request = Request(
        f"{base_url.rstrip('/')}/api/competitors",
        data=json.dumps(BRIEF).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    events = []
    with urlopen(request, timeout=190) as response:
        for line in response:
            if not line.startswith(b"data: ") or line.strip() == b"data: [DONE]":
                continue
            chunk = json.loads(line[6:])
            if chunk.get("type") == "data-agent":
                event = chunk["data"]
                events.append(event)
                print(event["type"], event.get("message", ""), flush=True)
    if (
        not events
        or events[-1]["type"] != "done"
        or any(event["type"] in {"error", "recording"} for event in events)
        or not any(event["type"] == "competitor" for event in events)
    ):
        raise RuntimeError(
            "Only complete live research with verified competitors can be recorded"
        )
    recording = {
        "recordedAt": datetime.now(UTC).isoformat(),
        "brief": BRIEF,
        "events": events,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(recording, indent=2) + "\n")
    return recording
