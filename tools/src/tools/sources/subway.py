"""MTA subway ridership per station complex and hour of the week.

Averages four full weeks, Monday 5 October to Sunday 1 November 2026, from the
MTA Subway Hourly Ridership dataset on data.ny.gov. Queries spanning weeks time
out on the server, so the data is fetched one day at a time.

load() returns two DataFrames:
- stations: station_complex_id, station_complex, borough, latitude, longitude,
  weekly_riders, and the share of riders on each fare class
- hourly: station_complex_id, weekday (0 = Monday), hour, riders (the average
  for that hour across the four weeks)
"""

import json
from datetime import date, datetime, timedelta

import pandas as pd

from tools.sources._common import DATA, socrata

DOMAIN = "data.ny.gov"
DATASET = "5wq4-mkjj"
START = date(2026, 10, 5)
WEEKS = 4
RAW_DIR = DATA / "raw" / "subway"
OUT_DIR = DATA / "subway"
STATIONS = OUT_DIR / "stations.csv"
HOURLY = OUT_DIR / "hourly.csv"

# Fare class categories as the MTA names them, mapped to output column names.
FARE_CLASSES = {
    "Metrocard - Full Fare": "full_fare",
    "OMNY - Full Fare": "full_fare",
    "Metrocard - Unlimited 7-Day": "unlimited",
    "Metrocard - Unlimited 30-Day": "unlimited",
    "Metrocard - Students": "students",
    "OMNY - Students": "students",
    "Metrocard - Seniors & Disability": "seniors_disability",
    "OMNY - Seniors & Disability": "seniors_disability",
    "Metrocard - Fair Fare": "fair_fare",
    "OMNY - Fair Fare": "fair_fare",
    "Metrocard - Other": "other",
    "OMNY - Other": "other",
}


def _day(day: date) -> list[dict]:
    cache = RAW_DIR / f"{day.isoformat()}.json"
    if cache.exists():
        return json.loads(cache.read_text())
    following = day + timedelta(days=1)
    rows = socrata(
        DOMAIN,
        DATASET,
        {
            "$select": "station_complex_id,transit_timestamp,fare_class_category,"
            "sum(ridership) as riders",
            "$where": f"transit_timestamp >= '{day.isoformat()}T00:00:00' "
            f"AND transit_timestamp < '{following.isoformat()}T00:00:00'",
            "$group": "station_complex_id,transit_timestamp,fare_class_category",
        },
    )
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(rows))
    return rows


def _fetch() -> None:
    days = [START + timedelta(days=n) for n in range(WEEKS * 7)]
    rows = []
    for day in days:
        rows.extend(_day(day))
    frame = pd.DataFrame(rows)
    frame["riders"] = frame["riders"].astype(float)
    timestamps = frame["transit_timestamp"].map(datetime.fromisoformat)
    frame["weekday"] = timestamps.map(lambda t: t.weekday())
    frame["hour"] = timestamps.map(lambda t: t.hour)

    hourly = (
        frame.groupby(["station_complex_id", "weekday", "hour"])["riders"].sum() / WEEKS
    ).round(1)

    names = socrata(
        DOMAIN,
        DATASET,
        {
            "$select": "station_complex_id,station_complex,borough,latitude,longitude",
            "$where": f"transit_timestamp >= '{START.isoformat()}T00:00:00' "
            f"AND transit_timestamp < '{(START + timedelta(days=1)).isoformat()}"
            "T00:00:00'",
            "$group": "station_complex_id,station_complex,borough,latitude,longitude",
        },
    )
    stations = pd.DataFrame(names).drop_duplicates("station_complex_id")
    stations = stations.set_index("station_complex_id")
    stations["weekly_riders"] = (
        frame.groupby("station_complex_id")["riders"].sum() / WEEKS
    ).round(0)

    frame["fare_class"] = frame["fare_class_category"].map(FARE_CLASSES).fillna("other")
    by_class = frame.pivot_table(
        index="station_complex_id", columns="fare_class", values="riders", aggfunc="sum"
    ).fillna(0)
    shares = by_class.div(by_class.sum(axis=1), axis=0).round(4).add_prefix("share_")
    stations = stations.join(shares)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stations.reset_index().to_csv(STATIONS, index=False)
    hourly.reset_index().to_csv(HOURLY, index=False)
    print(f"Wrote {len(stations)} stations to {STATIONS.relative_to(DATA.parent)}")


def load(refresh: bool = False) -> tuple[pd.DataFrame, pd.DataFrame]:
    if refresh or not (STATIONS.exists() and HOURLY.exists()):
        _fetch()
    return (
        pd.read_csv(STATIONS, dtype={"station_complex_id": str}),
        pd.read_csv(HOURLY, dtype={"station_complex_id": str}),
    )
