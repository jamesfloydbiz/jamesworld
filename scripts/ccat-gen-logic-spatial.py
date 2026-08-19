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

def _opts(ans, wrongs, n=4):
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
    order = CORNERS_CW if cw else CORNERS_CW[::-1]
    i0 = random.randrange(4)
    seq = [order[(i0+i) % 4] for i in range(3)]
    ans = order[(i0+3) % 4]
    wrongs = [order[(i0+2)%4], order[(i0+4)%4], order[(i0+1)%4]]
    o,a = _opts(f"CORNER:{ans}", [f"CORNER:{w}" for w in wrongs])
    return dict(sub="corner", q=f"The shaded corner moves {'CLOCKWISE' if cw else 'COUNTER-CLOCKWISE'}. Next?",
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
    if ans>9 or ans<2: return dots_series(1)
    # Distractors must be three DISTINCT counts the renderer can actually draw
    # (1..9). Filtering after the fact left some questions with two options.
    wrongs=[w for w in (ans+1, ans-1, ans+2, ans-2, ans+3, ans-3) if 1<=w<=9 and w!=ans]
    if len(wrongs)<3: return dots_series(1)
    o,a=_opts(f"DOTS:{ans}", [f"DOTS:{w}" for w in wrongs])
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
                e=f"Three arrows point the same way ({base}°); one points {odd}°.")

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

SPATIAL = [arrow_rotate, corner_walk, dots_series, shape_sides, odd_arrow]
LOGIC2  = [ordering, syllogism, relations]
