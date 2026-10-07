"""Every question must have exactly one defensible answer. This checks the
things a bad item trips on: wrong option count, an answer index that points
nowhere, two options that mean the same thing, a missing explanation, and a
stem that already exists in the bank. Case matters on `attention` items —
telling jX9.2q from jx9.2q is the entire question."""
import json, sys, collections, re

# The trainer draws DOTS in a 40x40 box. It fits counts up to this; past it the
# extra dots fall outside the box and are silently invisible, so two options
# with different counts look identical. Keep in step with tok() in index.html.
DOTS_MAX = 15


def drawn(o):
    """What an option actually LOOKS like. Two options can differ as strings and
    still be the same picture -- ARROW:0 and ARROW:360, or any two dot counts the
    renderer cannot fit. That is what made four questions unanswerable."""
    s = str(o)
    m = re.fullmatch(r'ARROW:(-?\d+)', s)
    if m: return 'ARROW:%d' % (int(m.group(1)) % 360)
    m = re.fullmatch(r'DOTS:(\d+)', s)
    if m: return 'DOTS:%d' % min(int(m.group(1)), DOTS_MAX)
    return s

def check(path):
    qs = json.load(open(path))
    problems, ids = [], collections.Counter(q["id"] for q in qs)
    for i, c in ids.items():
        if c > 1: problems.append((i, "duplicate id"))

    stems = collections.defaultdict(list)
    for q in qs:
        o = q.get("o", [])
        keyed = o if q.get("sub") == "attention" else [str(x).strip().lower() for x in o]
        # five, like the real CCAT — this bank ran on four until Aug 2026
        if len(o) != 5:                       problems.append((q["id"], f"{len(o)} options"))
        # "which one is DIFFERENT" shows three matching figures on purpose —
        # that repetition is the question, not a defect.
        if q.get("sub") != "oddfigure" and len(set(keyed)) != len(o):
            problems.append((q["id"], "two options identical"))
        if not isinstance(q.get("a"), int) or not (0 <= q["a"] < len(o)):
                                              problems.append((q["id"], "answer index out of range"))
        if not str(q.get("e","")).strip():     problems.append((q["id"], "no explanation"))
        # options that are different strings but the same picture
        if q.get("sub") != "oddfigure":
            seen = [drawn(x) for x in o]
            if len(set(seen)) != len(o):
                dupe = [k for k, n in collections.Counter(seen).items() if n > 1]
                problems.append((q["id"], f"options draw identically: {dupe}"))
        for tokn in list(o) + list(q.get("vis") or []):
            m = re.fullmatch(r'DOTS:(\d+)', str(tokn))
            if m and int(m.group(1)) > DOTS_MAX:
                problems.append((q["id"], f"{tokn} exceeds what the renderer can draw ({DOTS_MAX})"))
        # a rotation item's key has to follow the rule its own stem states
        if q.get("sub") == "rotation":
            degs = [int(v[6:]) for v in (q.get("vis") or []) if str(v).startswith("ARROW:")]
            step = re.search(r'(\d+)\s*°', q.get("q", ""))
            key = o[q["a"]] if isinstance(q.get("a"), int) and 0 <= q["a"] < len(o) else ""
            if len(degs) >= 2 and step and str(key).startswith("ARROW:"):
                sign = -1 if re.search(r'COUNTER|ANTICLOCK', q["q"], re.I) else 1
                want = (degs[-1] + sign * int(step.group(1))) % 360
                if int(key[6:]) % 360 != want:
                    problems.append((q["id"], f"key {key} but the stated rule gives ARROW:{want}"))
        if not q.get("sub"):                   problems.append((q["id"], "no subtype"))
        if q.get("d") not in (1,2,3):          problems.append((q["id"], f"difficulty {q.get('d')}"))
        if q.get("c") not in ("Verbal","Numerical","Logic","Spatial"):
                                              problems.append((q["id"], f"category {q.get('c')}"))
        # nine figures ending in a '?' is a 3x3 matrix. Without layout='grid'
        # renderVis draws it as one flat row, which hides the rows and columns
        # that ARE the pattern — the questions become unreadable, not just hard.
        vis = q.get("vis") or []
        if len(vis) == 9 and vis[-1] == "QMARK" and q.get("layout") != "grid":
            problems.append((q["id"], "3x3 matrix without layout='grid' — will draw as a flat row"))
        # an odd-one-out stem lists its own options; editing one and not the
        # other leaves a question that contradicts itself on screen
        if q.get("sub") == "oddoneout":
            m = re.search(r':\s*(.+?)\s*\??$', q["q"])
            if m:
                listed = [x.strip().rstrip('?').strip().lower() for x in m.group(1).split(',')]
                if len(listed) == len(o) and listed != [str(x).lower() for x in o]:
                    problems.append((q["id"], "stem list does not match the options"))
        # a stem only counts as duplicated when the drawn content is identical too
        stems[(q["q"].strip().lower(), json.dumps(q.get("vis"), sort_keys=True))].append(q["id"])
    for (stem, _), group in stems.items():
        if len(group) > 1: problems.append((tuple(group), "same stem and same figure"))
    return qs, problems

if __name__ == "__main__":
    qs, problems = check(sys.argv[1])
    by = collections.Counter((q["c"], q["d"]) for q in qs)
    print(f"  {len(qs)} questions")
    for c in ("Verbal","Numerical","Logic","Spatial"):
        print(f"    {c:<10} d1 {by[(c,1)]:>3}   d2 {by[(c,2)]:>3}   d3 {by[(c,3)]:>3}")
    print(f"  problems: {len(problems)}")
    for p in problems[:12]: print("     ", p)
