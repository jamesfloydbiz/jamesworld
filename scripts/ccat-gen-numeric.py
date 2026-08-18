"""Generated items for the subtypes whose answer is a fact, not a judgement.

Every question here is built from a rule the generator holds, so the key is
correct by construction — there is no step where someone decides what the
answer ought to be. Distractors are the answers you get from the specific
mistakes people actually make: the off-by-one term, the reversed operation,
the percentage taken of the wrong base. A distractor that is merely a random
number teaches nothing, because ruling it out costs no thought.
"""
import random

def opts(ans, wrongs, fmt=str):
    """Answer plus three distinct near-misses, shuffled; returns (options, index)."""
    seen, out = {fmt(ans)}, []
    for w in wrongs:
        s = fmt(w)
        if s not in seen:
            seen.add(s); out.append(s)
        if len(out) == 3: break
    while len(out) < 3:                      # last resort, still nearby
        if isinstance(ans, str):             # letters shift along the alphabet
            base = ord(ans[0]) - 65
            s = fmt(chr(65 + (base + random.choice([-4,-3,3,4,5])) % 26))
        else:
            s = fmt(ans + random.choice([-3,-2,2,3,5]))
        if s not in seen: seen.add(s); out.append(s)
    o = out + [fmt(ans)]
    random.shuffle(o)
    return o, o.index(fmt(ans))

def series_arith(d):
    step = random.choice([3,4,6,7,8,9,11,12] if d>1 else [2,3,4,5])
    start = random.randint(2, 30)
    n = 5
    seq = [start + step*i for i in range(n)]
    ans = seq[-1] + step
    o, a = opts(ans, [ans-step, ans+step, seq[-1]+step+1, ans-1])
    return dict(q=f"Next: {', '.join(map(str,seq))}, ___",
                o=o, a=a, sub="series",
                e=f"Each term adds {step}. {seq[-1]} + {step} = {ans}.")

