/* ═══════════════════════════════════════════════════════
   Checks every version of every R.A.D. Practice activity.
   Usage: node tools/check-versions.js   (exit 1 on any failure)
   - versions 2-4 match version 1 slot by slot: same ids, skills, parts,
     fixed sets, choice counts; color marks and "what is missing" answers spread out
   - the picked parts and the finished answer agree (Build, Look Back, Pick the Detail,
     Meet R.A.D.), and a Look Back paragraph step points at the right paragraph
   - every question is new: no question repeats across versions or activities, none
     from the worksheets/homework/R.A.D. Online Quiz 1, and a slot's right answer
     changes from version to version (except fixed sets like R / A / D)
   - no student's first name, no blank lines (____), reading level FK ≤ 3 per version
═══════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = path.resolve(__dirname, '..');
const box = { window: {} };
vm.createContext(box);
['data/rad.js', 'data/rad-versions.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(SITE, f), 'utf8'), box));
const W = box.window;
const fails = [];
const fail = m => fails.push(m);

/* Questions students already met on paper or on the quiz — never on this site */
const ELSEWHERE = [
  // Day 1 worksheets + Night 1 homework
  'What is your favorite food?', 'Why do you like recess?', 'Where do you like to read?', 'Who is your best friend?',
  'How do you get to school?', 'When do you do your homework?', 'What is your favorite color?', 'What is your favorite season?',
  'What is something you are good at?', 'What is your favorite subject in school?', 'What is one goal you have for fourth grade?',
  'Who is someone who helps you?', 'What is your favorite lunch?', 'Why do you like weekends?', 'Where do you like to play after school?',
  'Who is someone you admire?', 'What is one thing you want to learn in fourth grade?',
  // R.A.D. Online Quiz 1
  'How do you help at home?', 'Why do you like soccer?', 'What is your favorite holiday?', 'Who is someone who teaches you new things?',
  'What games do you like to play at recess?', 'Where does your family go on vacation?'
].map(s => s.toLowerCase());

/* Version 1 shown in the same shape as the others */
function versionsOf(a) {
  const v1 = a.groups ? { groups: a.groups, story: a.usesStory ? W.RAD_STORY : null } : { items: a.items };
  return [v1, ...((W.RAD_VERSIONS || {})[a.kind] || [])];
}
const flatItems = v => v.items || v.groups.flatMap(g => g.steps.map(s => Object.assign({ group: g }, s)));
const right = it => it.choices ? it.choices[it.answer == null ? 0 : it.answer] : null;
const join = r => [r.R, r.A, r.D].filter(Boolean).join(' ');

/* Reading level (same formula as the build) */
function syl(w) { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (!w) return 0; if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const m = w.match(/[aeiouy]{1,2}/g); return m ? m.length : 1; }
function fk(texts) { let s = 0, w = 0, y = 0;
  texts.forEach(t => { s += Math.max(1, t.split(/[.!?…]+/).filter(x => /[A-Za-z]/.test(x)).length);
    const words = t.split(/\s+/).filter(x => /[A-Za-z]/.test(x)); w += words.length; words.forEach(x => y += syl(x)); });
  return 0.39 * (w / s) + 11.8 * (y / w) - 15.59; }

