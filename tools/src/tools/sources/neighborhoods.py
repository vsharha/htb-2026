"""Neighbourhood names for New York City's census tracts.

Uses the city planning department's equivalency between 2020 census tracts and
2020 Neighborhood Tabulation Areas (NTAs), the neighbourhoods the city itself
publishes statistics for, such as "Chelsea-Hudson Yards". load() returns one
row per tract from data/neighborhoods/nyc_tract_neighborhoods.csv: geoid and
neighborhood.
"""

import pandas as pd

from tools.sources._common import DATA, socrata

DOMAIN = "data.cityofnewyork.us"
EQUIVALENCY = "hm78-6dwm"
OUTPUT = DATA / "neighborhoods" / "nyc_tract_neighborhoods.csv"


def _fetch() -> None:
    frame = pd.DataFrame(socrata(DOMAIN, EQUIVALENCY, {}))
    result = pd.DataFrame({"geoid": frame["geoid"], "neighborhood": frame["ntaname"]})
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.sort_values("geoid").to_csv(OUTPUT, index=False)
    print(
        f"Wrote {len(result)} tract neighbourhoods to {OUTPUT.relative_to(DATA.parent)}"
    )


def load(refresh: bool = False) -> pd.DataFrame:
    if refresh or not OUTPUT.exists():
        _fetch()
    return pd.read_csv(OUTPUT, dtype={"geoid": str})
