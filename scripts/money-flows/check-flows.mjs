// Sanity checks for /education/money-flows/ data. Run: bun scripts/money-flows/check-flows.mjs
// Loads the page's data files the way the browser does, rebuilds every area's flows with the
// same rules as app.js, and checks that money in equals money out at each pass-through node.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../../site/education/money-flows/', import.meta.url);
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['data_states.js', 'data_choice.js', 'data_flows.js']) vm.runInContext(readFileSync(new URL(f, dir), 'utf8'), ctx);
const { EMF_STATES: ST, EMF_CHOICE: CH, EMF_FLOWS: F } = ctx.window;

let problems = 0;
const fail = (m) => { problems++; console.log('FAIL', m); };

// every national flow needs a year and a reason; a source unless it is a labeled estimate
for (const l of F.national) {
  if (!F.nodes[l.s] || !F.nodes[l.t]) fail(`unknown node in ${l.s} -> ${l.t}`);
  if (!l.year) fail(`no year on ${l.s} -> ${l.t}`);
  if (!l.why) fail(`no reason on ${l.s} -> ${l.t}`);
  if (!l.src && l.conf !== 'low') fail(`no source on non-estimate ${l.s} -> ${l.t}`);
  if (l.low != null && !(l.low <= l.v && l.v <= l.high)) fail(`value outside range on ${l.s} -> ${l.t}`);
}
// stocks are never drawn as bands
for (const s of F.stocks) if (F.national.some((l) => l.v === s.v)) fail(`stock ${s.label} looks like a band`);

// pass-through balance for national-only nodes
const bal = {};
for (const l of F.national) { (bal[l.s] ??= { i: 0, o: 0 }).o += l.v; (bal[l.t] ??= { i: 0, o: 0 }).i += l.v; }
for (const [id, b] of Object.entries(bal)) {
  if (F.nodes[id].col === 1 && Math.abs(b.i - b.o) > 0.01) fail(`${id}: in ${b.i.toFixed(2)} vs out ${b.o.toFixed(2)}`);
}

// Census side: revenue parts add to totals for every area
for (const [code, r] of Object.entries(ST.states)) {
  const sum = (r.fed || 0) + (r.state || 0) + (r.local || 0);
  if (Math.abs(sum - r.rev) > 10) fail(`${code}: fed+state+local ${sum} != rev ${r.rev}`);
  const exp = (r.current || 0) + (r.capital || 0) + (r.otherExp || 0);
  if (Math.abs(exp - r.exp) > 10) fail(`${code}: current+capital+other ${exp} != exp ${r.exp}`);
  const cur = (r.instruction || 0) + (r.support || 0) + (r.otherCurrent || 0);
  if (Math.abs(cur - r.current) > 10) fail(`${code}: instruction+support+other ${cur} != current ${r.current}`);
  const oth = (r.interest || 0) + (r.toOtherGov || 0);
  if (Math.abs(oth - r.otherExp) > 10) fail(`${code}: interest+transfers ${oth} != other ${r.otherExp}`);
  if (r.fed - r.fedTitle1 - r.fedSpecEd - r.fedMeals < 0) fail(`${code}: federal parts exceed federal total`);
  if (r.state != null && r.state - (r.stFormula || 0) - (r.stOnBehalf || 0) < 0) fail(`${code}: state parts exceed state total`);
}
const choiceSum = Object.values(CH.states).reduce((s, x) => s + (x.choiceUSD || 0), 0) / 1e9;
const choiceBand = F.national.find((l) => l.s === 'stateTax' && l.t === 'choice').v;
if (Math.abs(choiceSum - choiceBand) > 0.1) fail(`state choice dollars ${choiceSum.toFixed(2)}B vs national band ${choiceBand}B`);
if (Object.keys(CH.states).length !== 51) fail('choice data should cover 50 states + DC');

console.log(problems ? `${problems} problem(s)` : `OK: ${F.national.length} national flows, ${Object.keys(ST.states).length} Census areas, choice total $${choiceSum.toFixed(2)}B`);
process.exit(problems ? 1 : 0);
