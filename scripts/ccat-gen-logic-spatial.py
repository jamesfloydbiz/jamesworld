"""Logic and Spatial items whose answers are derived, not decided.

Spatial ones are built from the same token vocabulary the trainer already
renders — ARROW:deg, CORNER:TL|TR|BL|BR, DOTS:n, SHAPE:tri|sq|pent|hex|circ —
so nothing new has to be drawn. The rule is applied to produce the figure
sequence AND the key, which is why they cannot disagree with each other the
way question 258 did.
"""
import random

CORNERS_CW  = ["TL","TR","BR","BL"]
SHAPES      = ["tri","sq","pent","hex"]
SIDES       = {"tri":3,"sq":4,"pent":5,"hex":6,"circ":0}

def _opts(ans, wrongs, n=5):
    seen, out = {ans}, []
    for w in wrongs:
        if w not in seen: seen.add(w); out.append(w)
        if len(out) == n-1: break
    o = out + [ans]; random.shuffle(o)
    return o, o.index(ans)

# ── Spatial ───────────────────────────────────────────────────────────
def arrow_rotate(d):
    step = random.choice([45,90] if d<3 else [45,90,135])
    cw   = random.random() < 0.5
    start= random.choice([0,45,90,135,180,225,270,315])
    sgn  = 1 if cw else -1
    seq  = [(start + sgn*step*i) % 360 for i in range(3)]
    ans  = (start + sgn*step*3) % 360
    wrongs = [(ans+step)%360, (ans-step)%360, (ans+180)%360, (start)%360]
    o,a = _opts(f"ARROW:{ans}", [f"ARROW:{w}" for w in wrongs])
    return dict(sub="rotation", q=f"The arrow rotates {step}° {'CLOCKWISE' if cw else 'COUNTER-CLOCKWISE'} each step. Next?",
                o=o, a=a, vis=[f"ARROW:{v}" for v in seq]+["QMARK"],
                e=f"Each step turns {step}° {'clockwise' if cw else 'counter-clockwise'}. From {seq[-1]}° that lands on {ans}°.")

def corner_walk(d):
    cw = random.random() < 0.5
    hop = random.choice([1, 2])
    order = CORNERS_CW if cw else CORNERS_CW[::-1]
    i0 = random.randrange(4)
    seq = [order[(i0+hop*i) % 4] for i in range(3)]
    ans = order[(i0+hop*3) % 4]
    # Build distractors from what the answer ISN'T. Deriving them by offset put
    # the answer among its own distractors once the hop could be 2, which left
    # the item with four options instead of five.
    wrongs = [f"CORNER:{c}" for c in CORNERS_CW if c != ans] + ["CORNER:C"]
    o,a = _opts(f"CORNER:{ans}", wrongs)
    return dict(sub="corner", q=f"The shaded corner moves {hop} place{'' if hop==1 else 's'} {'CLOCKWISE' if cw else 'COUNTER-CLOCKWISE'} each step. Next?",
                o=o, a=a, vis=[f"CORNER:{v}" for v in seq]+["QMARK"],
                e=f"{'Clockwise' if cw else 'Counter-clockwise'} order is {' → '.join(order)}. After {seq[-1]} comes {ans}.")

def dots_series(d):
    mode = random.choice(["add","double"] if d>1 else ["add"])
    if mode=="add":
        step=random.choice([1,2,3]); start=random.randint(1,3)
        seq=[start+step*i for i in range(3)]; ans=start+step*3
        e=f"Each frame adds {step}. {seq[-1]} + {step} = {ans}."
    else:
        start=random.choice([1,2]); seq=[start*(2**i) for i in range(3)]; ans=start*8
        e=f"The count doubles each frame. {seq[-1]} × 2 = {ans}."
    if ans>15 or ans<2: return dots_series(1)
    # Distractors must be four DISTINCT counts the renderer can actually draw.
    # The ceiling was 9 because the old renderer silently dropped anything past
    # it; it draws up to 15 now, so the range opens up.
    wrongs=[w for w in (ans+1, ans-1, ans+2, ans-2, ans+3, ans-3) if 1<=w<=15 and w!=ans]
    if len(wrongs)<4: return dots_series(1)
    # The stem asks HOW MANY, so the answers are counts. Offering figures here
    # would be asking "which figure comes next", which is what imageseries does.
    o,a=_opts(str(ans), [str(w) for w in wrongs])
    return dict(sub="count", q="How many dots come next?", o=o, a=a,
                vis=[f"DOTS:{v}" for v in seq]+["QMARK"], e=e)

