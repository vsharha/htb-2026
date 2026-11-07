"""Join every source onto New York City's census tracts for the map.

Run from tools/ with `uv run python -m tools.analyze`. Writes
data/analysis/nyc_tracts.geojson: one feature per tract with its Census
demographics, the subway riders passing nearby, and its advertising placements.
Startup-specific scoring and competitor campaigns are added by the web app.
"""

import geopandas as gpd
import pandas as pd

from tools.sources import census, placements, subway, tracts
from tools.sources._common import DATA

OUTPUT = DATA / "analysis" / "nyc_tracts.geojson"

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


def _with_placements(shapes: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    sites = placements.load()
    points = gpd.GeoDataFrame(
        sites,
        geometry=gpd.points_from_xy(sites["longitude"], sites["latitude"]),
        crs=4326,
    )
    joined = gpd.sjoin(points, shapes[["geoid", "geometry"]], predicate="within")
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


def main() -> None:
    shapes = tracts.load()
    shapes = _with_census(shapes)
    shapes = _with_subway(shapes)
    shapes = _with_placements(shapes)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    shapes.to_file(OUTPUT, driver="GeoJSON", COORDINATE_PRECISION=5)
    print(f"Wrote {len(shapes)} tracts to {OUTPUT.relative_to(DATA.parent)}")


if __name__ == "__main__":
    main()
