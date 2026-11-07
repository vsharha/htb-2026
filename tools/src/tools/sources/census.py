"""American Community Survey data for every census tract in New York City.

load() returns one row per tract from data/census/nyc_tracts.csv, fetching it
first if the file doesn't exist. Fetching reads CENSUS_API_KEY from tools/.env
or the environment and keeps the raw API responses in data/raw/census/.
"""

import csv
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

YEAR = "2024"
DATASET = f"https://api.census.gov/data/{YEAR}/acs/acs5"
STATE = "36"
# Bronx, Brooklyn (Kings), Manhattan (New York), Queens, Staten Island (Richmond).
COUNTIES = {
    "005": "Bronx",
    "047": "Brooklyn",
    "061": "Manhattan",
    "081": "Queens",
    "085": "Staten Island",
}

# Age 20 to 34: male rows 8 to 12 and female rows 32 to 36 of table B01001.
AGE_20_34 = [f"B01001_{n:03d}E" for n in [*range(8, 13), *range(32, 37)]]
# Bachelor's, master's, professional and doctorate degrees, of people aged 25+.
DEGREE = [f"B15003_{n:03d}E" for n in range(22, 26)]
# Household income of $150,000 or more.
INCOME_150K = ["B19001_016E", "B19001_017E"]
# Enrolled in college as an undergraduate or graduate student.
COLLEGE = ["B14001_008E", "B14001_009E"]

VARIABLES = [
    "B01003_001E",  # total population
    "B01002_001E",  # median age
    "B19013_001E",  # median household income
    "B19301_001E",  # per capita income
    "B19001_001E",  # households
    "B15003_001E",  # population aged 25+
    *AGE_20_34,
    *DEGREE,
    *INCOME_150K,
    *COLLEGE,
]

ROOT = Path(__file__).resolve().parents[4]
RAW_DIR = ROOT / "data" / "raw" / "census"
OUT_DIR = ROOT / "data" / "census"
OUTPUT = OUT_DIR / "nyc_tracts.csv"
ENV_FILE = ROOT / "tools" / ".env"

ATTEMPTS = 8


def load_key() -> str:
    key = os.environ.get("CENSUS_API_KEY", "")
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            name, _, value = line.partition("=")
            if name.strip() == "CENSUS_API_KEY":
                key = value.strip().strip("\"'")
    if not key:
        raise SystemExit(f"CENSUS_API_KEY is not set in the environment or {ENV_FILE}")
    return key


def fetch(variables: list[str], county: str, key: str) -> list[list[str]]:
    """Fetch one county's tracts, retrying while the API calls the key invalid.

    A newly activated key is accepted by some Census servers and rejected by
    others for a while, so "Invalid Key" responses are retried with backoff.
    Errors never include the URL, because it contains the key.
    """
    query = urllib.parse.urlencode(
        {
            "get": ",".join(["NAME", *variables]),
            "for": "tract:*",
            "in": f"state:{STATE} county:{county}",
            "key": key,
        }
    )
    for attempt in range(ATTEMPTS):
        try:
            with urllib.request.urlopen(f"{DATASET}?{query}", timeout=120) as response:
                body = response.read().decode()
        except urllib.error.HTTPError as error:
            raise SystemExit(f"Census API returned HTTP {error.code}") from None
        except urllib.error.URLError as error:
            raise SystemExit(f"Census API unreachable: {error.reason}") from None
        if body.startswith("["):
            return json.loads(body)
        if "Invalid Key" not in body:
            raise SystemExit("Census API returned an unexpected non-JSON response")
        time.sleep(2**attempt)
    raise SystemExit(f"Census API rejected the key {ATTEMPTS} times; is it activated?")


def number(value: str | None) -> float | None:
    # The API marks missing or suppressed estimates with large negative codes.
    if value is None or value == "":
        return None
    parsed = float(value)
    return None if parsed < 0 else parsed


def share(row: dict[str, str], parts: list[str], total: str) -> float | None:
    denominator = number(row[total])
    values = [number(row[part]) for part in parts]
    if not denominator or any(value is None for value in values):
        return None
    return round(sum(values) / denominator, 4)


def _fetch() -> None:
    key = load_key()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    tracts: list[dict[str, str]] = []
    for county, borough in COUNTIES.items():
        table = fetch(VARIABLES, county, key)
        (RAW_DIR / f"acs5_{YEAR}_{county}.json").write_text(json.dumps(table))
        header, *rows = table
        for values in rows:
            row = dict(zip(header, values, strict=True))
            row["borough"] = borough
            tracts.append(row)
        print(f"{borough}: {len(rows)} tracts")

    fields = [
        "geoid",
        "borough",
        "name",
        "population",
        "median_age",
        "median_household_income",
        "per_capita_income",
        "share_age_20_34",
        "share_degree",
        "share_income_150k",
        "share_college_students",
    ]
    with OUTPUT.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for row in tracts:
            population = row["B01003_001E"]
            writer.writerow(
                {
                    "geoid": row["state"] + row["county"] + row["tract"],
                    "borough": row["borough"],
                    "name": row["NAME"],
                    "population": number(population),
                    "median_age": number(row["B01002_001E"]),
                    "median_household_income": number(row["B19013_001E"]),
                    "per_capita_income": number(row["B19301_001E"]),
                    "share_age_20_34": share(row, AGE_20_34, "B01003_001E"),
                    "share_degree": share(row, DEGREE, "B15003_001E"),
                    "share_income_150k": share(row, INCOME_150K, "B19001_001E"),
                    "share_college_students": share(row, COLLEGE, "B01003_001E"),
                }
            )
    print(f"Wrote {len(tracts)} tracts to {OUTPUT.relative_to(ROOT)}")


def load(refresh: bool = False) -> list[dict[str, str]]:
    """Return one row per tract, keyed by the column names of nyc_tracts.csv.

    Values are strings as read from the CSV; an empty string means the Census
    Bureau published no estimate for that tract.
    """
    if refresh or not OUTPUT.exists():
        _fetch()
    with OUTPUT.open(newline="") as file:
        return list(csv.DictReader(file))
