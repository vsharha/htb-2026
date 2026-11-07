"""Census tract boundaries for New York City.

Uses the Census Bureau's 2024 cartographic boundary file for New York State,
which is clipped to the shoreline, so tracts don't extend over the water.
load() returns a GeoDataFrame with one row per tract: geoid, borough, geometry.
"""

import zipfile

import geopandas as gpd

from tools.sources._common import DATA, NYC_COUNTIES, download

URL = "https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_36_tract_500k.zip"
RAW_DIR = DATA / "raw" / "tracts"
OUTPUT = DATA / "tracts" / "nyc_tracts.geojson"


def _fetch() -> None:
    archive = download(URL, RAW_DIR / "cb_2024_36_tract_500k.zip")
    with zipfile.ZipFile(archive) as file:
        file.extractall(RAW_DIR)
    tracts = gpd.read_file(RAW_DIR / "cb_2024_36_tract_500k.shp")
    tracts = tracts[tracts["COUNTYFP"].isin(NYC_COUNTIES)].copy()
    tracts["borough"] = tracts["COUNTYFP"].map(NYC_COUNTIES)
    tracts = tracts.rename(columns={"GEOID": "geoid"})[["geoid", "borough", "geometry"]]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    tracts.to_crs(4326).to_file(OUTPUT, driver="GeoJSON", COORDINATE_PRECISION=5)
    print(f"Wrote {len(tracts)} tracts to {OUTPUT.relative_to(DATA.parent)}")


def load(refresh: bool = False) -> gpd.GeoDataFrame:
    if refresh or not OUTPUT.exists():
        _fetch()
    return gpd.read_file(OUTPUT)
