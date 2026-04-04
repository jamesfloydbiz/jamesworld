export type ModelKey =
  | 'redundancy'
  | 'compound'
  | 'breakpoint'
  | 'darwin'
  | 'incentive'
  | 'social'
  | 'commitment'
  | 'liking'
  | 'availability'
  | 'firstconclusion'
  | 'lollapalooza';

export const MODEL_NAMES: Record<ModelKey, string> = {
  redundancy: 'Redundancy',
  compound: 'Compound Interest',
  breakpoint: 'Breakpoint & Autocatalysis',
  darwin: 'Darwinian Synthesis',
  incentive: 'Incentive Bias',
  social: 'Social Proof',
  commitment: 'Commitment Bias',
  liking: 'Liking / Hating Bias',
  availability: 'Availability Bias',
  firstconclusion: 'First Conclusion Bias',
  lollapalooza: 'Lollapalooza Effect',
};

export const CORE_MODELS: ModelKey[] = ['redundancy', 'compound', 'breakpoint', 'darwin'];
export const COGNITIVE_MODELS: ModelKey[] = ['incentive', 'social', 'commitment', 'liking', 'availability', 'firstconclusion', 'lollapalooza'];

export const CUES: Record<ModelKey, string> = {
  redundancy: 'A critical outcome depends on a single person, system, supplier, or revenue source.',
  compound: 'Consistent effort is producing invisible results — or you feel the urge to abandon something directional.',
  breakpoint: 'Conditions have been slowly accumulating with no visible change, or something just shifted far beyond what the inputs would predict.',
  darwin: 'The rules of the game seem to have changed, or something that worked reliably before has suddenly stopped working.',
  incentive: 'Someone is recommending something and they have something to gain from the outcome.',
  social: 'Everyone around you seems to agree, or you feel pressure to match an apparent consensus.',
  commitment: "You've publicly championed a position, person, or decision that new evidence is now challenging.",
  liking: 'You really like — or really dislike — the person central to the decision.',
  availability: 'A recent vivid or dramatic event is shaping your probability estimates.',
  firstconclusion: 'An explanation appeared quickly and feels satisfying and complete — especially when a competing signal is present.',
  lollapalooza: "You feel unusually certain about a high-stakes decision, or multiple things you want are all pointing in the same direction.",
};

export interface DecideScenario {
  model: ModelKey;
  sit: string;
  opts: string[];
  correct: number;
  reveal: string;
}