def series_geo(d):
    r = random.choice([2,3] if d<3 else [2,3,4])
    start = random.choice([1,2,3,5])
    seq = [start*(r**i) for i in range(4)]
    ans = seq[-1]*r
    o, a = opts(ans, [seq[-1]+r, ans+r, ans//r if ans//r!=seq[-1] else ans*2, seq[-1]*(r+1)])
    return dict(q=f"Next: {', '.join(map(str,seq))}, ___", o=o, a=a, sub="series",
                e=f"Each term multiplies by {r}. {seq[-1]} × {r} = {ans}.")

def series_alt(d):
    a1, s1 = random.randint(2,12), random.choice([3,4,5,6])
    a2, s2 = random.randint(20,60), random.choice([-3,-4,-5,-6])
    seq = [a1, a2, a1+s1, a2+s2, a1+2*s1]
    ans = a2 + 2*s2
    o, a = opts(ans, [a1+3*s1, ans-s2, ans+s2, a2+s2])
    return dict(q=f"Next: {', '.join(map(str,seq))}, ___", o=o, a=a, sub="series",
                e=f"Two series alternate: {a1}, {a1+s1}, {a1+2*s1} (+{s1}) and {a2}, {a2+s2}, {ans} ({s2:+}). The next slot belongs to the second: {a2+s2} {s2:+} = {ans}.")

def series_growstep(d):
    start = random.randint(1,6); g = random.choice([1,2,3])
    seq=[start]; step=random.choice([2,3,4])
    for i in range(4):
        seq.append(seq[-1]+step); step+=g
    ans = seq[-1]+step
    o,a = opts(ans, [seq[-1]+step-g, seq[-1]+step+g, seq[-1]+(step-g), ans+1])
    return dict(q=f"Next: {', '.join(map(str,seq))}, ___", o=o, a=a, sub="series",
                e=f"The gap grows by {g} each time. Last gap was {step-g}, so the next is {step}: {seq[-1]} + {step} = {ans}.")

def percent_of(d):
    p = random.choice([5,10,15,20,25,30,40,60,75] if d>1 else [10,20,25,50])
    base = random.choice([40,60,80,120,140,160,180,240,320,450])
    ans = base*p/100
    fmt = lambda v: (f"{v:g}")
    o,a = opts(ans, [base*p/1000, base*(p+5)/100, base*(p-5)/100, ans*2], fmt)
    return dict(q=f"What is {p}% of {base}?", o=o, a=a, sub="percent",
                e=f"10% of {base} is {base/10:g}, so {p}% is {base/10:g} × {p/10:g} = {fmt(ans)}.")

def percent_change(d):
    old = random.choice([40,50,60,80,120,150,200,250])
    pct = random.choice([10,20,25,50] if d<3 else [15,30,40,60])
    up = random.random()<0.5
    new = old*(1+pct/100) if up else old*(1-pct/100)
    ans = pct
    o,a = opts(ans, [pct+5, pct-5, round(abs(new-old)/new*100), pct*2], lambda v: f"{v:g}%")
    return dict(q=f"A price moves from {old:g} to {new:g}. What is the percentage {'increase' if up else 'decrease'}?",
                o=o, a=a, sub="percent",
                e=f"Change is {abs(new-old):g}, always over the ORIGINAL: {abs(new-old):g} ÷ {old:g} = {pct:g}%.")

def average_missing(d):
    n = random.choice([4,5] if d<3 else [5,6])
    target = random.choice([12,15,18,20,24,30])
    vals = [target + random.randint(-6,6) for _ in range(n-1)]
    ans = target*n - sum(vals)
    o,a = opts(ans, [target, ans-n, ans+n, target*n - sum(vals) + target])
    return dict(q=f"The average of {n} numbers is {target}. {n-1} of them are {', '.join(map(str,vals))}. What is the last?",
                o=o, a=a, sub="average",
                e=f"The total must be {target} × {n} = {target*n}. The known ones sum to {sum(vals)}, so the last is {target*n} − {sum(vals)} = {ans}.")

def ratio_split(d):
    a1,b1 = random.choice([(2,3),(3,4),(3,5),(2,5),(4,5),(5,7)])
    parts = a1+b1
    total = parts*random.choice([6,8,9,12,15])
    ans = total//parts*a1
    o,a = opts(ans, [total//parts*b1, total//2, ans+total//parts, ans-total//parts])
    return dict(q=f"Split {total} in the ratio {a1}:{b1}. What is the smaller share?" if a1<b1
                  else f"Split {total} in the ratio {a1}:{b1}. What is the larger share?",
                o=o, a=a, sub="ratio",
                e=f"{a1} + {b1} = {parts} parts. {total} ÷ {parts} = {total//parts} per part, so {a1} parts = {ans}.")

def rate_time(d):
    speed = random.choice([40,45,50,55,60,70,75])
    hours = random.choice([2,3,4,5,6])
    dist = speed*hours
    ask = random.choice(["dist","time","speed"])
    if ask=="dist":
        ans=dist; q=f"A car travels at {speed} mph for {hours} hours. How far does it go?"
        e=f"Distance = rate × time = {speed} × {hours} = {dist} miles."
        wrongs=[speed+hours, dist//2, dist+speed]
    elif ask=="time":
        ans=hours; q=f"A car covers {dist} miles at {speed} mph. How many hours does it take?"
        e=f"Time = distance ÷ rate = {dist} ÷ {speed} = {hours} hours."
        wrongs=[hours+1, hours-1, dist//10]
    else:
        ans=speed; q=f"A car covers {dist} miles in {hours} hours. What is its average speed?"
        e=f"Rate = distance ÷ time = {dist} ÷ {hours} = {speed} mph."
        wrongs=[speed+10, speed-10, dist//10]
    o,a=opts(ans, wrongs)
    return dict(q=q, o=o, a=a, sub="wordmath", e=e)

def letter_pattern(d):
    step = random.choice([1,2,3] if d<3 else [2,3,4])
    start = random.randint(0, 25-step*5)
    L = lambda i: chr(65+i%26)
    seq=[L(start+step*i) for i in range(4)]
    ans=L(start+step*4)
    o,a=opts(ans, [L(start+step*4+1), L(start+step*4-1), L(start+step*3), L(start+step*5)], str)
    return dict(q=f"Next letter: {', '.join(seq)}, ___", o=o, a=a, sub="letterpattern",
                e=f"Each step moves {step} letter{'s' if step>1 else ''} forward. After {seq[-1]} comes {ans}.")

NUMERIC = [series_arith, series_geo, series_alt, series_growstep,
           percent_of, percent_change, average_missing, ratio_split, rate_time]
LOGIC   = [letter_pattern]
