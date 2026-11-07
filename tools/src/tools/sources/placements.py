"""Street advertising placements in New York City: LinkNYC kiosks and bus shelters.

Both come from data.cityofnewyork.us. Only live kiosks are kept. The kiosk data
marks Link5G kiosks as carrying ads or not but says nothing about the older
Link1.0 kiosks, and the shelter data has no advertising field at all, so
carries_ads is "yes", "no" or "unknown".

load() returns a DataFrame: placement_id, kind ("linknyc" or "bus_shelter"),
kiosk_type, carries_ads, address, borough, latitude, longitude.
"""

import pandas as pd

from tools.sources._common import DATA, socrata

DOMAIN = "data.cityofnewyork.us"
LINKNYC = "s4kf-3yrf"
SHELTERS = "t4f2-8md7"
OUTPUT = DATA / "placements" / "nyc_placements.csv"

ADS_BY_KIOSK_TYPE = {"Link5G_Ad": "yes", "Link5G_NonAd": "no"}


def _kiosks() -> pd.DataFrame:
    rows = socrata(DOMAIN, LINKNYC, {"$where": "link_installation_status = 'Live'"})
    frame = pd.DataFrame(rows)
    return pd.DataFrame(
        {
            "placement_id": frame["link_site_id"],
            "kind": "linknyc",
            "kiosk_type": frame["planned_kiosk_type"],
            "carries_ads": frame["planned_kiosk_type"]
            .map(ADS_BY_KIOSK_TYPE)
            .fillna("unknown"),
            "address": frame["street_address"],
            "borough": frame["boro"],
            "latitude": frame["latitude"].astype(float),
            "longitude": frame["longitude"].astype(float),
        }
    )


def _shelters() -> pd.DataFrame:
    frame = pd.DataFrame(socrata(DOMAIN, SHELTERS, {}))
    return pd.DataFrame(
        {
            "placement_id": frame["shelter_id"],
            "kind": "bus_shelter",
            "kiosk_type": "",
            "carries_ads": "unknown",
            "address": frame["on_street"].str.title()
            + " & "
            + frame["cross_stre"].str.title(),
            "borough": frame["boro_name"].str.title(),
            "latitude": frame["latitude"].astype(float),
            "longitude": frame["longitude"].astype(float),
        }
    )


def _fetch() -> None:
    placements = pd.concat([_kiosks(), _shelters()], ignore_index=True)
    placements = placements.dropna(subset=["latitude", "longitude"])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    placements.to_csv(OUTPUT, index=False)
    print(f"Wrote {len(placements)} placements to {OUTPUT.relative_to(DATA.parent)}")


def load(refresh: bool = False) -> pd.DataFrame:
    if refresh or not OUTPUT.exists():
        _fetch()
    return pd.read_csv(OUTPUT, keep_default_na=False, na_values=[""])