export const DECIDE_SCENARIOS: DecideScenario[] = [
  {
    model: 'redundancy',
    sit: "You're advising a founder whose startup is growing fast. 80% of revenue comes from one enterprise client — month-to-month contract, single industry, no long-term renewal signed. The client is happy and paying on time. The founder wants to pause all other sales efforts and focus entirely on deepening that relationship. What do you advise?",
    opts: [
      "Agree — focus where the money is. The client is happy and diversifying now splits attention dangerously.",
      "Keep some capacity for new business development even while deepening the key relationship.",
      "Deliberately reduce that client to under 50% of revenue immediately regardless of growth cost.",
      "It depends on the founder's runway and burn rate.",
    ],
    correct: 1,
    reveal: "Option A is tempting because focus is genuinely valuable. But the scenario gives you three explicit fragility signals: month-to-month contract, single industry exposure, and 80% concentration. Any one of those alone warrants attention. All three together means one decision by one buyer ends the company. Option C overcorrects. Option D mistakes runway for safety — you can have good runway and still have a single point of failure.",
  },
  {
    model: 'compound',
    sit: "A colleague has been writing a weekly newsletter for 8 months. He has 400 subscribers — but a 54% open rate, roughly 30% of new subscribers arrive via organic forwards from existing ones, and replies come in after almost every issue. He expected 10,000 subscribers by now and is ready to quit and pivot to short-form content for faster feedback. What do you tell him?",
    opts: [
      "Agree — faster feedback loops will help him find what actually resonates.",
      "Tell him to double his publishing frequency to accelerate the growth curve.",
      "Encourage him to stay the course — the leading indicators show compounding is structurally happening, and switching resets the clock.",
      "Suggest he study how faster-growing newsletters approached their first year.",
    ],
    correct: 2,
    reveal: "This scenario is specifically designed around the diagnostic layer: without the engagement data, 'stay the course' would not be a defensible answer. But a 54% open rate, organic forward-driven acquisition, and consistent replies are all leading indicators that compounding is structurally occurring — the mechanism is working, the base is growing, the curve just hasn't bent visibly yet. Switching format resets that base. Option A conflates feedback speed with compounding. This model fires when consistent effort is producing invisible results AND the leading indicators confirm the mechanism is real.",
  },
  {
    model: 'breakpoint',
    sit: "A city planner debates installing 50 more EV charging stations. Adoption has been flat at 3% for four years despite falling car prices and improving battery range. Budget is tight. Skeptics say: 'if people wanted EVs, they'd have them by now.' What's the strongest counterargument for investing now?",
    opts: [
      "EV technology keeps improving, so adoption will follow regardless of infrastructure.",
      "Other major cities are making the same investment and seeing results.",
      "Four years of flat adoption while underlying conditions accumulate may signal a system near threshold — infrastructure investment could be the trigger that tips it into self-reinforcing growth.",
      "3% already represents significant absolute numbers in a large metro area.",
    ],
    correct: 2,
    reveal: "The skeptics are reading stable output as evidence that nothing is building. But breakpoint systems absorb change invisibly right up until threshold — falling prices and better batteries are accumulating conditions. Once adoption crosses the critical mass where everyone knows someone with an EV, demand for charging becomes self-reinforcing. Option A ignores that infrastructure is the specific trigger being debated. Option B is social proof, not structural reasoning.",
  },
  {
    model: 'darwin',
    sit: "You're a 15-year veteran consultant with deep technical methodology expertise. A junior colleague keeps winning clients you'd expect to win. Her proposals are less technically rigorous than yours — shorter, more visual, faster delivery timelines. When you ask clients why, they say they want 'accessible, fast, actionable.' What's the most useful frame?",
    opts: [
      "She's better at marketing — invest more in how you present your work.",
      "Clients are becoming less sophisticated and demanding less rigor.",
      "Adopt her format while keeping your technical depth as a differentiator.",
      "Treat this as an environmental signal — the client feedback is telling you what the environment is currently selecting for, and your expertise may be optimized for conditions that have shifted.",
    ],
    correct: 3,
    reveal: "Options A and C are tactical responses to a structural problem. Option B is self-serving distortion. The client feedback ('accessible, fast, actionable') is direct signal from the environment about what it's selecting for — and it isn't technical depth. Option D is correct because it names the mechanism and positions the right next question: not 'how do I sell my method better' but 'does my method fit what the environment rewards now?'",
  },
  {
    model: 'incentive',
    sit: "Your financial advisor recommends moving a significant portion of your portfolio into actively managed funds. He shows solid 5-year historical returns and a credible thesis. The funds carry a 1.2% annual management fee — which is how he earns his compensation on this account. What's the first thing to examine before evaluating the returns data?",
    opts: [
      "Whether the historical returns are audited and risk-adjusted.",
      "Whether the fund strategy aligns with your time horizon and risk tolerance.",
      "Whether the recommendation is structurally shaped by his compensation — his incentive and yours may not be pointing in the same direction.",
      "Whether there are comparable funds with better net-of-fee performance.",
    ],
    correct: 2,
    reveal: "Options A, B, and D are all legitimate due diligence — but they skip the foundational question: whose interest is this recommendation serving? Incentive bias says even ethical, intelligent people unconsciously bend their perception of evidence toward outcomes that benefit them. The advisor may genuinely believe these funds are right for you. That's exactly what makes it dangerous — it doesn't feel like a conflict of interest from the inside.",
  },
  {
    model: 'social',
    sit: "You're in a product strategy meeting. The CEO proposes a bold pivot that would take 18 months to execute. You have serious, specific reservations about market timing that you haven't shared. You look around the room and every senior leader is nodding. What do you do?",
    opts: [
      "Trust the group — they likely have context and pattern recognition you don't.",
      "Nod along and request a private conversation with the CEO afterward.",
      "Say nothing now but document your reservations formally in writing.",
      "Recognize that apparent consensus may be manufactured by each person reading the room — and raise your specific concern now, before the decision hardens.",
    ],
    correct: 3,
    reveal: "Options A, B, and C all defer to a consensus that may not exist. Each person at the table is reasoning based on what others appear to believe, not from independent analysis. The group's unanimity can be an illusion built from mutual avoidance of dissent. By the time you request a private meeting, the decision has political momentum. You have a specific, substantive concern — raising it now is both more defensible and more valuable.",
  },
  {
    model: 'commitment',
    sit: "Six months ago you publicly championed hiring a senior executive, staking your own credibility on the recommendation. Performance is now clearly below expectations — missed targets, poor culture fit confirmed by three separate team members. Your CEO asks: 'What's your honest read?' You notice yourself mentally rehearsing ways to contextualize the underperformance before answering. What does that mental rehearsal signal?",
    opts: [
      "That you're being appropriately thorough before making a serious claim.",
      "That you need more data before you can give a fair assessment.",
      "That commitment bias is actively shaping how you're framing the evidence — and your honest answer is probably the one you're working to avoid.",
      "That the situation is genuinely ambiguous and deserves nuance.",
    ],
    correct: 2,
    reveal: "The tell is in the scenario itself: you're rehearsing contextualization before speaking, not after being challenged. That's the bias operating in real time — generating defensive framing before the question is even asked. Options A, B, and D are all things commitment bias sounds like from the inside. The evidence is clear: missed targets, poor culture fit, confirmed by multiple sources. The only thing making it feel ambiguous is that you championed the hire.",
  },
  {
    model: 'liking',
    sit: "A founder you deeply admire is raising a seed round and wants your check. You've watched her build for two years and believe in her character completely. The market is genuinely crowded, the unit economics aren't proven, and two investors you respect already passed. She asks for your decision this week. What's the most important question to run before deciding?",
    opts: [
      "Is my read on the market actually right, or am I being too conservative given her track record?",
      "Would I write this check if a founder I'd never met brought me the exact same pitch, same market, same numbers?",
      "Am I underweighting how much founder quality matters at the seed stage?",
      "Is the two-week pressure window a real deadline or a manufactured one?",
    ],
    correct: 1,
    reveal: "Option B is the Munger inversion that cuts through liking bias. Options A and C both reframe the bias as potentially valid signal — which is exactly how liking bias operates. It doesn't feel like distortion; it feels like reconsidering evidence you dismissed too quickly. The test is stark: if the answer to option B is 'probably not' — that gap between how you'd treat her versus a stranger is the bias doing the work.",
  },
  {
    model: 'availability',
    sit: "A high-profile AI startup just collapsed publicly — bad press, customer harm, leadership implosion. It dominated your industry's news for two weeks. Your board is now hesitant to approve the AI tooling budget you've been pushing for six months, despite strong vendor due diligence, pilot results, and a clear ROI case already built. What's the precise problem with their current reasoning?",
    opts: [
      "They're being appropriately cautious given that AI risk is real and not fully understood.",
      "They're letting one vivid, emotionally available failure stand in as evidence about probability — rather than evaluating it against base rates and your actual pilot data.",
      "They need more time — the news cycle will pass and the decision will be easier.",
      "You need a different messenger — a board member advocate would carry more weight than your ROI case.",
    ],
    correct: 1,
    reveal: "Option A isn't wrong as a general principle, but it doesn't explain why the existing due diligence and pilot results are now being ignored. The specific problem is availability bias: one vivid failure has become cognitively representative of the entire category in a way the base rate doesn't support. Your pilot data exists precisely to counteract this. Options C and D are about managing around the bias rather than correcting it.",
  },
  {
    model: 'firstconclusion',
    sit: "Your application goes down at 2pm on a Friday. The symptoms look exactly like a database connection issue — your team has seen this before and the fix is well-understood. But the outage started 9 minutes after a major deployment was pushed to production that afternoon. You feel clear on the diagnosis and the database fix would take about 25 minutes. What should you do before starting the fix?",
    opts: [
      "Start the database fix immediately — in a production outage, speed is paramount and the diagnosis fits.",
      "Spend two minutes investigating whether the deployment is the actual cause before committing to the database fix.",
      "Roll back the deployment first since it's the most recent change.",
      "Alert the team and get a second opinion while you start on the database fix in parallel.",
    ],
    correct: 1,
    reveal: "The scenario deliberately gives you two signals: the symptoms fit the familiar diagnosis (first conclusion), and there's a deployment 9 minutes before the outage (competing signal). Option A treats speed as a reason to ignore the competing signal — but a wrong fix in production costs more time than a 2-minute investigation. Option C assumes the deployment is the cause, overcorrecting in the other direction. Option D starts the fix before the investigation. Option B is correct: the competing signal must be ruled out before committing.",
  },
  {
    model: 'lollapalooza',
    sit: "You're deciding whether to leave your current role for a high-profile opportunity at a company you've admired for years. The comp is significantly higher. Three people whose judgment you trust have all said 'you have to do this.' You've told your partner and several colleagues you're excited. The person hiring you is someone you deeply respect. You feel more certain about this than almost any decision you've made. What should that certainty specifically prompt you to do?",
    opts: [
      "Move forward — certainty built from multiple independent inputs is usually earned, not manufactured.",
      "Negotiate harder first, then commit — high certainty gives you leverage.",
      "Slow down and map which biases may be firing simultaneously, because the specific combination of financial incentive, social proof, public commitment, and admiration is a textbook Lollapalooza setup.",
      "Share it with one more trusted advisor who is skeptical of the company.",
    ],
    correct: 2,
    reveal: "Each factor feels like independent confirmation: comp increase (incentive bias), three trusted endorsements (social proof), you've already told people (commitment bias), admiration for the hiring manager (liking bias). But they aren't independent — they're four biases all pointing in the same direction and compounding each other's effect. Munger's core insight: when multiple biases align, the distortion is multiplicative, not additive. Option D is good practice but doesn't address the structural problem.",
  },
];