def shape_sides(d):
    growing = random.random()<0.5
    idx = 0 if growing else len(SHAPES)-1
    seq = [SHAPES[idx + (i if growing else -i)] for i in range(3)]
    nxt = SHAPES[idx + (3 if growing else -3)]
    wrongs=[s for s in SHAPES if s!=nxt][:3]
    o,a=_opts(f"SHAPE:{nxt}", [f"SHAPE:{w}" for w in wrongs])
    return dict(sub="polygon", q=f"The number of sides {'increases' if growing else 'decreases'} by one each step. Next?",
                o=o, a=a, vis=[f"SHAPE:{v}" for v in seq]+["QMARK"],
                e=f"Sides run {', '.join(str(SIDES[s]) for s in seq)} → {SIDES[nxt]}, so the next figure is the {nxt}.")

def odd_arrow(d):
    base = random.choice([0,45,90,135,180,225,270,315])
    odd  = (base + random.choice([90,180,135])) % 360
    figs = [f"ARROW:{base}"]*3 + [f"ARROW:{odd}"]
    random.shuffle(figs)
    ans  = figs.index(f"ARROW:{odd}")
    return dict(sub="oddfigure", q="Which arrow is DIFFERENT?", o=figs, a=ans, vis=None,
                e=f"Four arrows point the same way ({base}°); one points {odd}°.")

# ── Logic ─────────────────────────────────────────────────────────────
def ordering(d):
    names = random.sample(["Ana","Ben","Cara","Dan","Eve","Finn","Gus","Hana"], 4)
    order = names[:]                       # tallest → shortest as written
    facts = [f"{order[0]} is taller than {order[1]}",
             f"{order[1]} is taller than {order[2]}",
             f"{order[2]} is taller than {order[3]}"]
    random.shuffle(facts)
    ask_tall = random.random()<0.5
    ans = order[0] if ask_tall else order[-1]
    o,a = _opts(ans, [x for x in names if x!=ans])
    return dict(sub="ordering", q=f"{'. '.join(facts)}. Who is {'tallest' if ask_tall else 'shortest'}?",
                o=o, a=a, vis=None,
                e=f"Chaining them gives {' > '.join(order)}, so the {'tallest' if ask_tall else 'shortest'} is {ans}.")

def syllogism(d):
    A,B,C = random.sample(["florists","cyclists","chemists","bakers","pilots","tailors"],3)
    valid = random.random()<0.5
    if valid:
        q=f"All {A} are {B}. All {B} are {C}. Therefore:"
        ans=f"All {A} are {C}"
        wrongs=[f"All {C} are {A}", f"No {A} are {C}", f"Some {C} are not {B}"]
        e=f"The chain runs {A} → {B} → {C}, so every {A[:-1]} is a {C[:-1]}. Reversing it does not follow."
    else:
        q=f"All {A} are {B}. Some {B} are {C}. Therefore:"
        ans="Cannot be determined"
        wrongs=[f"All {A} are {C}", f"Some {A} are {C}", f"No {A} are {C}"]
        e=f"The {B} that are {C} need not be the ones that are {A}. 'Some' never licenses a conclusion about a particular subgroup."
    o,a=_opts(ans, wrongs)
    return dict(sub="syllogism", q=q, o=o, a=a, vis=None, e=e)

def art(word):
    """a/an by sound. 'a amber box' is the kind of thing that makes a whole
    question look unconsidered."""
    return ("an " if word[0] in "aeiou" else "a ") + word

