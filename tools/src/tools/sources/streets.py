"""New York street intersections, from the city's street centerline.

Uses the NYC Street Centerline (CSCL) dataset on data.cityofnewyork.us. Each row
is one street segment with its name and line geometry. Segments that share an
endpoint meet at an intersection, so every endpoint shared by two differently
named streets becomes one intersection.

Street names are normalised the same way as `web/src/lib/street-names.ts`, so the
web app can look up "54th Street and Broadway" as "54 ST" and "BROADWAY". The
leading compass word (W 54 ST) is dropped, because sources rarely include it.
Points for the same pair of names within 300 metres, such as the two
carriageways of a divided avenue, are merged into their average.

load() returns a DataFrame with street_a, street_b (alphabetical), borough,
latitude and longitude, one row per merged intersection.
"""

import json
import math
import re
from collections import defaultdict

import pandas as pd

from tools.sources._common import DATA, socrata

DOMAIN = "data.cityofnewyork.us"
DATASET = "inkn-q76z"
RAW_DIR = DATA / "raw" / "streets"
RAW = RAW_DIR / "centerline.json"
OUT_DIR = DATA / "streets"
INTERSECTIONS = OUT_DIR / "intersections.csv"

BOROUGHS = {
    "1": "Manhattan",
    "2": "Bronx",
    "3": "Brooklyn",
    "4": "Queens",
    "5": "Staten Island",
}
MERGE_METRES = 300

WORDS = {
    "STREET": "ST",
    "AVENUE": "AVE",
    "AV": "AVE",
    "PLACE": "PL",
    "ROAD": "RD",
    "BOULEVARD": "BLVD",
    "DRIVE": "DR",
    "SQUARE": "SQ",
    "PARKWAY": "PKWY",
    "LANE": "LN",
    "TERRACE": "TER",
    "COURT": "CT",
    "EXPRESSWAY": "EXPY",
    "HIGHWAY": "HWY",
    "WEST": "W",
    "EAST": "E",
    "NORTH": "N",
    "SOUTH": "S",
    "FIRST": "1",
    "SECOND": "2",
    "THIRD": "3",
    "FOURTH": "4",
    "FIFTH": "5",
    "SIXTH": "6",
    "SEVENTH": "7",
    "EIGHTH": "8",
    "NINTH": "9",
    "TENTH": "10",
    "ELEVENTH": "11",
    "TWELFTH": "12",
}
ALIASES = {"AVE OF THE AMERICAS": "6 AVE"}


def street_key(name: str) -> str:
    """Normalise a street name for matching; must match street-names.ts."""
    text = re.sub(r"[^A-Z0-9 ]+", " ", name.upper())
    tokens = [re.sub(r"^(\d+)(ST|ND|RD|TH)$", r"\1", t) for t in text.split()]
    tokens = [WORDS.get(t, t) for t in tokens]
    if len(tokens) > 1 and tokens[0] in {"W", "E", "N", "S"}:
        tokens = tokens[1:]
    key = " ".join(tokens)
    return ALIASES.get(key, key)


def _segments() -> list[dict]:
    if RAW.exists():
        return json.loads(RAW.read_text())
    rows = socrata(
        DOMAIN,
        DATASET,
        {"$select": "full_street_name,boroughcode,the_geom", "$order": "objectid"},
    )
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    RAW.write_text(json.dumps(rows))
    return rows


def _endpoints(geometry: dict) -> list[tuple[float, float]]:
    points = []
    for line in geometry.get("coordinates", []):
        if line:
            points.extend([tuple(line[0]), tuple(line[-1])])
    return points


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    dx = (a[0] - b[0]) * 111_320 * math.cos(math.radians(40.7))
    dy = (a[1] - b[1]) * 110_540
    return math.hypot(dx, dy)


def _build() -> pd.DataFrame:
    names_at: dict[tuple[float, float], set[str]] = defaultdict(set)
    borough_at: dict[tuple[float, float], str] = {}
    for row in _segments():
        name = row.get("full_street_name")
        geometry = row.get("the_geom")
        if not name or not geometry:
            continue
        key = street_key(name)
        for lon, lat in _endpoints(geometry):
            point = (round(lon, 6), round(lat, 6))
            names_at[point].add(key)
            borough_at.setdefault(point, BOROUGHS.get(row.get("boroughcode", ""), ""))

    clusters: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for point, names in names_at.items():
        ordered = sorted(names)
        for i, a in enumerate(ordered):
            for b in ordered[i + 1 :]:
                groups = clusters[(a, b)]
                for group in groups:
                    if _distance(group["points"][0], point) <= MERGE_METRES:
                        group["points"].append(point)
                        break
                else:
                    groups.append({"points": [point], "borough": borough_at[point]})

    records = []
    for (a, b), groups in clusters.items():
        for group in groups:
            points = group["points"]
            records.append(
                {
                    "street_a": a,
                    "street_b": b,
                    "borough": group["borough"],
                    "latitude": round(sum(p[1] for p in points) / len(points), 5),
                    "longitude": round(sum(p[0] for p in points) / len(points), 5),
                }
            )
    return pd.DataFrame(records).sort_values(["street_a", "street_b", "borough"])


def load(refresh: bool = False) -> pd.DataFrame:
    if INTERSECTIONS.exists() and not refresh:
        return pd.read_csv(INTERSECTIONS)
    frame = _build()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frame.to_csv(INTERSECTIONS, index=False)
    return frame
