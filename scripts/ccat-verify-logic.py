"""Re-derive logic answers from the question text, knowing nothing about how
they were generated.

The figure questions have had this since they were written; the logic ones
never did, which is how 22 containment items shipped with two correct answers
and an explanation that admitted it. A question is only sound if exactly ONE
option is entailed by the stem.
"""
import json, re, sys

def check_containment(q):
    m = re.match(r"Every (\w+) box is inside an? (\w+) box\. Every \2 box is inside an? (\w+) box\. "
                 r"A marble is in an? \1 box\. (.+)$", q["q"])
    if not m: return None
    a, b, c, ask = m.groups()
    inside = {a, b, c}                       # the marble is inside all three
    if "OUTERMOST" in ask:
        true_opts = {o for o in q["o"] if o == c}
    else:                                    # "certainly also inside" — b and c both qualify
        true_opts = {o for o in q["o"] if o in (b, c)}
    keyed = q["o"][q["a"]]
    if len(true_opts) != 1:
        return f"{len(true_opts)} of the options are true ({sorted(true_opts)})"
    if keyed not in true_opts:
        return f"keyed '{keyed}' but the true answer is {sorted(true_opts)[0]}"
    return None

def check_article(q):
    bad = re.findall(r"\ba ([aeiou]\w+)", q["q"])
    return f"'a {bad[0]}' should be 'an {bad[0]}'" if bad else None

CHECKS = [check_containment, check_article]

if __name__ == "__main__":
    qs = json.load(open(sys.argv[1]))
    logic = [q for q in qs if q.get("c") == "Logic"]
    problems = []
    for q in logic:
        for fn in CHECKS:
            r = fn(q)
            if r: problems.append((q["id"], q.get("sub"), r))
    print(f"  {len(logic)} logic questions checked")
    print(f"  problems: {len(problems)}")
    for p in problems[:10]:
        print("     ", p)
    sys.exit(1 if problems else 0)