def relations(d):
    """Containment chain a -> b -> c, asked so that exactly ONE option is true.

    The first version asked which box the marble is 'certainly also inside'
    and offered b as a distractor. But b is certainly true as well — the
    chain puts the marble inside b AND inside c — so the item had two right
    answers and marked one of them wrong. Its own explanation said as much.
    Asking for the OUTERMOST box is the phrasing that has a single answer,
    and b is no longer offered.
    """
    COLOURS = ["red", "blue", "green", "amber", "violet", "orange", "indigo"]
    a, b, c = random.sample(COLOURS, 3)
    spare = [x for x in COLOURS if x not in (a, b, c)]
    ans = c
    q = (f"Every {a} box is inside {art(b)} box. Every {b} box is inside {art(c)} box. "
         f"A marble is in {art(a)} box. Which is the OUTERMOST box it is inside?")
    # distractors: the two inner boxes are true-but-not-outermost, so they cannot
    # be used; take colours from outside the chain instead.
    o, a_i = _opts(ans, spare[:2] + ["none of these"])
    return dict(sub="relations", q=q, o=o, a=a_i, vis=None,
                e=(f"The chain runs {a} → {b} → {c}. The marble is inside all three, "
                   f"but the question asks for the outermost, which is {c}."))

def matrix(d):
    """A real 3x3: one rule that holds across every row AND down every column.

    That redundancy is the point — it is what lets a solver confirm an answer by
    two independent routes instead of guessing from the top row. Every flavour
    below is built so the rule applies in both directions, and the key is
    computed from the rule rather than chosen, so the grid and the answer cannot
    disagree. layout='grid' is mandatory: drawn as a flat row the rows and
    columns vanish and the question becomes unanswerable.
    """
    flavour = random.choice(["arrow", "dots", "shape", "corner"])

    if flavour == "arrow":
        step = random.choice([45, 90]) if d < 3 else random.choice([45, 90, 135])
        base = random.choice([0, 45, 90, 135, 180, 225, 270, 315])
        cell = lambda r, c: f"ARROW:{(base + step*(r+c)) % 360}"
        ans  = cell(2, 2)
        wrongs = [f"ARROW:{(base + step*4 + k) % 360}" for k in (step, -step, 180, 2*step)]
        why  = f"Every step turns {step}° clockwise, across each row and down each column."

    elif flavour == "dots":
        start = random.randint(1, 3)
        rs, cs = random.randint(1, 2), random.randint(1, 2 if d < 3 else 3)
        cell = lambda r, c: f"DOTS:{start + rs*r + cs*c}"
        top  = start + rs*2 + cs*2
        if top > 15: return None                     # renderer fits 15 dots
        ans  = cell(2, 2)
        wrongs = [f"DOTS:{n}" for n in (top+1, top-1, top+cs, max(1, top-cs), top+2, max(1, top-2)) if 1 <= n <= 15]
        why  = (f"Each step across a row adds {cs}, and each step down a column adds {rs}. "
                f"The last row runs {start+2*rs}, {start+2*rs+cs}, {top}.")

    elif flavour == "shape":
        BY_SIDES = {3:"tri", 4:"sq", 5:"pent", 6:"hex", 7:"hept", 8:"oct"}
        start = random.randint(3, 4)
        if start + 4 > 8: return None
        cell = lambda r, c: f"SHAPE:{BY_SIDES[start + r + c]}"
        ans  = cell(2, 2)
        wrongs = [f"SHAPE:{BY_SIDES[n]}" for n in (start+3, start+2, start+1) if n in BY_SIDES]
        wrongs.append("SHAPE:circ")
        why  = (f"Sides go up by one across each row and down each column: "
                f"{start}, {start+1}, {start+2} / … / {start+2}, {start+3}, {start+4}.")

    else:
        cw = random.random() < 0.5
        order = CORNERS_CW if cw else CORNERS_CW[::-1]
        i0 = random.randrange(4)
        cell = lambda r, c: f"CORNER:{order[(i0 + r + c) % 4]}"
        ans  = cell(2, 2)
        wrongs = [f"CORNER:{order[(i0+k) % 4]}" for k in (3, 5, 2)] + ["CORNER:C"]
        why  = (f"Reading across, the shaded corner moves one step "
                f"{'clockwise' if cw else 'counter-clockwise'} ({' → '.join(order)}), and each row "
                f"starts one step on from the row above.")

    vis = [cell(r, c) for r in range(3) for c in range(3)][:8] + ["QMARK"]
    o, a = _opts(ans, [w for w in wrongs if w != ans], n=5)
    if len(set(o)) != 5: return None
    return dict(sub="matrix", q="Fill the missing cell.", o=o, a=a, vis=vis,
                layout="grid", e=f"{why} The missing cell is therefore {ans.split(':')[1]}.")


