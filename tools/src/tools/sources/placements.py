"""Street advertising placements in New York City: LinkNYC kiosks and bus shelters.

Both come from data.cityofnewyork.us. Only live kiosks are kept. The kiosk data
marks Link5G kiosks as carrying ads or not but says nothing about the older
Link1.0 kiosks, and the shelter data has no advertising field at all, so
carries_ads is "yes", "no" or "unknown".

load() returns a DataFrame: placement_id, kind ("linknyc" or "bus_shelter"),
kiosk_type, carries_ads, address, borough, latitude, longitude.
"""

import re

import pandas as pd

from tools.sources._common import DATA, socrata

DOMAIN = "data.cityofnewyork.us"
LINKNYC = "s4kf-3yrf"
SHELTERS = "t4f2-8md7"
OUTPUT = DATA / "placements" / "nyc_placements.csv"

ADS_BY_KIOSK_TYPE = {"Link5G_Ad": "yes", "Link5G_NonAd": "no"}

# The kiosk data writes "675 6 AVENUE" and the shelter data "9 Av & W 55 St".
# Addresses are shown to marketers as "675 6th Ave" and "9th Ave & W 55th St".
SUFFIXES = {
    "STREET": "St",
    "ST": "St",
    "AVENUE": "Ave",
    "AV": "Ave",
    "AVE": "Ave",
    "BOULEVARD": "Blvd",
    "BLVD": "Blvd",
    "ROAD": "Rd",
    "RD": "Rd",
    "PLACE": "Pl",
    "PL": "Pl",
    "DRIVE": "Dr",
    "DR": "Dr",
    "LANE": "Ln",
    "PARKWAY": "Pkwy",
    "PKWY": "Pkwy",
    "HIGHWAY": "Hwy",
    "HWY": "Hwy",
    "EXPRESSWAY": "Expy",
    "EXPWY": "Expy",
    "EXPY": "Expy",
    "TURNPIKE": "Tpke",
    "TERRACE": "Ter",
    "COURT": "Ct",
    "SQUARE": "Sq",
}
DIRECTIONS = {"EAST": "E", "WEST": "W", "NORTH": "N", "SOUTH": "S"}


def _ordinal(number: str) -> str:
    n = int(number)
    if 10 <= n % 100 <= 20:
        return f"{n}th"
    return f"{n}{ {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th') }"


def _clean_part(part: str, house_number: bool) -> str:
    words = part.split()
    out: list[str] = []
    for i, word in enumerate(words):
        upper = word.upper().rstrip(",")
        following = words[i + 1].upper() if i + 1 < len(words) else ""
        if house_number and i == 0:
            out.append(word)
        elif upper.isdigit() and following in SUFFIXES:
            out.append(_ordinal(upper))
        elif upper in SUFFIXES:
            out.append(SUFFIXES[upper])
        elif upper in DIRECTIONS and following.isdigit():
            out.append(DIRECTIONS[upper])
        elif word.isupper() and len(word) > 2 or word.islower():
            out.append(word.title())
        else:
            out.append(word)
    return " ".join(out)


def clean_address(address: str, house_number: bool) -> str:
    """Title-case an address, shorten its street types and add ordinals.

    A kiosk address starts with a house number, which is left alone; a shelter
    address is two streets joined by " & ", and has none.
    """
    parts = re.split(r"\s+&\s+", address.strip())
    return " & ".join(
        _clean_part(p, house_number and i == 0) for i, p in enumerate(parts)
    )


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
    sites = pd.read_csv(OUTPUT, keep_default_na=False, na_values=[""])
    sites["address"] = [
        clean_address(a, kind == "linknyc")
        for a, kind in zip(sites["address"], sites["kind"], strict=True)
    ]
    return sites