export interface SpotScenario {
  model: ModelKey;
  text: string;
  reveal: string;
}

export const SPOT_SCENARIOS: SpotScenario[] = [
  { model: 'redundancy', text: "Maya is the only person at her company who knows how to run the quarterly financial model. She's hospitalized for two weeks after an accident. The entire finance team is paralyzed — no reports, no projections, no decisions.", reveal: "Single point of failure. One node going down brought the whole system down. A redundancy-aware setup would have at least one other person trained on the process, or documentation that could stand in. Any system with one critical node is fragile by design." },
  { model: 'compound', text: "A coach gives one small, specific improvement note to each athlete after every session — nothing dramatic. Two years later, his athletes are consistently beating teams with louder, more intense coaching styles.", reveal: "Small consistent advantages compounding. Each improvement builds on the previous one. The gap grows wider every week not because any single session was special, but because the base keeps growing — and each period's gain is calculated against a bigger base than the last." },
  { model: 'breakpoint', text: "Engineers at a dam recorded small, gradual increases in water pressure for three years. Every reading was within safe limits. On a Tuesday afternoon, with no warning, a 20-meter section collapsed in seconds.", reveal: "Breakpoint behavior. The system absorbed stress incrementally while appearing stable, right up until it crossed a structural threshold it couldn't hold. The last measurement before the collapse looked just like all the others. The failure was caused by all the readings accumulated — not the final one." },
  { model: 'darwin', text: "A travel agency employed the most experienced consultants in the business — 25 years of deep expertise, relationships with every hotel chain on earth. Online booking platforms launched. Within five years, their hard-won expertise was economically worthless.", reveal: "Perfect local fitness became perfect exposure. Their skills were optimized for one environment (pre-internet booking) that ceased to exist. They weren't outcompeted by better travel agents — they were outcompeted by a different kind of organism in a changed environment." },
  { model: 'incentive', text: "A doctor recommends an expensive surgical procedure. His practice owns the surgical suite where the operation would take place.", reveal: "Incentive bias in its most direct form. He may genuinely believe surgery is the best option — the bias doesn't require malice. But his financial stake in the outcome structurally compromises his objectivity. The recommendation can't be fairly evaluated without first understanding whose interest it serves." },
  { model: 'social', text: "All ten executives in a boardroom nod as the CEO proposes a high-risk acquisition. After the meeting, seven of them separately tell their assistants they thought it was a bad idea.", reveal: "Social proof bias. Each person read the room, saw apparent consensus, and updated toward agreement. The group's apparent belief was manufactured by mutual deference — everyone avoiding being first to dissent. The unanimity was an illusion with no one actually holding the view." },
  { model: 'commitment', text: "A VC firm passed on a startup two years ago. The founders are back — 3x revenue, profitable, clean unit economics. The partners spend most of the re-pitch finding small technical reasons to hesitate despite the strong metrics.", reveal: "Commitment bias. Having publicly passed on the deal, their brains are now motivated to find reasons the original decision was right — not to evaluate the new evidence fairly. The bias feels like rigorous due diligence. It's identity protection in the shape of analysis." },
  { model: 'availability', text: "After watching three documentaries about plane crashes, a traveler cancels an international flight and drives the same distance instead.", reveal: "Availability bias. Vivid images of crashes are now highly available in her mind, distorting her probability estimate. The base rate tells a different story: driving the same distance is orders of magnitude more dangerous than flying. The fix: always force a base rate check against the vivid anecdote." },
  { model: 'firstconclusion', text: "A startup's sales are declining. The CEO quickly identifies a pricing issue, launches a repricing campaign, and stops investigating. Sales continue to decline.", reveal: "First conclusion bias. The pricing explanation fit the symptoms and felt satisfying, so the investigation closed. The actual cause — a competitor launching a feature that made the product less relevant — was never examined. The brain discarded competing signals rather than using them to reopen the question." },
  { model: 'liking', text: "An investor backs a startup with a crowded market, unclear unit economics, and poor timing. When asked why, she says: 'I just know this founder can figure it out.'", reveal: "Liking bias. Admiration for the founder is bending her perception of the deal itself. The same pitch from a founder she didn't know would likely get a pass. Liking bias doesn't feel like distortion — it feels like conviction and pattern recognition." },
  { model: 'lollapalooza', text: "A mid-level employee gets an offer from a prestigious firm. It pays more, his mentor encouraged him to take it, he's told people he's excited, and the hiring manager is someone he admires. He feels completely certain and signs without negotiating.", reveal: "Multiple biases firing in the same direction: incentive (more money), social proof (mentor approved), commitment (told people), liking (admires the manager). Munger's insight: these don't add — they multiply. The certainty feels earned. It's partly manufactured." },
];