def image_series(d):
    """Three figures and a '?', one rule. A flat row is correct here — unlike a
    matrix, a sequence has no columns to lose."""
    kind = random.choice(["shape", "dots", "arrow"])
    if kind == "shape":
        BY_SIDES = {3:"tri", 4:"sq", 5:"pent", 6:"hex", 7:"hept", 8:"oct"}
        start = random.randint(3, 5)
        if start + 3 > 8: return None
        seq = [f"SHAPE:{BY_SIDES[start+i]}" for i in range(3)]
        ans = f"SHAPE:{BY_SIDES[start+3]}"
        wrongs = [f"SHAPE:{BY_SIDES[n]}" for n in (start+2, start+1, start) if n in BY_SIDES] + ["SHAPE:circ"]
        why = f"Each figure gains a side: {start}, {start+1}, {start+2}, then {start+3}."
    elif kind == "dots":
        start, stepn = random.randint(1, 3), random.randint(2, 3)
        ans_n = start + stepn*3
        if ans_n > 15: return None
        seq = [f"DOTS:{start+stepn*i}" for i in range(3)]
        ans = f"DOTS:{ans_n}"
        wrongs = [f"DOTS:{n}" for n in (ans_n+1, ans_n-1, ans_n+stepn, max(1, ans_n-stepn))]
        why = f"The count rises by {stepn} each time: {start}, {start+stepn}, {start+2*stepn}, then {ans_n}."
    else:
        step = random.choice([45, 90])
        base = random.choice([0, 45, 90, 180, 270])
        seq = [f"ARROW:{(base+step*i) % 360}" for i in range(3)]
        ans = f"ARROW:{(base+step*3) % 360}"
        wrongs = [f"ARROW:{(base+step*3+k) % 360}" for k in (step, -step, 180, 2*step)]
        why = f"Each figure turns {step}° clockwise."
    o, a = _opts(ans, [w for w in wrongs if w != ans], n=5)
    if len(set(o)) != 5: return None
    return dict(sub="imageseries", q="Which figure comes next?", o=o, a=a,
                vis=seq + ["QMARK"], e=why)


from fractions import Fraction

# ── Numerical ─────────────────────────────────────────────────────────
def fraction_cmp(d):
    """Pick the biggest or smallest of five fractions. Derived by comparing the
    actual values, so the key cannot drift from the options the way a hand-typed
    one can. Values are kept distinct — two equal fractions in a ranking question
    is the defect question 1050 had."""
    pool, seen = [], set()
    tries = 0
    while len(pool) < 5 and tries < 400:
        tries += 1
        den = random.randint(2, 13 if d > 1 else 8)
        num = random.randint(1, den - 1)
        f = Fraction(num, den)
        if f in seen: continue
        seen.add(f); pool.append((f, f"{num}/{den}"))
    if len(pool) < 5: return None
    want_max = random.random() < 0.5
    tgt = max(pool)[0] if want_max else min(pool)[0]
    if sum(1 for f, _ in pool if f == tgt) != 1: return None
    ans = next(s for f, s in pool if f == tgt)
    o = [s for _, s in pool]; random.shuffle(o)
    word = "LARGEST" if want_max else "SMALLEST"
    stem = random.choice([f"Which of these fractions is the {word}?",
                          f"Which fraction has the {word.lower()} value?",
                          f"Of these five fractions, which is {word.lower()}?"])
    order = sorted(pool, reverse=want_max)
    return dict(c="Numerical", sub="fraction",
                q=stem, o=o, a=o.index(ans),
                e=(f"As decimals: " + ", ".join(f"{s} = {float(f):.3f}" for f, s in order[:3])
                   + f" … so {ans} is the {word.lower()}."))


