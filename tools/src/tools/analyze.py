"""Join every source onto New York City's census tracts for the map.

Run from tools/ with `uv run python -m tools.analyze`. Writes to data/analysis/:

- nyc_tracts.geojson: one feature per tract with its Census demographics, the
  subway riders passing nearby and its advertising placements. Each column in
  FEATURES also appears as `<column>_scaled`, its percentile rank from 0 to 1.
- columns.json: the FEATURES list, with each column's description and whether
  it measures where people live, work or pass through. The web app builds its
  Jev questions from the descriptions.
- nyc_placements.csv: every LinkNYC kiosk and bus shelter with its tract geoid.

Startup-specific scoring and competitor campaigns are added by the web app.
"""

import json

import geopandas as gpd
import pandas as pd

from tools.sources import census, placements, subway, tracts
from tools.sources._common import DATA, ROOT

OUTPUT = DATA / "analysis" / "nyc_tracts.geojson"
COLUMNS_OUTPUT = DATA / "analysis" / "columns.json"
PLACEMENTS_OUTPUT = DATA / "analysis" / "nyc_placements.csv"

# The tract columns audience fit can weight: a description of what a higher
# value means, and whether it measures where people live, work or pass through.
FEATURES = {
    "population": ("number of residents", "lives"),
    "median_age": ("median age of residents; higher means older", "lives"),
    "median_household_income": (
        "median household income of residents, capped at $250,001",
        "lives",
    ),
    "per_capita_income": ("income per resident", "lives"),
    "share_age_20_34": ("share of residents aged 20 to 34", "lives"),
    "share_degree": (
        "share of residents aged 25 and over with a bachelor's degree or higher",
        "lives",
    ),
    "share_income_150k": (
        "share of households with income of $150,000 or more",
        "lives",
    ),
    "share_college_students": ("share of residents enrolled in college", "lives"),
    "weekly_riders_nearby": (
        "weekly subway riders at stations within a five-minute walk",
        "passes",
    ),
}

# New York State Plane, Long Island zone, in feet. Buffering by a distance needs
# a projected coordinate system, and this one covers all five boroughs.
PROJECTED = 2263
# A station counts towards every tract within about a five-minute walk.
STATION_REACH_FEET = 1_300


def _with_census(shapes: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    people = pd.DataFrame(census.load()).drop(columns=["borough", "name"])
    numeric = people.columns.drop("geoid")
    people[numeric] = people[numeric].apply(pd.to_numeric, errors="coerce")
    return shapes.merge(people, on="geoid", how="left")


def _with_subway(shapes: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    stations, _ = subway.load()
    points = gpd.GeoDataFrame(
        stations,
        geometry=gpd.points_from_xy(stations["longitude"], stations["latitude"]),
        crs=4326,
    ).to_crs(PROJECTED)
    reach = points.copy()
    reach["geometry"] = points.buffer(STATION_REACH_FEET)
    joined = gpd.sjoin(
        shapes[["geoid", "geometry"]].to_crs(PROJECTED), reach, predicate="intersects"
    )
    per_tract = joined.groupby("geoid").agg(
        stations_nearby=("station_complex_id", "nunique"),
        weekly_riders_nearby=("weekly_riders", "sum"),
    )
    result = shapes.merge(per_tract, on="geoid", how="left")
    result["stations_nearby"] = result["stations_nearby"].fillna(0).astype(int)
    result["weekly_riders_nearby"] = result["weekly_riders_nearby"].fillna(0)
    return result


def _placements_with_tract(shapes: gpd.GeoDataFrame) -> pd.DataFrame:
    """Every placement with the geoid of the tract it stands in, if any."""
    sites = placements.load()
    points = gpd.GeoDataFrame(
        sites,
        geometry=gpd.points_from_xy(sites["longitude"], sites["latitude"]),
        crs=4326,
    )
    joined = gpd.sjoin(
        points, shapes[["geoid", "geometry"]], how="left", predicate="within"
    )
    return pd.DataFrame(joined.drop(columns=["geometry", "index_right"]))


def _with_placements(shapes: gpd.GeoDataFrame, sites: pd.DataFrame) -> gpd.GeoDataFrame:
    joined = sites.dropna(subset=["geoid"])
    counts = {
        "linknyc_ad_kiosks": (joined["kind"] == "linknyc")
        & (joined["carries_ads"] == "yes"),
        "linknyc_kiosks": joined["kind"] == "linknyc",
        "bus_shelters": joined["kind"] == "bus_shelter",
    }
    per_tract = pd.DataFrame(
        {name: joined[mask].groupby("geoid").size() for name, mask in counts.items()}
    )
    result = shapes.merge(per_tract, on="geoid", how="left")
    result[list(counts)] = result[list(counts)].fillna(0).astype(int)
    return result


def _with_scaled(shapes: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    result = shapes.copy()
    unpopulated = result["population"].fillna(0) == 0
    for column, (_, measures) in FEATURES.items():
        # Percentile rank, so skewed columns such as riders spread over 0 to 1.
        # A populated tract missing the raw value gets 0.5, the city median,
        # which neither raises nor lowers its weighted score. A tract with no
        # residents, such as a park or airport, gets 0 on resident columns so
        # empty land doesn't show as an average audience.
        scaled = result[column].rank(pct=True, method="average").fillna(0.5)
        if measures == "lives":
            scaled = scaled.mask(unpopulated, 0.0)
        result[f"{column}_scaled"] = scaled.round(4)
    return result


def _column_list() -> list[dict[str, str]]:
    return [
        {
            "name": name,
            "scaled": f"{name}_scaled",
            "description": description,
            "measures": measures,
        }
        for name, (description, measures) in FEATURES.items()
    ]


def main() -> None:
    shapes = tracts.load()
    shapes = _with_census(shapes)
    shapes = _with_subway(shapes)
    sites = _placements_with_tract(shapes)
    shapes = _with_placements(shapes, sites)
    shapes = _with_scaled(shapes)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    shapes.to_file(OUTPUT, driver="GeoJSON", COORDINATE_PRECISION=5)
    COLUMNS_OUTPUT.write_text(json.dumps(_column_list(), indent=2) + "\n")
    sites.to_csv(PLACEMENTS_OUTPUT, index=False)

    outside = sites["geoid"].isna().sum()
    print(f"Wrote {len(shapes)} tracts to {OUTPUT.relative_to(ROOT)}")
    print(f"Wrote {len(FEATURES)} columns to {COLUMNS_OUTPUT.relative_to(ROOT)}")
    print(
        f"Wrote {len(sites)} placements to {PLACEMENTS_OUTPUT.relative_to(ROOT)}, "
        f"{outside} outside every tract"
    )


if __name__ == "__main__":
    main()
