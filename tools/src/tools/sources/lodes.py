"""Jobs by workplace for every census tract in New York City.

Uses the Census Bureau's LODES version 8 workplace area characteristics file
for New York State: every job counted at the census block where it is done,
all job types, for 2024. load() returns one row per tract with any jobs from
data/lodes/nyc_tract_jobs.csv: geoid, the number of jobs, and the share of
those jobs by worker age, earnings, education and industry sector. Fetching
keeps the downloaded file in data/raw/lodes/.
"""

import pandas as pd

from tools.sources._common import DATA, NYC_COUNTIES, download

YEAR = "2024"
FILE = f"ny_wac_S000_JT00_{YEAR}.csv.gz"
URL = f"https://lehd.ces.census.gov/data/lodes/LODES8/ny/wac/{FILE}"
RAW_DIR = DATA / "raw" / "lodes"
OUTPUT = DATA / "lodes" / "nyc_tract_jobs.csv"

# Output share column: the LODES columns it sums, divided by all jobs (C000).
SHARES = {
    "share_jobs_age_29_under": ["CA01"],
    "share_jobs_high_earnings": ["CE03"],
    "share_jobs_information": ["CNS09"],
    "share_jobs_finance": ["CNS10"],
    "share_jobs_professional": ["CNS12"],
    "share_jobs_education": ["CNS15"],
    "share_jobs_health": ["CNS16"],
    "share_jobs_retail": ["CNS07"],
    "share_jobs_arts": ["CNS17"],
    "share_jobs_food": ["CNS18"],
}
# LODES reports education only for workers aged 30 and over (CD01 to CD04), so
# the degree share is of those jobs, not of all jobs.
EDUCATION = ["CD01", "CD02", "CD03", "CD04"]


def _fetch() -> None:
    raw = download(URL, RAW_DIR / FILE)
    blocks = pd.read_csv(raw, dtype={"w_geocode": str})
    # A block geocode is the 11-digit tract geoid followed by a 4-digit block.
    blocks["geoid"] = blocks["w_geocode"].str[:11]
    blocks = blocks[blocks["w_geocode"].str[2:5].isin(NYC_COUNTIES)]

    columns = ["C000", *{c for cs in SHARES.values() for c in cs}, *EDUCATION]
    tracts = blocks.groupby("geoid")[columns].sum()
    result = pd.DataFrame({"jobs": tracts["C000"]})
    for name, sources in SHARES.items():
        result[name] = (tracts[sources].sum(axis=1) / tracts["C000"]).round(4)
    result["share_jobs_degree"] = (
        tracts["CD04"] / tracts[EDUCATION].sum(axis=1).where(lambda s: s > 0)
    ).round(4)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.reset_index().to_csv(OUTPUT, index=False)
    print(f"Wrote {len(result)} tracts to {OUTPUT.relative_to(DATA.parent)}")


def load(refresh: bool = False) -> pd.DataFrame:
    if refresh or not OUTPUT.exists():
        _fetch()
    return pd.read_csv(OUTPUT, dtype={"geoid": str})