def graph_table(d):
    """Read a small table. The question is derived from the numbers, so the key
    is whatever the table actually says."""
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    n = 4 if d < 3 else 5
    labels = MONTHS[:n]
    vals = random.sample(range(20, 95, 5), n)
    cell = ("<td style='padding:4px 14px;border:1px solid #333;text-align:center;"
            "font-weight:600;'>{}</td>")
    row2 = ("<td style='padding:4px 14px;border:1px solid #333;text-align:center;'>{}</td>")
    table = ("<table style='margin:10px auto;border-collapse:collapse;font-size:0.95rem;'><tr>"
             + "".join(cell.format(m) for m in labels) + "</tr><tr>"
             + "".join(row2.format(v) for v in vals) + "</tr></table>")
    kind = random.choice(["max", "min", "diff", "total"])
    if kind in ("max", "min"):
        pick = max(vals) if kind == "max" else min(vals)
        ans = labels[vals.index(pick)]
        o = labels[:] + ["Tie"]; random.shuffle(o); o = o[:5]
        if ans not in o: o[0] = ans
        e = f"{ans} at {pick} is the {'highest' if kind=='max' else 'lowest'}."
    elif kind == "diff":
        hi, lo = max(vals), min(vals)
        ans = f"${hi-lo}k"
        wrongs = [f"${hi+lo}k", f"${hi}k", f"${lo}k", f"${hi-lo+5}k"]
        o, i = _opts(ans, wrongs, n=5)
        return dict(c="Numerical", sub="graph", q=f"Sales ($k):{table}Difference between the highest and lowest month?",
                    o=o, a=i, e=f"Highest {hi}, lowest {lo}, so the gap is {hi-lo}.")
    else:
        tot = sum(vals); ans = f"${tot}k"
        o, i = _opts(ans, [f"${tot+5}k", f"${tot-5}k", f"${tot+10}k", f"${max(vals)}k"], n=5)
        return dict(c="Numerical", sub="graph", q=f"Sales ($k):{table}What is the total across all months?",
                    o=o, a=i, e=f"{' + '.join(map(str, vals))} = {tot}.")
    if len(set(o)) != 5: return None
    word = "HIGHEST" if kind == "max" else "LOWEST"
    return dict(c="Numerical", sub="graph", q=f"Sales ($k):{table}Which month was {word}?",
                o=o, a=o.index(ans), e=e)


# ── more Spatial ──────────────────────────────────────────────────────
def mirror_arrow(d):
    """A real reflection rather than a sentence about one. A left-right mirror
    maps an angle to (360 - angle), so arrows at 0 and 180 are their own
    reflection — those are excluded, since the question would have no change to
    see."""
    vertical = random.random() < 0.5          # vertical mirror = left-right swap
    angles = [45, 90, 135, 225, 270, 315] if vertical else [45, 90, 135, 180, 225, 315]
    start = random.choice(angles)
    ans = (360 - start) % 360 if vertical else (180 - start) % 360
    if ans == start: return None               # nothing to see in a self-reflection
    wrongs = [(start + 180) % 360, start, (ans + 45) % 360, (ans - 45) % 360,
              (360 - start) % 360 if not vertical else (180 - start) % 360]
    o, a = _opts(f"ARROW:{ans}", [f"ARROW:{w}" for w in wrongs if w != ans], n=5)
    if len(set(o)) != 5: return None
    axis = "left-right" if vertical else "top-bottom"
    keeps, swaps = ("up and down", "left and right") if vertical else ("left and right", "up and down")
    return dict(c="Spatial", sub="mirror", q=f"What does this arrow look like in a {axis} mirror?",
                o=o, a=a, vis=[f"ARROW:{start}", "QMARK"],
                e=(f"A {axis} mirror leaves {keeps} alone and swaps {swaps}, "
                   f"so {start}° reflects to {ans}°."))