export interface TeachModel {
  questions: string[];
  tested: string[];
}

export const TEACH_DATA: Record<ModelKey, TeachModel> = {
  redundancy: {
    questions: [
      "I think I get it — have a backup plan. But isn't that just basic caution? What makes this a model worth studying specifically?",
      "You mentioned single points of failure — but everything is connected. How do you decide which nodes actually need a backup?",
      "If redundancy is so valuable, why don't all systems build it in? What do you give up?",
    ],
    tested: [
      "Redundancy is a designed system property — not just informal caution, but a deliberate architectural choice that prevents cascading failure. The distinction is intention and structure, not just having a plan B.",
      "Critical nodes are identified by risk asymmetry: back up things where failure is catastrophic and irreversible. The question is which nodes, if they failed, would take the whole system down.",
      "Redundancy adds cost, complexity, and overhead. Optimized systems naturally shed it as inefficiency. That tension is the real insight — there's a legitimate cost, and the model helps you decide when it's worth paying.",
    ],
  },
  compound: {
    questions: [
      "What's actually different about compound growth compared to just improving consistently over time?",
      "You said time is the multiplier — so starting earlier always wins? What if you compound the wrong thing?",
      "What's the hardest part about using this model in real life? Why do people abandon it before it pays off?",
    ],
    tested: [
      "In compound growth the base itself grows, so each period's gain is larger than the last. It's not linear — every step is bigger than the previous one because you're earning returns on prior returns.",
      "Direction matters as much as duration. Compounding a bad habit, wrong skill, or destructive relationship produces catastrophic downward outcomes at the same rate. Time is neutral — it multiplies whatever you give it.",
      "The J-curve problem: the early phase of compounding looks identical to failure. The key is learning to read leading indicators — engagement, organic referral, accumulated quality — rather than just headline numbers.",
    ],
  },
  breakpoint: {
    questions: [
      "I think I understand breakpoint and tipping point — aren't they basically the same thing?",
      "Autocatalysis — the reaction fuels itself. But what makes it start in the first place?",
      "If these are so powerful once they begin, why is it so hard to predict when they'll happen? What's the practical use?",
    ],
    tested: [
      "They're related but distinct. Breakpoint = structural failure under accumulated stress. Tipping point = transition to a qualitatively different state. Autocatalysis = the output fuels its own continuation. One is failure, one is transformation, one is self-acceleration.",
      "Autocatalysis requires activation energy — an initial push past threshold. It doesn't self-start. The model tells you what happens after the spark lands, not what provides the spark.",
      "Most buildup is invisible by design. The value isn't predicting the exact moment — it's learning to read accumulating conditions before the snap.",
    ],
  },
  darwin: {
    questions: [
      "Survival of the fittest — the strongest and most capable survive, right?",
      "You said the environment does the selecting. Does that mean individuals have no agency?",
      "What's the most dangerous implication for someone who is currently succeeding?",
    ],
    tested: [
      "It's not about strength — it's about fit to the current environment. The strongest organism in the old environment can be the least fit in the new one. Fitness is always local, temporary, and defined by conditions that will eventually change.",
      "Agency exists in three places: introducing variation (developing new traits), choosing environments (going where your traits are advantaged), and timing (moving before the old environment disappears).",
      "Current success = high local fitness = likely high specialization = maximum fragility when the environment shifts. Success itself generates the conditions for future brittleness.",
    ],
  },
  incentive: {
    questions: [
      "Incentive bias just means people are corrupt when money is involved?",
      "The bias is unconscious — does that mean you can never trust someone who has a financial stake?",
      "What's the structural fix, beyond just being more aware of it?",
    ],
    tested: [
      "The bias doesn't require dishonesty — it operates automatically, even in ethical people. That's exactly what makes it dangerous. Awareness is not a defense.",
      "No — it means you calibrate the weight you give the advice and look for corroborating evidence from parties with different incentives. The tool is calibration and triangulation, not blanket distrust.",
      "Alignment: design the incentive structure so the advisor's payoff depends on your good outcome, not their activity. Engineer better outcomes by designing incentives, not just by being suspicious.",
    ],
  },
  social: {
    questions: [
      "If everyone in the room agrees, isn't that strong evidence the idea is right?",
      "How do you tell a genuine consensus from a manufactured one?",
      "What's the structural defense against social proof in group settings?",
    ],
    tested: [
      "Unanimous agreement is often the worst signal, not the best. Each person reasons from others' apparent beliefs rather than independently. The consensus can be an illusion built from mutual deference.",
      "The test: did each person form their view independently before the group met? Pre-meeting anonymous polling or written positions reveal genuine consensus. Social proof consensus collapses when you ask people to commit before seeing others' views.",
      "Designated devil's advocate, anonymous polling before discussion, writing individual views before any group interaction begins. The goal is to create independence before the social influence mechanism activates.",
    ],
  },
  commitment: {
    questions: [
      "If you update a public commitment, doesn't that just damage your credibility?",
      "How do you distinguish between commitment bias and genuine conviction that you're right?",
      "What's the practical defense against this one?",
    ],
    tested: [
      "No — doubling down on a wrong position damages credibility far more than updating it. People who update quickly when evidence changes gain credibility over time. Being wrong and staying wrong is the credibility killer.",
      "The test: are you engaging with the new evidence and generating genuine rebuttals, or finding reasons to dismiss it without engaging? Genuine conviction can articulate what evidence would change its mind. Commitment bias cannot.",
      "Be slow to form strong public positions. Build explicit update triggers into decisions in advance — decide before your identity gets attached what evidence would cause you to change course.",
    ],
  },
  liking: {
    questions: [
      "Can you ever use instinctive liking for someone as useful information in a decision?",
      "You said apply the same standard you'd use for a stranger. But isn't that wrong — relationships and track record are legitimately valuable?",
      "What about the hate side — how does disliking someone distort decisions differently?",
    ],
    tested: [
      "Yes — liking can be signal. The question is whether you're using it as one factor or letting it override evidence. The bias is when liking bends your perception of the facts themselves rather than being weighed alongside them.",
      "Relationship history and demonstrated reliability are legitimate — that's track record, not liking. The bias is specifically when personal warmth overrides evidence about the specific decision at hand.",
      "Hating bias is often more dangerous because it feels like clear-eyed analysis. When you dislike someone, their good ideas look like bad ideas. Talented people lose organizational fights because a decision-maker's dislike poisons the read on their ideas.",
    ],
  },
  availability: {
    questions: [
      "Isn't a vivid recent failure useful information? Why discount it?",
      "You mentioned base rates as the fix. But base rates can be wrong or outdated — how do you know which to trust?",
      "Where does availability bias do the most damage at scale?",
    ],
    tested: [
      "A single vivid event is useful but should be weighted proportionally, not dramatically upweighted because it's memorable. It tells you failure is possible, not how probable. The base rate tells you probable. You need both, weighted correctly.",
      "Ideally both: the base rate as your prior, the vivid event as a potential signal the prior is shifting. The question is whether the event is an outlier or the first visible instance of a new pattern.",
      "Policy and regulation. A single highly visible disaster causes dramatic overcorrection. The tail event gets overweighted and policy gets designed for the memorable case rather than the probable one.",
    ],
  },
  firstconclusion: {
    questions: [
      "Generating alternatives sounds good in theory — doesn't it just lead to analysis paralysis?",
      "How do you know when you've thought enough? At some point you have to act.",
      "Why is this bias especially dangerous in smart people?",
    ],
    tested: [
      "The goal isn't infinite alternatives — it's one or two serious competing hypotheses before committing to the first satisfying one. This takes 60 seconds. The risk of underthinking in high-stakes decisions is vastly higher than the risk of overthinking by generating one alternative.",
      "Darwin's fix: force yourself to articulate what evidence would change your mind before committing. If you can't, you've closed the loop with commitment bias, not genuine conviction.",
      "Smart people generate convincing support for whatever conclusion they reached first more quickly and persuasively. Intelligence accelerates first conclusion bias; it doesn't guard against it. The bias doesn't make you feel uncertain — it makes you feel smart.",
    ],
  },
  lollapalooza: {
    questions: [
      "Extreme certainty being a red flag seems backwards — isn't certainty sometimes just correct?",
      "If you slow down every high-certainty decision, doesn't that add friction to your best ones too?",
      "Give me a real-world example where the Lollapalooza effect produced a catastrophic group outcome.",
    ],
    tested: [
      "Genuine certainty is based on independently evaluated evidence. Lollapalooza certainty is based on multiple biases converging. The test: can you articulate the strongest case against the conclusion? Certainty + high stakes + high personal benefit from one answer = examine carefully.",
      "The check only applies at a specific threshold: high-stakes + high-certainty + high personal benefit from one answer. Apply it selectively to the decisions that would matter most if you were wrong.",
      "The 2008 financial crisis. Incentive bias (traders compensated on volume), social proof (everyone believed the models), first conclusion (models confirmed existing beliefs), and commitment bias (institutions staked enormous capital on the assumption) all aligned. The distortion was multiplicative.",
    ],
  },
};

