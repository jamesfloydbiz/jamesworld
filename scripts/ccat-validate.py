"""Every question must have exactly one defensible answer. This checks the
things a bad item trips on: wrong option count, an answer index that points
nowhere, two options that mean the same thing, a missing explanation, and a
stem that already exists in the bank. Case matters on `attention` items —
telling jX9.2q from jx9.2q is the entire question."""
import json, sys, collections

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
        if not q.get("sub"):                   problems.append((q["id"], "no subtype"))
        if q.get("d") not in (1,2,3):          problems.append((q["id"], f"difficulty {q.get('d')}"))
        if q.get("c") not in ("Verbal","Numerical","Logic","Spatial"):
                                              problems.append((q["id"], f"category {q.get('c')}"))
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
