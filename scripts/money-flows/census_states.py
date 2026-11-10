#!/usr/bin/env python3
"""Build site/education/money-flows/data_states.js from the Census FY2024
Annual Survey of School System Finances summary tables.

Usage:
  curl -o /tmp/elsec24t.xlsx \
    https://www2.census.gov/programs-surveys/school-finances/tables/2024/secondary-education-finance/elsec24t.xlsx
  curl -o /tmp/elsec24_sumtables.xlsx \
    https://www2.census.gov/programs-surveys/school-finances/tables/2024/secondary-education-finance/elsec24_sumtables.xlsx
  python3 scripts/money-flows/census_states.py /tmp/elsec24_sumtables.xlsx /tmp/elsec24t.xlsx

Needs openpyxl (pip install openpyxl). All dollar values in the output are
thousands of dollars, exactly as Census publishes them; per-pupil values are dollars.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

SRC = "https://www.census.gov/data/tables/2024/econ/school-finances/secondary-education-finance.html"
OUT = Path(__file__).resolve().parents[2] / "site/education/money-flows/data_states.js"

POSTAL = {
    "United States": "US", "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY",
    "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
    "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE",
    "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
    "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
    "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
    "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY",
}

# (table, output key, column index among numeric cells after the name)
FIELDS = [
    ("1", "rev", 0), ("1", "fed", 1), ("1", "state", 2), ("4", "local", 0),
    ("1", "exp", 4), ("1", "current", 5), ("1", "capital", 6), ("1", "otherExp", 7),
    ("1", "debt", 8),
    ("2", "fedTitle1", 2), ("2", "fedSpecEd", 3), ("2", "fedMeals", 4), ("2", "fedDirect", 7),
    ("3", "stFormula", 1), ("3", "stOnBehalf", 7),
    ("4", "locProperty", 1), ("4", "locOtherTax", 2), ("4", "locParentGov", 3),
    ("6", "instruction", 3), ("6", "support", 6), ("6", "otherCurrent", 9),
    ("6", "salaries", 1), ("6", "benefits", 2),
    ("9", "interest", 5), ("9", "toOtherGov", 6),
    ("8", "ppcs", 0),
    ("19", "enroll", 2),
]


def num(x):
    if isinstance(x, (int, float)):
        return x
    return None  # "(X)", blanks


def rows_by_area(ws):
    out = {}
    for r in ws.iter_rows(values_only=True):
        cells = [c for c in r if c is not None]
        if not cells or not isinstance(cells[0], str):
            continue
        name = re.sub(r"\.{2,}.*$", "", cells[0]).strip()
        if name in POSTAL:
            out[POSTAL[name]] = cells[1:]
    return out


FIPS = {"01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
        "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
        "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
        "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
        "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
        "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
        "54": "WV", "55": "WI", "56": "WY"}


def buyers(path):
    """How concentrated the buying is: school systems with students, and the share of day-to-day
    spending held by the largest ones, for the country and each state (Census district file)."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    it = wb.worksheets[0].iter_rows(values_only=True)
    h = next(it); ix = {k: i for i, k in enumerate(h)}
    n = lambda v: v if isinstance(v, (int, float)) else 0
    rows = [(r[ix["FIPST"]], r[ix["NAME"]].strip().title(), n(r[ix["ENROLL"]]), n(r[ix["TCURSPND"]])) for r in it if r[0]]
    def summ(rs, tops):
        rs = sorted(rs, key=lambda r: -r[3]); tot = sum(r[3] for r in rs) or 1
        out = {"systems": sum(1 for r in rs if r[2] > 0), "small": sum(1 for r in rs if 0 < r[2] < 1000),
               "top": [{"name": r[1], "share": round(r[3] / tot, 4), "cur": round(r[3])} for r in rs[:3]]}
        for k in tops:
            out[f"top{k}"] = round(sum(r[3] for r in rs[:k]) / tot, 4)
        return out
    res = {"US": summ(rows, [10, 100, 1000])}
    for f, code in FIPS.items():
        res[code] = summ([r for r in rows if r[0] == f], [1, 10])
    return res


def main(path, dpath=None):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    tables = {t: rows_by_area(wb[t]) for t in {f[0] for f in FIELDS}}
    data = {}
    for code in POSTAL.values():
        rec = {}
        for t, key, i in FIELDS:
            cells = tables[t].get(code)
            if cells is None:
                raise SystemExit(f"missing {code} in table {t}")
            v = num(cells[i]) if i < len(cells) else None
            rec[key] = round(v) if (v is not None and key != "ppcs") else (round(v) if v else None)
        # Known slips in the FY2024 release, caught by scripts/money-flows/check-flows.mjs:
        # - Table 1 local revenue for Nebraska disagrees with Table 4 (and Table 5's shares), so
        #   local revenue is read from Table 4 above for every state.
        # - Table 6 instruction for Nevada has an extra digit (63,074,783 vs current spending of
        #   6,207,207). Where instruction is impossible, derive it from the other parts.
        if rec["instruction"] and rec["current"] and rec["instruction"] > rec["current"]:
            rec["instruction"] = rec["current"] - (rec["support"] or 0) - (rec["otherCurrent"] or 0)
            rec["derived"] = "instruction"
        data[code] = rec
    us = data["US"]
    assert us["rev"] == 994922042, us["rev"]
    assert abs(us["fed"] + us["state"] + us["local"] - us["rev"]) < 10
    if dpath:
        for code, b in buyers(dpath).items():
            data[code]["buyers"] = b
    payload = {
        "year": "FY2024",
        "units": "thousand dollars (ppcs and enroll are dollars and students)",
        "source": SRC,
        "states": data,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Generated by scripts/money-flows/census_states.py from the Census FY2024 Annual Survey of\n"
        "   School System Finances summary tables. Do not edit by hand. */\n"
        "window.EMF_STATES=" + json.dumps(payload, separators=(",", ":")) + ";\n"
    )
    print(f"wrote {OUT} ({len(data)} areas)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "elsec24_sumtables.xlsx", sys.argv[2] if len(sys.argv) > 2 else None)