/* Student first names (from the roster in script.js) */
const roster = fs.readFileSync(path.join(SITE, 'script.js'), 'utf8').match(/const ROSTER = \[([\s\S]*?)\];/)[1];
const firstNames = [...roster.matchAll(/name: "[^,"]*, ([^" ]+)/g)].map(m => m[1].replace(/[^A-Za-z']/g, '')).filter(Boolean);

const allAsks = new Map();      // ask → where it was used
const report = [];

W.RAD_ACTIVITIES.forEach(a => {
  const versions = versionsOf(a);
  if (versions.length !== 4) fail(`${a.kind}: ${versions.length} versions (want 4)`);
  const base = flatItems(versions[0]);
  const rightsBySlot = {};

  versions.forEach((v, vi) => {
    const tag = `${a.kind} v${vi + 1}`;
    const items = flatItems(v);
    const texts = [];
    if (items.length !== base.length) fail(`${tag}: ${items.length} questions (version 1 has ${base.length})`);

    items.forEach((it, i) => {
      const b = base[i] || {};
      const at = `${tag} ${it.id}`;
      if (it.id !== b.id) fail(`${at}: id should be ${b.id}`);
      if (it.skill !== b.skill) fail(`${at}: skill "${it.skill}" ≠ version 1 "${b.skill}"`);
      if ((it.part || '') !== (b.part || '')) fail(`${at}: part ${it.part} ≠ ${b.part}`);
      if (!!it.fixed !== !!b.fixed) fail(`${at}: fixed choices differ from version 1`);
      if (!!it.story !== !!b.story) fail(`${at}: story / no story differs from version 1`);
      if (!!it.given !== !!b.given || (!!it.shown) !== (!!b.shown) || typeof it.shown !== typeof b.shown) fail(`${at}: shape differs from version 1`);
      if (a.kind !== 'color') {
        if (!it.choices || it.choices.length !== (b.choices || []).length) fail(`${at}: ${it.choices && it.choices.length} choices (version 1 has ${(b.choices || []).length})`);
        else {
          if (new Set(it.choices).size !== it.choices.length) fail(`${at}: two choices are the same`);
          const ai = it.answer == null ? 0 : it.answer;
          if (ai < 0 || ai >= it.choices.length) fail(`${at}: answer index ${ai} out of range`);
          if (it.kinds && (it.kinds.length !== it.choices.length || it.kinds[ai] !== 'good')) fail(`${at}: kinds do not line up with the choices`);
          if (it.kinds) it.kinds.forEach(k => { if (k !== 'good' && !W.RAD_KIND_NOTES[k]) fail(`${at}: unknown kind ${k}`); });
          if (it.notes && it.notes.length !== it.choices.length) fail(`${at}: notes do not line up with the choices`);
          if (it.fixed && JSON.stringify(it.choices) !== JSON.stringify(b.choices)) fail(`${at}: a fixed set must keep version 1's choices`);
        }
      } else if (!it.shown || !'RAD'.includes(it.shown.mark) || !it.shown.R || !it.shown.A || !it.shown.D) fail(`${at}: Color-Check needs R, A, D and a mark`);
      if (!it.why) fail(`${at}: no "why" line`);

      // the picked parts and the finished answer agree
      if (it.group) {
        const g = it.group;
        if (it.part === 'P') {
          if (right(it) !== `Paragraph ${g.para}`) fail(`${at}: paragraph step says ${right(it)}, the question is in paragraph ${g.para}`);
          if (!v.story || !v.story.paragraphs[g.para - 1]) fail(`${at}: paragraph ${g.para} does not exist`);
          if (g.model.para !== g.para) fail(`${at}: model paragraph ${g.model.para} ≠ ${g.para}`);
        } else if (right(it) !== g.model[it.part]) fail(`${at}: right choice "${right(it)}" ≠ the built ${it.part} "${g.model[it.part]}"`);
      }
      if (it.given) {
        if (!it.model || it.model.R !== it.given.R || it.model.A !== it.given.A || it.model.D !== right(it)) fail(`${at}: given + right detail ≠ the finished answer`);
      }
      if (a.kind === 'meet' && it.model && right(it) !== join(it.model)) fail(`${at}: the R.A.D. choice ≠ the finished answer`);

      // every question is new
      const ask = it.group ? it.group.ask : it.ask;
      if (ask) {
        const key = ask.toLowerCase();
        if (ELSEWHERE.includes(key)) fail(`${at}: "${ask}" is on a worksheet, homework or the quiz`);
        const where = `${a.kind} v${vi + 1}`;
        if (allAsks.has(key) && allAsks.get(key) !== where && !it.group) fail(`${at}: "${ask}" is also used in ${allAsks.get(key)}`);
        if (!allAsks.has(key)) allAsks.set(key, where);
      }
      // the slot's right answer changes from version to version
      const inherent = it.fixed || a.kind === 'color' || a.kind === 'clues' || it.part === 'P' || ['M01', 'M02', 'M03', 'T05'].includes(it.id);
      if (!inherent) {
        const r = right(it);
        (rightsBySlot[it.id] = rightsBySlot[it.id] || []).forEach(prev => { if (prev === r) fail(`${at}: right answer "${r}" repeats an earlier version`); });
        rightsBySlot[it.id].push(r);
      }

      // text for the reading level + the blanket checks
      [it.q, it.story, ask, it.why, typeof it.shown === 'string' ? it.shown : it.shown && join(it.shown), it.given && join(it.given),
       it.model && join(it.model), ...(it.choices || []), ...(it.notes || []).filter(Boolean)].filter(Boolean).forEach(t => texts.push(t));
    });
    if (v.story) v.story.paragraphs.forEach(p => texts.push(p));
    if (v.groups) v.groups.forEach(g => { texts.push(g.ask); texts.push(join(g.model)); });

    // spread: Color-Check marks and "what is missing" answers
    if (a.kind === 'color') {
      const n = { R: 0, A: 0, D: 0 }; items.forEach(it => n[it.shown.mark]++);
      if (n.R !== 3 || n.A !== 3 || n.D !== 3) fail(`${tag}: yellow boxes R${n.R} A${n.A} D${n.D} (want 3 each)`);
    }
    if (a.kind === 'check') {
      const n = [0, 0, 0, 0]; items.forEach(it => n[it.answer]++);
      if (n.some(x => x !== 2)) fail(`${tag}: answers ${n.join('/')} (want 2 of each)`);
    }

    const all = texts.join(' \n ');
    if (/_{2,}/.test(all)) fail(`${tag}: a blank line (____)`);
    firstNames.forEach(nm => { if (new RegExp(`\\b${nm}\\b`).test(all)) fail(`${tag}: uses a student's first name, ${nm}`); });
    const grade = fk(texts);
    if (grade > 3) fail(`${tag}: reading level FK ${grade.toFixed(1)} (want ≤ 3)`);
    report.push(`${tag.padEnd(10)} ${String(items.length).padStart(2)} questions · FK ${grade.toFixed(1)}`);
  });
});

console.log(report.join('\n'));
console.log(`\nStudent first names checked: ${firstNames.length}`);
if (fails.length) { console.log(`\n${fails.length} problem(s):\n` + fails.map(f => '  ✗ ' + f).join('\n')); process.exit(1); }
console.log('\nAll versions pass.');
