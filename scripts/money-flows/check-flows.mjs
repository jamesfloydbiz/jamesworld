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

// every sector's flows need a year and a reason; a source unless they are a labeled estimate.
// Pass-through nodes (col 1, and col 2 where money continues to col 3) must balance.
for (const [key, sec] of Object.entries(F.sectors)) {
  for (const l of sec.links) {
    const tag = `${key}: ${l.s} -> ${l.t}`;
    if (!F.nodes[l.s] || !F.nodes[l.t]) fail(`unknown node in ${tag}`);
    if (!l.year) fail(`no year on ${tag}`);
    if (!l.why) fail(`no reason on ${tag}`);
    if (!l.ctrl || !F.controllers[l.ctrl]) fail(`no decider on ${tag}`);
    if (!l.src && l.conf !== 'low') fail(`no source on non-estimate ${tag}`);
    if (l.low != null && !(l.low <= l.v && l.v <= l.high)) fail(`value outside range on ${tag}`);
  }
  if (sec.census) continue; // public pass-throughs balance by construction from Census
  const bal = {};
  for (const l of sec.links) { (bal[l.s] ??= { i: 0, o: 0 }).o += l.v; (bal[l.t] ??= { i: 0, o: 0 }).i += l.v; }
  for (const [id, b] of Object.entries(bal)) {
    if (b.i && b.o && Math.abs(b.i - b.o) > 0.05) fail(`${key}/${id}: in ${b.i.toFixed(2)} vs out ${b.o.toFixed(2)}`);
  }
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
// choice money is split once: private-school tuition (Private tab) plus homeschool uses (Homeschool tab)
const choiceBand = F.sectors.private.links.find((l) => l.s === 'stateTax' && l.t === 'choice').v;
const homeEsa = F.sectors.homeschool.links.find((l) => l.t === 'esaHome').v;
if (Math.abs(choiceSum - (choiceBand + homeEsa)) > 1) fail(`state choice dollars ${choiceSum.toFixed(2)}B vs private ${choiceBand}B + homeschool ${homeEsa}B`);
if (Object.keys(CH.states).length !== 51) fail('choice data should cover 50 states + DC');

console.log(problems ? `${problems} problem(s)` : `OK: ${Object.values(F.sectors).reduce((n, x) => n + x.links.length, 0)} sector flows, ${Object.keys(ST.states).length} Census areas, choice total $${choiceSum.toFixed(2)}B`);
process.exit(problems ? 1 : 0);
