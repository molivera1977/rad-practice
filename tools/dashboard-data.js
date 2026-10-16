/* ═══════════════════════════════════════════════════════
   R.A.D. Practice → Teacher Dashboard
   Rewrites the block between /* RADP:BEGIN *\/ and /* RADP:END *\/ in
   "Mr. O's Teacher Dashboard/index.html" from this site's data/rad.js, so the
   dashboard's question list always matches the site: one entry per activity
   (kind, letter, label) with every scored question as { id, skill, q }.
   q is worded the way the site saves a miss (the ask + the question being
   answered), so a miss on the dashboard reads the same as the bank.
   Usage:  node tools/dashboard-data.js          (rewrite the dashboard block)
           node tools/dashboard-data.js --print  (print the block only)
═══════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = path.resolve(__dirname, '..');
const DASH = path.resolve(SITE, '..', "Mr. O's Teacher Dashboard", 'index.html');

const box = { window: {} };
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(SITE, 'data', 'rad.js'), 'utf8'), box);
const W = box.window;

// Same wording as the site (script.js STEP_ASK / STORY_STEP_ASK / missText)
const STEP_ASK = {
  P: 'Look back in the story. Which paragraph tells the answer?',
  R: 'Pick the Restate. Which start uses the key words?',
  A: 'Pick the Answer. Which words answer the question?',
  D: 'Pick the Detail. Which detail tells MORE?'
};
const STORY_STEP_ASK = Object.assign({}, STEP_ASK, {
  A: 'Pick the Answer. Which words from the story answer the question?',
  D: 'Pick the Detail. Which detail from the story tells MORE?'
});
const COLOR_Q = 'Which part of the R.A.D. answer is in the yellow box?';

function missText(q, ask, shown) {
  let t = q;
  if (ask) t += ` Question: “${ask}”`;
  if (shown && shown.mark) t += ` Yellow box: “${shown[shown.mark]}”`;
  else if (typeof shown === 'string') t += ` Answer: “${shown}”`;
  return t;
}

const activities = W.RAD_ACTIVITIES.map((a, i) => {
  const items = [];
  (a.items || []).forEach(it => items.push({
    id: it.id, skill: it.skill,
    q: missText(a.kind === 'color' ? COLOR_Q : it.q, it.ask, it.shown)
  }));
  (a.groups || []).forEach(g => g.steps.forEach(s => items.push({
    id: s.id, skill: s.skill,
    q: missText((a.usesStory ? STORY_STEP_ASK : STEP_ASK)[s.part], g.ask)
  })));
  return { kind: a.kind, n: i + 1, letter: a.letter, label: a.label, items };
});

const ids = activities.flatMap(a => a.items.map(q => q.id));
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) { console.error('Duplicate question ids:', dup.join(', ')); process.exit(1); }
const badLetter = activities.flatMap(a => a.items.filter(q => q.id[0] !== a.letter).map(q => q.id));
if (badLetter.length) { console.error('Ids that do not start with their activity letter:', badLetter.join(', ')); process.exit(1); }

const block = `/* RADP:BEGIN */\nconst RADP_ACTIVITIES = ${JSON.stringify(activities)};\n/* RADP:END */`;

if (process.argv.includes('--print')) { console.log(block); process.exit(0); }

const html = fs.readFileSync(DASH, 'utf8');
const re = /\/\* RADP:BEGIN \*\/[\s\S]*?\/\* RADP:END \*\//;
if (!re.test(html)) { console.error('No RADP:BEGIN / RADP:END markers in the dashboard. Add the R.A.D. Practice block first.'); process.exit(1); }
fs.writeFileSync(DASH, html.replace(re, () => block));
console.log(`Dashboard updated: ${activities.length} activities, ${ids.length} questions.`);