def odd_figure(d):
    """Four alike, one different — across arrows, corners, dots or shapes, so the
    subtype is not just arrows."""
    kind = random.choice(["arrow", "corner", "dots", "shape"])
    if kind == "arrow":
        base = random.choice([0, 45, 90, 135, 180, 225, 270, 315])
        odd = (base + random.choice([45, 90, 135, 180])) % 360
        same, diff = f"ARROW:{base}", f"ARROW:{odd}"
        why = f"Four arrows point the same way ({base}°); one points {odd}°."
    elif kind == "corner":
        a_, b_ = random.sample(CORNERS_CW, 2)
        same, diff = f"CORNER:{a_}", f"CORNER:{b_}"
        why = f"Four squares are shaded {a_}; one is shaded {b_}."
    elif kind == "dots":
        n1 = random.randint(2, 9); n2 = n1 + random.choice([-1, 1, 2])
        if not 1 <= n2 <= 15: return None
        same, diff = f"DOTS:{n1}", f"DOTS:{n2}"
        why = f"Four figures show {n1} dots; one shows {n2}."
    else:
        s1, s2 = random.sample(["tri", "sq", "pent", "hex", "hept", "oct"], 2)
        same, diff = f"SHAPE:{s1}", f"SHAPE:{s2}"
        why = f"Four figures are the same shape; one is not."
    if same == diff: return None
    pos = random.randrange(5)
    o = [same]*5; o[pos] = diff
    stem = random.choice(["Which figure is DIFFERENT?",
                          "Four of these match. Which is the odd one?",
                          "Which one does NOT belong with the others?"])
    return dict(c="Spatial", sub="oddfigure", q=stem, o=o, a=pos, e=why)


# ── more Logic ────────────────────────────────────────────────────────
def deduction(d):
    """Modus tollens, or day-of-week arithmetic. Both have one derivable answer."""
    DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    if random.random() < 0.5:
        base = random.randrange(7); k = random.randint(2, 5)
        ans = DAYS[(base + k + 1) % 7]
        wrongs = [DAYS[(base + k) % 7], DAYS[(base + k + 2) % 7],
                  DAYS[(base + k - 1) % 7], DAYS[(base + k + 3) % 7]]
        o, a = _opts(ans, [w for w in wrongs if w != ans], n=5)
        if len(set(o)) != 5: return None
        return dict(c="Logic", sub="deduction",
                    q=f"If today is {k} days after {DAYS[base]}, what is tomorrow?", o=o, a=a,
                    e=(f"{k} days after {DAYS[base]} is {DAYS[(base+k)%7]}; "
                       f"tomorrow is {ans}."))
    PAIRS = [("it rains","the match is cancelled"), ("the alarm sounds","the door locks"),
             ("the pump fails","the tank overflows"), ("she is late","the meeting is delayed"),
             ("the power cuts","the lights go out")]
    p_, q_ = random.choice(PAIRS)
    ans = f"{p_[0].upper()+p_[1:]} did not happen"
    wrongs = [f"{p_[0].upper()+p_[1:]} happened", "Cannot be determined",
              f"{q_[0].upper()+q_[1:]} anyway", "Both happened"]
    o, a = _opts(ans, wrongs, n=5)
    if len(set(o)) != 5: return None
    return dict(c="Logic", sub="deduction",
                q=f"If {p_}, {q_}. But {q_} did NOT happen. Therefore:", o=o, a=a,
                e=(f"The rule says {p_} forces {q_}. {q_[0].upper()+q_[1:]} did not happen, "
                   f"so {p_} cannot have happened either."))


SPATIAL = [arrow_rotate, corner_walk, dots_series, shape_sides, odd_arrow, matrix, image_series,
           mirror_arrow, odd_figure]
LOGIC2  = [ordering, syllogism, relations]


if __name__ == "__main__":
    import json, sys, collections
    want = collections.Counter()
    for spec in sys.argv[1:]:                     # e.g. matrix=30 imageseries=20
        k, _, n = spec.partition("=")
        want[k] = int(n or 10)
    BUILD = {"matrix": matrix, "imageseries": image_series, "fraction": fraction_cmp,
             "graph": graph_table, "mirror": mirror_arrow, "oddfigure": odd_figure,
             "deduction": deduction, "corner": corner_walk, "count": dots_series}
    out, seen = [], set()
    for name, n in want.items():
        fn = BUILD[name]
        tries = 0
        while sum(1 for o in out if o["sub"] == name) < n and tries < n*400:
            tries += 1
            d = 1 + (sum(1 for o in out if o["sub"] == name) * 3) // max(1, n)
            it = fn(min(3, d))
            if not it: continue
            sig = (it["q"], json.dumps(it.get("vis")), json.dumps(sorted(map(str, it["o"]))))
            if sig in seen: continue
            seen.add(sig); it["d"] = min(3, d); it.setdefault("c", "Spatial"); out.append(it)
    json.dump(out, sys.stdout, ensure_ascii=False)