export interface ReferenceEntry {
  model: string;
  example: string;
}

export const REFERENCE_LIST: ReferenceEntry[] = [
  { model: 'Redundancy', example: 'An 80% single-client startup on a month-to-month contract pausing all other sales' },
  { model: 'Compound Interest', example: '400 subscribers, 54% open rate, 30% organic forwards — invisible but structurally compounding' },
  { model: 'Breakpoint & Autocatalysis', example: 'EV adoption flat at 3% for four years, tipping to 22% after infrastructure threshold' },
  { model: 'Darwinian Synthesis', example: 'A 15-year consultant losing to juniors after clients shifted from depth to speed' },
  { model: 'Incentive Bias', example: 'A financial advisor recommending the funds that generate his fee income' },
  { model: 'Social Proof', example: 'A unanimous boardroom where seven of ten privately disagreed' },
  { model: 'Commitment Bias', example: 'A VC finding new reasons to pass on a re-pitch despite 3x growth' },
  { model: 'Liking / Hating Bias', example: 'Investing in a crowded, unproven startup because you admire the founder' },
  { model: 'Availability Bias', example: 'A board blocking AI budget after one high-profile AI failure dominated the news' },
  { model: 'First Conclusion Bias', example: 'Diagnosing a production outage and missing that a deployment shipped 9 minutes earlier' },
  { model: 'Lollapalooza Effect', example: 'A career decision where pay, peer approval, public commitment, and admiration all align' },
];
