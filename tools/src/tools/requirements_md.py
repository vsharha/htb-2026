"""
Turn user requirements into a Markdown requirements doc that analysis code can compare against.

Interactive:   uv run python -m tools.requirements_md
From JSON:     uv run python -m tools.requirements_md --json brief.json -o requirements/acme.md
Parse back:    from tools.requirements_md import load_requirements; req = load_requirements("requirements/acme.md")

The .md has human-readable sections plus a fenced ```json block ("machine-readable")
holding the exact same data, so analysis code never has to parse prose.
"""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

# (key, prompt, type, default). type: str | int | float | list
FIELDS = [
    ("company", "Company name", "str", ""),
    ("industry", "Industry / product (one line)", "str", ""),
    (
        "campaign_goal",
        "Campaign goal (awareness / signups / sales / ...)",
        "str",
        "awareness",
    ),
    (
        "setting",
        "Physical setting (e.g. London Heathrow)",
        "str",
        "London Heathrow (EGLL)",
    ),
    ("audience_description", "Target audience in plain words", "str", ""),
    (
        "countries",
        "Target countries, ISO codes comma-sep (flight origin/destination)",
        "list",
        "",
    ),
    ("haul", "Haul: any / long / short", "str", "any"),
    ("direction", "Direction: both / arrivals / departures", "str", "both"),
    ("age_range", "Age range (e.g. 18-34)", "str", ""),
    ("income_band", "Income band (e.g. high, GBP 50k+)", "str", ""),
    ("interests", "Interests/behaviours, comma-sep", "list", ""),
    ("min_audience_per_day", "Minimum audience size per day (people)", "int", 1000),
    ("min_share_of_traffic", "Minimum share of venue traffic (0-1)", "float", 0.05),
    ("daily_budget_gbp", "Daily ad budget (GBP)", "float", 5000),
    ("campaign_days", "Campaign length (days)", "int", 14),
    ("preferred_hours", "Preferred hours, e.g. 06-10,17-20 (blank = any)", "str", ""),
    (
        "kpis",
        "KPIs, comma-sep (reach, cost per person reached, ...)",
        "list",
        "reach, cost per person reached",
    ),
    ("must_haves", "Must-have constraints, comma-sep", "list", ""),
    ("notes", "Anything else", "str", ""),
]

LABELS = {k: p for k, p, _, _ in FIELDS}


def coerce(val, typ, default):
    if val is None or (isinstance(val, str) and not val.strip()):
        val = default
    if typ == "int":
        return int(float(val))
    if typ == "float":
        return float(val)
    if typ == "list":
        if isinstance(val, list):
            return val
        return [
            x.strip().upper() if False else x.strip()
            for x in str(val).split(",")
            if x.strip()
        ]
    return str(val).strip()


def ask():
    print("Enter requirements (Enter = accept default).\n")
    out = {}
    for key, prompt, typ, default in FIELDS:
        shown = f" [{default}]" if default != "" else ""
        raw = input(f"{prompt}{shown}: ").strip()
        out[key] = coerce(raw, typ, default)
    return out


def normalise(d):
    out = {}
    for key, _, typ, default in FIELDS:
        out[key] = coerce(d.get(key), typ, default)
    out["countries"] = [c.upper() for c in out["countries"]]
    out["haul"] = out["haul"].lower()
    out["direction"] = out["direction"].lower()
    errs = []
    if not out["company"]:
        errs.append("company is required")
    if not out["countries"] and not out["audience_description"]:
        errs.append("give countries or an audience description")
    if out["haul"] not in ("any", "long", "short"):
        errs.append("haul must be any/long/short")
    if out["direction"] not in ("both", "arrivals", "departures"):
        errs.append("direction must be both/arrivals/departures")
    if not 0 <= out["min_share_of_traffic"] <= 1:
        errs.append("min_share_of_traffic must be 0-1")
    if errs:
        sys.exit("Invalid requirements:\n- " + "\n- ".join(errs))
    return out


def hours_list(spec):
    """'06-10,17-20' -> sorted list of hours [6..10,17..20]; blank -> []."""
    hrs = set()
    for part in filter(None, (p.strip() for p in spec.split(","))):
        a, _, b = part.partition("-")
        hrs.update(range(int(a), int(b or a) + 1))
    return sorted(hrs)


def to_markdown(r):
    r = dict(r)
    r["preferred_hours_list"] = hours_list(r["preferred_hours"])
    lst = lambda xs: ", ".join(xs) if xs else "-"
    md = f"""# Requirements: {r["company"]}

_Generated {date.today().isoformat()}_

## Summary
- **Industry:** {r["industry"] or "-"}
- **Goal:** {r["campaign_goal"]}
- **Setting:** {r["setting"]}

## Target audience
- **Description:** {r["audience_description"] or "-"}
- **Countries (flight origin/destination):** {lst(r["countries"])}
- **Haul:** {r["haul"]}
- **Direction:** {r["direction"]}
- **Age range:** {r["age_range"] or "-"}
- **Income band:** {r["income_band"] or "-"}
- **Interests:** {lst(r["interests"])}

> Country is a proxy (flight origin/destination), not passenger nationality.

## Size requirements
- **Minimum audience per day:** {r["min_audience_per_day"]:,} people
- **Minimum share of venue traffic:** {r["min_share_of_traffic"]:.1%}

## Budget and timing
- **Daily budget:** GBP {r["daily_budget_gbp"]:,.0f}
- **Campaign length:** {r["campaign_days"]} days
- **Total budget:** GBP {r["daily_budget_gbp"] * r["campaign_days"]:,.0f}
- **Preferred hours:** {r["preferred_hours"] or "any"}

## Success criteria
- **KPIs:** {lst(r["kpis"])}
- **Must-haves:** {lst(r["must_haves"])}

## Notes
{r["notes"] or "-"}

## Machine-readable
```json
{json.dumps(r, indent=2)}
```
"""
    return md


def load_requirements(path):
    """Parse the JSON block out of a generated .md. Use this in analysis code."""
    text = Path(path).read_text(encoding="utf-8")
    m = re.search(r"```json\n(.*?)\n```", text, re.DOTALL)
    if not m:
        raise ValueError(f"No machine-readable JSON block in {path}")
    return json.loads(m.group(1))


def check_against(req, daily_people, share, peak_hours=()):
    """Compare analysis results to requirements. Returns list of (check, passed, detail)."""
    res = [
        (
            "min audience/day",
            daily_people >= req["min_audience_per_day"],
            f"{daily_people:,} vs required {req['min_audience_per_day']:,}",
        ),
        (
            "min share of traffic",
            share >= req["min_share_of_traffic"],
            f"{share:.1%} vs required {req['min_share_of_traffic']:.1%}",
        ),
    ]
    want = set(req.get("preferred_hours_list", []))
    if want and peak_hours:
        ok = any(h in want for h in peak_hours)
        res.append(
            (
                "peak in preferred hours",
                ok,
                f"peaks {sorted(peak_hours)} vs wanted {sorted(want)}",
            )
        )
    return res


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "requirements"


def main():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    p.add_argument("--json", help="read answers from a JSON file instead of prompting")
    p.add_argument(
        "-o", "--out", help="output path (default requirements/<company>.md)"
    )
    a = p.parse_args()

    raw = json.loads(Path(a.json).read_text(encoding="utf-8")) if a.json else ask()
    req = normalise(raw)
    out = a.out or f"requirements/{slug(req['company'])}.md"
    import os

    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(to_markdown(req))
    print(f"\nWrote {out}")


if __name__ == "__main__":
    main()
