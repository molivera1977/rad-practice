/* ═══════════════════════════════════════════════════════
   R.A.D. PRACTICE · script.js
   Learning R.A.D. answers — not a test. Marcos 10/15: "this group is not
   ready to fully write them. We must use this site for them to build their
   understanding and to see what good RAD answers look like."
   So: no typing anywhere. Each activity opens with lesson cards (heard to the
   end before Next), every question is answered by picking, every answer ends
   with a finished R.A.D. answer in the color check (blue Restate, green
   Answer, red Detail), and after a miss the student hears why before Next.
   Built on the Wonders Vocabulary Practice engine: same sign-in, read aloud,
   timers, save and resume, time-keeping, share link and score sending.
   Lessons and items: data/rad.js
   Timers: 20s instructions lock · 12s read lock · 6s next soak
   Game keys: rad-practice-<kind>   Question ids: letter + number (M01, B07)
   PIN: 9377 (Teacher override)
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const REVIEW_OPEN   = true;      // false = students locked out; only Teacher Access works. Set true to open.
const SHARE_MODE    = !!window.SHARE_MODE;   // set by share.js — a visitor's link, never a student's
const INSTRUCT_SECS = 20;
const READ_SECS     = 12;
const NEXT_SECS     = 6;
const STORAGE_KEY   = 'radp_session_v1';
const SCORES_KEY    = 'radp_scores_v1';
const AWOC_SESSION_ID_KEY = 'radp_session_id_v1';
const SESSION_ID = (() => {
  let id = localStorage.getItem(AWOC_SESSION_ID_KEY);
  if (!id) { id = 'RADP-' + Math.random().toString(36).slice(2, 9).toUpperCase(); localStorage.setItem(AWOC_SESSION_ID_KEY, id); }
  return id;
})();

/* ── ACTIVITIES ─────────────────────────────────────
   One activity per entry in data/rad.js, in teaching order. The key (build)
   names the saved scores; the game key (rad-practice-build) names the tab the
   scores land in. */
const PARTS = {
  R: { name: 'Restate', color: 'blue' },
  A: { name: 'Answer',  color: 'green' },
  D: { name: 'Detail',  color: 'red' }
};
const ACTIVITIES = {};
(window.RAD_ACTIVITIES || []).forEach((a, i) => {
  ACTIVITIES[a.kind] = {
    key: a.kind, n: i + 1, kind: a.kind, icon: a.icon, sub: a.sub, short: a.label, data: a,
    label: `${i + 1}. ${a.label}`,
    game:  `rad-practice-${a.kind}`
  };
});
const GAME_KEYS = Object.fromEntries(Object.values(ACTIVITIES).map(a => [a.key, a.game]));
const STORY_PAGES = [];

/* ── SHEET SUBMISSION ───────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzv8CWv1yyi8NeH04now9UxVL4IZm5yMqqsEGMcgGdrcAOWVB-aSp5siTvSSJXIUpzFMA/exec';

let tabSwitchCount = 0;

/* Question HTML → plain text */
function plainText(html) {
  return String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/* One saved miss: "[ID] (Skill) question (picked: answer)" — the standard every
   review uses. Skill comes from data/skills.js by question id, so misses restored
   from an older saved attempt still get tagged. " | " separates entries, so it is
   swapped out of the pick just in case. */
function missEntry(m) {
  const skill  = m.skill || (window.SKILLS || {})[m.id] || 'Unsorted';
  const picked = m.yourAnswer == null || m.yourAnswer === '' ? '' :
    ` (picked: ${String(m.yourAnswer).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim()})`;
  return `[${m.id}] (${skill}) ${plainText(m.q)}${picked}`;
}

// Same id for the partial rows and the final row of one attempt, so the
// final row replaces the in-progress row instead of sitting beside it.
// The base id is saved with the progress, so a resume after closing the tab keeps it too.
function attemptSessionId() {
  return (app.sessionBase || SESSION_ID) + '-' + (app.currentSection || 'x') + '-A' + (app.currentAttemptNum || 1);
}

function submitScorePartial() {
  const pct = app.currentBank.length
    ? Math.round((app.score / app.currentBank.length) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:         'submit',
      game:           GAME_KEYS[app.currentSection] || 'rad-practice',
      sessionId:      attemptSessionId(),
      name:           app.studentName || 'Unknown',
      section:        app.currentSection || '?',
      score:          app.score,
      total:          app.currentBank.length,
      percent:        pct,
      status:         `In Progress (Q${app.currentIndex + 1}/${app.currentBank.length})`,
      done:           false,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      events:         JSON.stringify(app.events || []),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function submitScoreFinal() {
  const pct = app.currentBank.length
    ? Math.round((app.score / app.currentBank.length) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:         'submit',
      game:           GAME_KEYS[app.currentSection] || 'rad-practice',
      sessionId:      attemptSessionId(),
      name:           app.studentName || 'Unknown',
      section:        app.currentSection || '?',
      attempt:        app.currentAttemptNum || 1,
      score:          app.score,
      total:          app.currentBank.length,
      percent:        pct,
      status:         'Complete',
      done:           true,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      events:         JSON.stringify(app.events || []),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

/* ── ROSTER ─────────────────────────────────────────── */
const ROSTER = [
  { name: "Mr. O (Teacher)",           id: "9377" },
  { name: "Avery, Jo'Von",             id: "10053632" },
  { name: "Belasquez Bonilla, Eduin",  id: "10058674" },
  { name: "Castaneda, Kelvin",         id: "10053248" },
  { name: "Chicas-Santos, Allison",    id: "10066737" },
  { name: "Collado, Roniel",           id: "10060249" },
  { name: "Dejesus, Michael",          id: "10049434" },
  { name: "Dock, Fakeem",              id: "10059720" },
  { name: "Douglas, Iyana",            id: "10070980" },
  { name: "Dumphrey, Christopher",     id: "10060696" },
  { name: "Flores, Kiara",             id: "10052834" },
  { name: "Johnson, Destiny",          id: "10052926" },
  { name: "Jones, Tahji",              id: "10060315" },
  { name: "Lawrence, Eric",            id: "10057451" },
  { name: "Madero, Jovany",            id: "10076374" },
  { name: "Pettway, Lanaura",          id: "10060616" },
  { name: "Polanco Soriano, Thiara",   id: "10060503" },
  { name: "Roberts, Robyn",            id: "10060925" },
  { name: "Rodriguez-Jimenez, Marcos", id: "10048936" },
  { name: "Rojas, Alanie",             id: "10076388" },
  { name: "Sanchez Rodriguez, Johanelyz", id: "10076767" },
  { name: "Vega, Taishmara",           id: "10054043" },
  { name: "Watts, Autumn",             id: "10039032" },
  { name: "Zelaya-Osorto, Nazareth",   id: "10053626" }
];

const GUEST_SLOTS = {
  '937701': 'Guest 1', '937702': 'Guest 2', '937703': 'Guest 3',
  '937704': 'Guest 4', '937705': 'Guest 5', '937706': 'Guest 6',
  '937707': 'Guest 7', '937708': 'Guest 8', '937709': 'Guest 9',
  '937710': 'Guest 10'
};

const SECTION_LABELS = Object.fromEntries(Object.values(ACTIVITIES).map(a => [a.key, a.label]));

/* ── THE QUESTIONS OF ONE ACTIVITY ──────────────────
   Plain items come as they are. Color-Check gets its three fixed choices
   (R, A, D). A Build or Look Back group becomes one item per step: the
   question being answered rides on every step, `built` holds the parts already
   picked (the right ones), and the last step carries the finished answer.
   Choices are written with the right one first unless `answer` says otherwise. */
const PART_CHOICES = ['R — Restate', 'A — Answer', 'D — Detail'];
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

/* Why a wrong choice is wrong: its own note, or the note for its kind */
function choiceNote(item, i) {
  if (item.notes && item.notes[i]) return item.notes[i];
  const kind = item.kinds && item.kinds[i];
  return kind && kind !== 'good' ? ((window.RAD_KIND_NOTES || {})[kind] || '') : '';
}

/* "R — Restate" style choices (Color-Check) show a colored letter and say only the name */
const PART_RE = /^([RAD]) — (Restate|Answer|Detail)$/;
function choiceSaid(text) {
  const m = String(text).match(PART_RE);
  return m ? `the ${m[2]}` : text;
}

/* What a miss saves: the ask, plus the question being answered and the boxed words */
function missText(q) {
  let t = q.q;
  if (q.ask) t += ` Question: “${q.ask}”`;
  if (q.shown && q.shown.mark) t += ` Yellow box: “${q.shown[q.shown.mark]}”`;
  else if (typeof q.shown === 'string') t += ` Answer: “${q.shown}”`;
  return t;
}

/* ── VERSIONS (Marcos 10/19: a retry gets new questions) ──
   data/rad.js is version 1; data/rad-versions.js holds versions 2-4. Try 1 on this
   device = version 1, try 2 = version 2 … try 5 = version 1 again. Every version has
   the same ids, skills and kinds of question, so the dashboard compares them slot by
   slot; the version rides in the start event (v). Look Back has a story per version. */
function versionCount(section) {
  const act = ACTIVITIES[section];
  return act ? 1 + ((window.RAD_VERSIONS || {})[act.kind] || []).length : 1;
}
function versionData(section, version) {
  const act = ACTIVITIES[section];
  const more = (window.RAD_VERSIONS || {})[act.kind] || [];
  const v = version > 1 && more[version - 2];
  return v ? Object.assign({}, act.data, v, { story: v.story || null })
           : Object.assign({}, act.data, { story: act.data.usesStory ? window.RAD_STORY : null });
}
/* The version a try gets: the next one after the tries finished on this device */
function versionForTry(section, triesDone) {
  return (triesDone % versionCount(section)) + 1;
}

function sectionBank(section, version) {
  const act = ACTIVITIES[section];
  if (!act) return [];
  const d = versionData(section, version || 1);
  if (d.groups) {
    const out = [];
    d.groups.forEach((g, gi) => {
      const parts = g.steps.filter(s => s.part !== 'P').map(s => s.part);
      g.steps.forEach((s, si) => {
        const built = {};
        g.steps.slice(0, si).forEach(prev => { if (prev.part !== 'P') built[prev.part] = g.model[prev.part]; });
        out.push({
          id: s.id, skill: s.skill, part: s.part, group: gi, groupCount: d.groups.length,
          step: si, stepCount: g.steps.length, parts,
          q: (d.usesStory ? STORY_STEP_ASK : STEP_ASK)[s.part],
          ask: g.ask, built, para: g.para, focusPara: si > 0 ? g.para : null,
          choices: s.choices, answer: s.answer == null ? 0 : s.answer, fixed: !!s.fixed,
          notes: s.choices.map((_, i) => choiceNote(s, i)),
          why: s.why, last: si === g.steps.length - 1, model: g.model
        });
      });
    });
    return out;
  }
  return d.items.map(it => {
    const color = d.kind === 'color';
    return {
      id: it.id, skill: it.skill,
      q: color ? 'Which part of the R.A.D. answer is in the yellow box?' : it.q,
      story: it.story || '', ask: it.ask || '', shown: it.shown || null, given: it.given || null,
      choices: color ? PART_CHOICES : it.choices,
      answer: color ? 'RAD'.indexOf(it.shown.mark) : (it.answer == null ? 0 : it.answer),
      fixed: color || !!it.fixed,
      notes: color ? [] : it.choices.map((_, i) => choiceNote(it, i)),
      why: it.why,
      model: color ? { R: it.shown.R, A: it.shown.A, D: it.shown.D } : (it.model || null)
    };
  });
}

/* ── BUILD THE ACTIVITY MENU ────────────────────────── */
(function buildMenu() {
  const menu = document.getElementById('activity-menu');
  if (!menu) return;
  menu.innerHTML = `<div class="rp-menu">${Object.values(ACTIVITIES).map(a => `
    <button class="start-btn rp-act" id="btn-${a.key}" onclick="app.attemptStart('${a.key}')">
      <span class="rp-act-num" aria-hidden="true">${a.n}</span>
      <span class="rp-act-name">${a.icon} ${escapeHtml(a.short)}</span>
      <span class="form-btn-sub">${escapeHtml(a.sub)}</span>
    </button>`).join('')}</div>`;
})();

/* ── BUILD DROPDOWN ─────────────────────────────────── */
(function buildRoster() {
  const sel = document.getElementById('name-select');
  ROSTER.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name; o.textContent = s.name;
    sel.appendChild(o);
  });
  const div = document.createElement('option');
  div.disabled = true; div.textContent = '── Guest Slots ──';
  sel.appendChild(div);
  Object.entries(GUEST_SLOTS).forEach(([code, label]) => {
    const o = document.createElement('option');
    o.value = `GUEST:${code}`; o.textContent = `🙋 ${label}`;
    sel.appendChild(o);
  });
})();

/* ── STATE ──────────────────────────────────────────── */
let loggedInName     = '';
let unlockedSections = new Set();
let pinModalCallback = null;
let activeSpeakBtn   = null;
let reviewMode       = false;
let reviewAutoRun    = false;

function letterGradeStudent(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 63) return 'D';
  if (pct >= 60) return 'D-';
  return 'F';
}

let hlTimer = null;
const liveUtterances = new Set();   // speech in progress, held so its events still arrive
/* ── LISTEN, THEN NEXT (copied from math-module-2, Marcos 10/11: "the kids have to hear
   something before they can move on to the next item") ──
   After a MISS, the Next button stays hidden until the note on the mistake and the right
   answer have been heard to the end. One big Listen button; stopping early does not count;
   a second tap while it is speaking does nothing. A device that will not speak (no sound
   started within 4 s, or the voice reports an error) gets a wait long enough to read it,
   then an "I read it" button. Not after a right answer, not in the teacher's look.
   What it proves: the audio played to the end. Not that the child listened. */
const LISTEN_START_WAIT = 4000;
const listenDwellMs = words => Math.min(15000, Math.max(3000, words * 450));
let listenJob = null;   // the forced listen now speaking, if any

function stopActiveSpeech() {
  clearTimeout(hlTimer);
  if (listenJob && !listenJob.settled) listenJob.abort();   // cut off before the end → it does not count
  window.speechSynthesis.cancel();
  document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
  if (activeSpeakBtn) { activeSpeakBtn.textContent = '🔊'; activeSpeakBtn = null; }
}

/* ── HIGHLIGHT FALLBACK ─────────────────────────────
   Some voices (and some browsers) never fire word-boundary
   events, so the highlight would never move. If no boundary
   arrives shortly after speaking starts, step through the
   words on a timer paced by word length and speech rate. */
function addHighlightFallback(u, spans) {
  let fired = false, i = 0, ended = false;
  const prevB = u.onboundary, prevE = u.onend;
  u.onboundary = e => { if (e.name === 'word' && !fired) { fired = true; clearTimeout(hlTimer); } if (prevB) prevB(e); };
  // The end of the speech always stops the highlight, however the voice reports it:
  // a normal end, an error or cancel, or (some Chromebook voices) no event at all,
  // which the watch below catches by seeing the voice go quiet AFTER it started.
  // A voice that never starts is left alone: the page's own no-sound wait handles that.
  const finish = e => {
    if (ended) return;
    ended = true;
    clearInterval(watch);
    clearTimeout(hlTimer);
    spans.forEach(s => s.classList.remove('hl'));
    liveUtterances.delete(u);
    if (prevE) prevE(e || {});
  };
  u.onend = finish;
  u.onerror = finish;
  // Chrome can drop an utterance's events if nothing else holds on to it.
  liveUtterances.add(u);
  let started = false, quietTicks = 0;
  const prevS = u.onstart;
  u.onstart = e => { started = true; if (prevS) prevS(e); };
  const watch = setInterval(() => {
    const voice = window.speechSynthesis;
    if (voice.speaking) { started = true; quietTicks = 0; return; }
    quietTicks = started && !voice.pending ? quietTicks + 1 : 0;
    if (quietTicks >= 2) finish();
  }, 400);
  const step = () => {
    if (fired || ended) return;
    spans.forEach(s => s.classList.remove('hl'));
    if (i >= spans.length) return;
    const w = spans[i++];
    w.classList.add('hl');
    const len = (w.textContent || '').replace(/[^A-Za-z0-9]/g, '').length;
    hlTimer = setTimeout(step, Math.max(280, len * 70 + 120) / (u.rate || 1));
  };
  clearTimeout(hlTimer);
  hlTimer = setTimeout(step, 500);
}

/* ── HELPERS ────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFirstName(name) {
  if (!name) return 'Student';
  const parts = name.split(',');
  return parts.length > 1 ? parts[1].trim().split(' ')[0] : name.split(' ')[0];
}

function wrapWords(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let idx = 0;
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/—/g, ' — ').replace(/  +/g, ' ');
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(part => {
        if (/\S/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'wrd';
          sp.dataset.wi = idx++;
          sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (!(node.nodeType === 1 && node.hasAttribute('data-noread'))) {
      [...node.childNodes].forEach(walk);   // letter badges (data-noread) are shown, never read
    }
  }
  walk(tmp);
  return tmp.innerHTML;
}

function escapeHtml(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function choiceHtml(text) {
  return text.replace(/—/g, ' — ');
}

function getSectionAttempts(name) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  const counts = Object.fromEntries(Object.keys(ACTIVITIES).map(k => [k, 0]));
  scores.filter(s => s.name === name && s.done).forEach(s => {
    if (counts[s.section] !== undefined) counts[s.section]++;
  });
  return counts;
}

function allSectionsCompletedOnce(name) {
  return Object.values(getSectionAttempts(name)).every(n => n >= 1);
}

/* No try limit (Marcos 10/16: "remove the 2 tries limit") — this is a site for
   learning, so any activity can be done again as many times as a student wants.
   Every try is still its own row (Attempt 1, 2, 3 …), so nothing is overwritten. */
/* ── THE GATES (Marcos 10/19: "each level should be gated until the previous one has a
   score of 70 or higher. Once they are all unlocked then they can be done unlimitedly.") ──
   Activity 1 is always open. Each later activity opens when the one before it has a
   finished try at 70% or better (the BEST try counts, so a later lower score never
   closes it again). An activity the student already finished before the gates came
   stays open. Scores are remembered on the device, like Math Module 2. The Teacher PIN
   lets one student past a gate. The share link and Teacher Access have no gates. */
const PASS_PCT = 70;
function bestScore(name, section) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  return scores.filter(s => s.name === name && s.section === section && s.done && s.total > 0)
    .reduce((best, s) => (!best || s.score / s.total > best.score / best.total ? s : best), null);
}
function passed(name, section) {
  const best = bestScore(name, section);
  return !!best && best.score / best.total * 100 >= PASS_PCT;
}
/* How many right it takes: 70% of 9 questions = 7 */
function needFor(section) {
  return Math.ceil(PASS_PCT / 100 * sectionBank(section).length);
}
function prevActivity(section) {
  const keys = Object.keys(ACTIVITIES);
  const i = keys.indexOf(section);
  return i > 0 ? ACTIVITIES[keys[i - 1]] : null;
}
function nextActivity(section) {
  const keys = Object.keys(ACTIVITIES);
  const i = keys.indexOf(section);
  return i >= 0 && i + 1 < keys.length ? ACTIVITIES[keys[i + 1]] : null;
}
/* Why this activity is not open for this student yet ('' = it is open) */
function gateWait(name, section) {
  if (SHARE_MODE || reviewMode) return '';
  const prev = prevActivity(section);
  if (!prev) return '';
  if (getSectionAttempts(name)[section] > 0) return '';   // finished before the gates came: stays open
  if (passed(name, prev.key)) return '';
  return `Get ${needFor(prev.key)} of ${sectionBank(prev.key).length} on ${prev.short} first`;
}

function applyLocks(name) {
  Object.values(ACTIVITIES).forEach(act => {
    const btn = document.getElementById(`btn-${act.key}`);
    if (!btn) return;
    const sub  = btn.querySelector('.form-btn-sub');
    const why  = gateWait(name, act.key);
    const best = bestScore(name, act.key);
    // A gated button looks locked but can still be tapped, so it can say why (and take the Teacher PIN)
    btn.classList.toggle('locked', !!why);
    if (why)       sub.textContent = `🔒 ${why}`;
    else if (!best) sub.textContent = act.sub;
    else if (passed(name, act.key)) sub.textContent = `✅ Best: ${best.score} of ${best.total} · do it again anytime`;
    else sub.textContent = `🔁 Best: ${best.score} of ${best.total} · get ${needFor(act.key)} to open the next one`;
  });
}

/* ── SPEAK (directions) ─────────────────────────────── */
function speakDir(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();

  const p = btn.closest('.dir-section').querySelector('.dir-text');
  if (!p) return;
  if (!p.querySelector('.wrd')) p.innerHTML = wrapWords(p.innerHTML);

  const spans = Array.from(p.querySelectorAll('.wrd'));
  if (!spans.length) return;

  activeSpeakBtn = btn;
  btn.textContent = '⏹';

  const speechText = spans.map(s => s.textContent).join(' ');
  let hlIdx = 0;
  const u = new SpeechSynthesisUtterance(speechText);
  u.lang = 'en-US';
  u.rate = 0.92;

  u.onboundary = e => {
    if (e.name !== 'word') return;
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
    hlIdx++;
  };

  u.onend = () => {
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };

  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

/* ── SPEAK ONE BLOCK ────────────────────────────────
   Every block a student reads (a lesson line, the question being answered, a
   story paragraph, a finished R.A.D. answer) has its own 🔊 on the left that
   reads just that block, word by word. Letter badges are data-noread. */
function blockSpans(el) {
  if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML);
  return Array.from(el.querySelectorAll('.wrd')).filter(sp => /[A-Za-z0-9]/.test(sp.textContent));
}
function spokenOf(spans) {
  return spans.map(s => s.textContent.replace(/[…]/g, '')).join(' ');
}
function speakEl(btn, el) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  if (!el) return;
  const spans = blockSpans(el);
  if (!spans.length) return;
  activeSpeakBtn = btn;
  btn.textContent = '⏹';
  let hlIdx = 0;
  const u = new SpeechSynthesisUtterance(spokenOf(spans));
  u.lang = 'en-US';
  u.rate = 0.9;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    spans.forEach(s => s.classList.remove('hl'));
    if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
    hlIdx++;
  };
  u.onend = () => {
    spans.forEach(s => s.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}
/* Speaker for the block it sits in (onclick="speakBlock(this)") */
function speakBlock(btn) {
  speakEl(btn, btn.parentElement.querySelector('.rp-say'));
}
const SPEAK_HTML = '<button type="button" class="speak-btn rp-speak" onclick="speakBlock(this)" title="Read this aloud" aria-label="Read this aloud">🔊</button>';

/* ── R.A.D. PICTURES ─────────────────────────────────
   An answer in the color check: each part underlined in its color, with its
   letter on the left (shown, not read). `mark` puts a yellow box around one
   part and hides the colors (Color-Check asks which part that is). `open`
   lists parts not picked yet, shown as empty slots (Build). */
function radPartHTML(key, text, opts) {
  const o = opts || {};
  if (o.slot) return `<span class="rm-part rm-slot rm-${key}"><span class="rm-tag" data-noread>${key}</span><span class="rm-slot-name" data-noread>${PARTS[key].name}</span></span>`;
  const cls = o.plain ? 'rm-part rm-plain' : `rm-part rm-${key}`;
  const mark = o.mark ? ' rm-mark' : '';
  const tag = o.plain ? '' : `<span class="rm-tag" data-noread>${key}</span>`;
  return `<span class="${cls}${mark}">${tag}${escapeHtml(text)}</span>`;
}
function radAnswerHTML(r, opts) {
  const o = opts || {};
  const keys = o.keys || ['R', 'A', 'D'];
  const body = keys.map(k => {
    if (r[k]) return radPartHTML(k, r[k], { plain: !!o.mark, mark: o.mark === k });
    return o.slots ? radPartHTML(k, '', { slot: true }) : '';
  }).join(' ');
  const para = r.para ? ` <span class="rm-para">(paragraph ${r.para})</span>` : '';
  return `<span class="rad-model${o.mark ? ' rad-marked' : ''}">${body}${para}</span>`;
}
/* A block with its speaker on the left: kind is the CSS class, label is read with it */
function sayBlockHTML(kind, inner, label) {
  return `<div class="rp-block ${kind}">${SPEAK_HTML}<div class="rp-say">${label ? `<span class="rp-label">${label}</span> ` : ''}${inner}</div></div>`;
}

/* ── READ-ALOUD INTRO SPEAKS ITSELF ─────────────────
   Marcos 10/6: the "Read Aloud is Available!" screen announces itself
   the moment it opens — no reading, no button. The click on "Let's Get
   Started!" is the user gesture the browser needs. The icons are said
   as words, and each word lights up as it is read. Leaving the screen
   (app.show) cancels the speech. */
const INTRO_SAY = { '🔊': 'the speaker button', '⏹': 'the stop button', '—': ',' };
const INTRO_RATE = 0.82;   // Marcos 10/6: 0.92 ran ahead of the highlight
let introToken = 0, introTimer = null;
let introMsPerChar = null, introMsPerWord = null;   // learned from this device's voice
function speakReadAloudIntro() {
  stopActiveSpeech();
  clearTimeout(introTimer);
  const screen = document.getElementById('readaloud-screen');
  const els = Array.from(screen.querySelectorAll('.ra-read'));
  els.forEach(el => { if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML); });
  // One piece per SENTENCE (Marcos 10/6: the end of a long sentence lost its
  // highlight). Each piece = the words to say + the on-screen word each one lights.
  const pieces = [];
  els.forEach(el => {
    let words = [], wordSpan = [];
    const flush = () => { if (words.length) pieces.push({ words, wordSpan }); words = []; wordSpan = []; };
    el.querySelectorAll('.wrd').forEach(sp => {
      const t = sp.textContent.replace(/\uFE0F/g, '').trim();
      const key = t.replace(/[.!?,]+$/, ''), punct = t.slice(key.length);   // "🔊." → icon + "."
      let say = INTRO_SAY[key] != null ? INTRO_SAY[key] + punct : (/[A-Za-z0-9]/.test(t) ? t : '');
      if (!say) return;
      if (say === ',') { if (words.length) words[words.length - 1] += ','; return; }
      if (/^the /.test(say) && /^(every|each)$/i.test(words[words.length - 1] || '')) say = say.slice(4);
      // past-tense "read" ("is read aloud") must sound like "red", not "reed" (Marcos 10/6)
      if (/^read[.!?,]?$/i.test(say) && /^(is|was|are|were|be|been|being)$/i.test(words[words.length - 1] || '')) say = say.replace(/^read/i, 'red');
      say.split(' ').forEach(w => { words.push(w); wordSpan.push(sp); });
      if (/[.!?]$/.test(say)) flush();
    });
    if (words.length && !/[.!?,]$/.test(words[words.length - 1])) words[words.length - 1] += '.';
    flush();
  });
  const factor = (typeof READ_SPEEDS !== 'undefined' && typeof readSpeed !== 'undefined' && READ_SPEEDS[readSpeed]) ? READ_SPEEDS[readSpeed].factor : 1;
  const rate = INTRO_RATE * factor;
  const token = ++introToken;
  const live = () => token === introToken && !screen.classList.contains('hidden');
  const sayPiece = k => {
    if (!live() || k >= pieces.length) return;
    const p = pieces[k];
    const text = p.words.join(' ');
    const starts = []; let pos = 0;
    p.words.forEach(w => { starts.push(pos); pos += w.length + 1; });
    const lit = new Set(p.wordSpan);
    let idx = -1, lastHeard = 0, startedAt = 0, viaVoice = false;
    const mark = j => {
      j = Math.max(0, Math.min(j, p.words.length - 1));
      if (j === idx) return;
      idx = j;
      lit.forEach(sp => sp.classList.remove('hl'));
      p.wordSpan[j].classList.add('hl');
    };
    // Watchdog: when the voice goes quiet about word positions (some voices
    // never report them, Chrome sometimes stops partway), step on at a
    // speaking pace — never past the last word, which stays lit until the end.
    // Pace comes from how long this voice really took on the sentences before
    // (first sentence: a guess), so the highlight keeps up on any voice.
    // (a hair quick on purpose: the last word stays lit until the voice ends, so early is safe, late is not)
    const wordMs = w => introMsPerChar ? 0.92 * (w.length + 1) * introMsPerChar : (120 + w.replace(/[^A-Za-z0-9]/g, '').length * 55) / rate;
    const tick = () => {
      if (!live()) return;
      // while the voice is reporting words it leads; step in only once it has gone quiet
      const base = wordMs(p.words[idx] || ''), quiet = Date.now() - lastHeard;
      const avg = Math.max(base, introMsPerWord || 0);   // a normal pause between reported words is never "quiet"
      if (idx >= 0 && viaVoice && quiet > avg * 1.8) {
        const n = Math.max(1, Math.floor(quiet / avg));   // catch up the words said while it was quiet
        viaVoice = false; mark(idx + n); lastHeard += n * avg;
      } else if (idx >= 0 && !viaVoice && quiet > base) {
        mark(idx + 1); lastHeard = Math.min(Date.now(), lastHeard + base);   // keep exact time between steps
      }
      introTimer = setTimeout(tick, 60);
    };
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    u.onstart = () => { startedAt = lastHeard = Date.now(); mark(0); clearTimeout(introTimer); tick(); };
    u.onboundary = e => {
      if (e.name !== 'word') return;
      let j = 0;
      while (j + 1 < starts.length && starts[j + 1] <= e.charIndex) j++;
      mark(j); lastHeard = Date.now(); viaVoice = true;
    };
    u.onend = () => {
      clearTimeout(introTimer);
      const took = Date.now() - startedAt;
      if (startedAt && live() && took > 300) {   // learn the voice's real speed (skip cancelled/odd pieces)
        const perChar = took / (text.length + 1);
        introMsPerChar = introMsPerChar ? (introMsPerChar + perChar) / 2 : perChar;
        const perWord = took / p.words.length;
        introMsPerWord = introMsPerWord ? (introMsPerWord + perWord) / 2 : perWord;
      }
      lit.forEach(sp => sp.classList.remove('hl'));
      if (live()) introTimer = setTimeout(() => sayPiece(k + 1), 250);
    };
    window.speechSynthesis.speak(u);
  };
  sayPiece(0);
}

/* ── SESSION EVENT LOG ───────────────────────────────
   start · leave · return · resume · close · finish, each with the
   on-task clock. elapsed is time ON TASK: the timer pauses while the
   page is hidden and counts ticks, so a slept device cannot inflate it. */
function logEvent(kind, extra) {
  if (!app.events) app.events = [];
  app.events.push(Object.assign({
    at: new Date().toISOString(),
    e:  kind,
    q:  (app.currentIndex || 0) + 1,
    on: app.timerSeconds || 0
  }, extra || {}));
  if (app.events.length > 200) app.events.splice(0, app.events.length - 200);
}

/* ══════════════════════════════════════════════════════
   APP OBJECT
══════════════════════════════════════════════════════ */
const app = {

  /* ── state ── */
  studentName:    '',
  currentSection: '',
  currentBank:    [],
  currentIndex:   0,
  score:          0,
  streak:         0,
  missedQuestions:[],
  responses:      {},
  currentAttemptNum: 1,
  selectedIndices:new Set(),
  questionLocked: false,
  timerSeconds:   0,
  timerInterval:  null,
  timerOn:        false,
  instructInterval: null,
  readInterval:   null,
  nextInterval:   null,

  /* ── screens ── */
  show(id) {
    ['start-screen','readaloud-screen','directions-screen','quiz-screen','end-screen','scoreboard-screen']
      .forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    // Leaving the quiz screen always drops the two-sided Comprehension layout
    if (id !== 'quiz-screen') this._applyCompLayout(false);
    window.scrollTo(0, 0);   // every new screen starts at the top
    window.speechSynthesis.cancel();
  },

  /* ── TWO-SIDED COMPREHENSION LAYOUT ── */
  _applyCompLayout(isComp) {
    const qs = document.getElementById('quiz-screen');
    if (qs) qs.classList.toggle('comp-mode', isComp);
    document.body.classList.toggle('comp-active', isComp);
  },

  /* ── INIT ── */
  init() {
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── READ ALOUD INTRO ── */
  showReadAloudIntro() {
    if (!REVIEW_OPEN && !SHARE_MODE) return;
    document.getElementById('welcome-panel').classList.add('hidden');
    this.show('readaloud-screen');
    setTimeout(speakReadAloudIntro, 150);   // announces itself (show() just cancelled any speech)
    const btn   = document.getElementById('readaloud-btn');
    const fill  = document.getElementById('readaloud-fill');
    const count = document.getElementById('readaloud-count');
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    count.textContent = 6;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = 'width 6s linear';
      fill.style.width = '0%';
    }));
    let remaining = 6;
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        btn.disabled = false; btn.style.opacity = '1';
        btn.style.cursor = 'pointer'; btn.textContent = "✅ Got It — Show Me the Directions!";
      }
    }, 1000);
  },

  /* ── DIRECTIONS ── */
  showDirections() {
    this.show('directions-screen');
    this.startInstructionsTimer();
  },

  showLogin() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    window.speechSynthesis.cancel();
    document.querySelectorAll('.dir-text .wrd.hl').forEach(e => e.classList.remove('hl'));
    this.studentName = '';
    loggedInName = '';
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    if (SHARE_MODE) this._shareSignIn();
  },

  /* Shared preview: no roster, no student number — straight to the parts. */
  _shareSignIn() {
    loggedInName     = 'Guest';
    this.studentName = 'Guest';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.add('hidden');
    const select = document.getElementById('section-select');
    select.classList.remove('hidden');
    // student-only pieces: the attempt rules and the score history
    select.querySelectorAll('div').forEach(el => {
      if (!el.querySelector('div, button') && /Rules:/.test(el.textContent)) el.style.display = 'none';
    });
    select.querySelectorAll('.score-btn').forEach(el => { el.style.display = 'none'; });
    applyLocks(this.studentName);
    this.checkResume();
  },

  /* ── NAME SELECT ── */
  onNameSelect() {
    const val = document.getElementById('name-select').value;
    const pinSec = document.getElementById('pin-section');
    const guestSec = document.getElementById('guest-name-section');
    document.getElementById('login-error').textContent = '';
    if (!val) { pinSec.classList.add('hidden'); return; }
    pinSec.classList.remove('hidden');
    if (val.startsWith('GUEST:')) {
      guestSec.classList.remove('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter guest code:';
    } else {
      guestSec.classList.add('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter your student number:';
    }
    setTimeout(() => document.getElementById('student-pin').focus(), 80);
  },

  /* ── LOGIN ── */
  attemptLogin() {
    const selVal = document.getElementById('name-select').value;
    const pin    = document.getElementById('student-pin').value.trim();
    const errEl  = document.getElementById('login-error');
    errEl.textContent = '';

    if (!selVal) { errEl.textContent = '⚠️ Please select your name.'; return; }
    if (!pin)    { errEl.textContent = '⚠️ Please enter your student number.'; return; }

    let matched = false;
    let displayName = '';

    if (selVal.startsWith('GUEST:')) {
      const code = selVal.replace('GUEST:', '');
      if (pin === code) {
        const firstName = (document.getElementById('guest-display-name').value || '').trim();
        if (!firstName) { errEl.textContent = '⚠️ Please enter your first name.'; return; }
        matched = true;
        displayName = firstName + ' (Guest)';
      } else {
        errEl.textContent = '❌ Incorrect guest code. Try again.'; return;
      }
    } else {
      const student = ROSTER.find(s => s.name === selVal);
      if (student && student.id === pin) {
        matched = true;
        displayName = selVal;
      } else {
        errEl.textContent = '❌ Incorrect student number. Try again.'; return;
      }
    }

    if (matched) {
      loggedInName       = displayName;
      this.studentName   = displayName;
      document.getElementById('student-pin').value = '';
      document.getElementById('login-error').textContent = '';
      const loginCard = document.getElementById('login-step-card');
      if (loginCard) loginCard.classList.add('hidden');
      document.getElementById('section-select').classList.remove('hidden');
      applyLocks(displayName);
      this.checkResume();
      const rmBtn = document.getElementById('review-mode-btn');
      if (rmBtn) rmBtn.classList.toggle('hidden', displayName !== 'Mr. O (Teacher)');
    }
  },

  /* ── ATTEMPT START ── */
  attemptStart(section) {
    if (!this.studentName) return;
    // The gates (see PASS_PCT): no try limit, but an activity waits for 70% on the one before it.
    // The Teacher PIN lets this one student past.
    const why = gateWait(this.studentName, section);
    if (why) {
      this.showPinModal(
        '🔒 Not Yet',
        `${getFirstName(this.studentName)}: ${why.charAt(0).toLowerCase() + why.slice(1)}. ` +
        `Teachers: enter your PIN to let this student start ${ACTIVITIES[section].short} now.`,
        () => this.startSession(section)
      );
      return;
    }
    this.startSession(section);
  },

  /* ── TEACHER REVIEW MODE ── */
  promptTeacherReview() {
    const pin = prompt('Enter Teacher PIN to access Review Mode:');
    if (pin !== '9377') { if (pin !== null) alert('Incorrect PIN.'); return; }
    this.studentName = 'Mr. O (Teacher)';
    reviewMode = true;
    localStorage.removeItem(STORAGE_KEY);
    this._showReviewPicker();
  },

  _showReviewPicker() {
    const keys = Object.keys(ACTIVITIES);
    const section = prompt('Choose an activity to review:\n' +
      keys.map((k, i) => `${i + 1} — ${ACTIVITIES[k].label}`).join('\n') + `\n\nEnter 1 to ${keys.length}:`);
    const map = Object.fromEntries(keys.map((k, i) => [String(i + 1), k]));
    if (!map[section]) { alert('Invalid choice.'); reviewMode = false; return; }
    const mode = prompt('Choose review mode:\n1 — Manual (you tap Next each question)\n2 — Auto-run (fully automatic)\n\nEnter 1 or 2:');
    if (mode !== '1' && mode !== '2') { alert('Invalid choice.'); reviewMode = false; return; }
    reviewAutoRun = (mode === '2');
    const count = versionCount(map[section]);
    const ver = count > 1 ? prompt(`Which version? Each try gets the next one.\nEnter 1 to ${count}:`, '1') : '1';
    const n = Number(ver);
    if (!(n >= 1 && n <= count)) { alert('Invalid choice.'); reviewMode = false; return; }
    this._reviewVersion = n;
    this.startSession(map[section]);
  },

  exitReviewMode() {
    reviewMode    = false;
    reviewAutoRun = false;
    this._reviewVersion = null;
    this.stopTimerEngine();
    const banner = document.getElementById('review-mode-banner');
    if (banner) banner.classList.add('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  _autoAnswer() {
    const q = this.currentBank[this.currentIndex];
    const isMulti = Array.isArray(q.answer);
    const answers = isMulti ? q.answer : [q.answer];
    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      if (answers.includes(i)) {
        this.selectedIndices.add(i);
        btn.classList.add('selected');
      }
    });
    setTimeout(() => this.confirmAnswer(), 600);
  },

  /* ── START SESSION ── */
  startSession(section) {
    this.events = []; this.startedAt = new Date().toISOString();
    this.finishedAt = '';
    tabSwitchCount = 0;
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.add('hidden');
    const banner = document.getElementById('review-mode-banner');
    if (banner) {
      banner.classList.toggle('hidden', !reviewMode);
      const label = banner.querySelector('span');
      if (label) label.textContent = reviewAutoRun
        ? '🔍 Teacher Review Mode — auto-run'
        : '🔍 Teacher Review Mode — tap Next to advance';
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AWOC_SESSION_ID_KEY);
    this.currentSection = section;
    this.score          = 0;
    this.streak         = 0;
    this.missedQuestions= [];
    this.responses      = {};
    this.currentIndex   = 0;
    this.questionLocked = false;   // a finished section leaves it set
    this.timerSeconds   = 0;
    this.currentAttemptNum = reviewMode ? 1 : getSectionAttempts(this.studentName)[section] + 1;
    this.sessionBase = SESSION_ID;
    // Try 1 → version 1, try 2 → version 2 … (the teacher's look picks one)
    this.version = reviewMode && this._reviewVersion ? this._reviewVersion
      : versionForTry(section, this.currentAttemptNum - 1);

    const rawBank = [...sectionBank(section, this.version)];

    // Each choice keeps its own note when the choices are shuffled. Fixed sets
    // (R / A / D, "what is missing") keep their order.
    const shuffleQ = q => {
      const indexed = q.choices.map((text, i) => ({ text, note: (q.notes || [])[i] || '', origIdx: i }));
      if (!q.fixed) shuffle(indexed);
      return Object.assign({}, q, {
        choices: indexed.map(c => c.text), notes: indexed.map(c => c.note),
        answer: indexed.findIndex(c => c.origIdx === q.answer)
      });
    };

    // The questions keep their order: they follow the lesson, and a Build
    // question is answered one part at a time.
    this.currentBank = rawBank.map(shuffleQ);
    this.cardsSeen = [];

    this._enterQuiz();
    logEvent('start', { v: this.version });
    this.startTimer();
    this.renderQuestion();
  },

  // Quiz screen in the right layout: Look Back in the Story = story left, question right
  _enterQuiz() {
    const act = ACTIVITIES[this.currentSection];
    const isComp = !!(act && act.data.usesStory);
    this.show('quiz-screen');
    this._applyCompLayout(isComp);
  },

  /* ── RESUME ── */
  checkResume() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const rc = document.getElementById('resume-container');
    const sectionSelect = document.getElementById('section-select');
    if (saved && rc) {
      const data = JSON.parse(saved);
      if (this.studentName && data.studentName === this.studentName) {
        rc.classList.remove('hidden');
        const qNum = Math.min(data.currentIndex + 1, data.currentBank.length);
        document.getElementById('resume-detail').textContent =
          `${SECTION_LABELS[data.currentSection]} — Q${qNum} of ${data.currentBank.length}`;
        if (sectionSelect) sectionSelect.classList.add('hidden');
      } else {
        rc.classList.add('hidden');
        if (sectionSelect && this.studentName) sectionSelect.classList.remove('hidden');
      }
    } else if (rc) {
      rc.classList.add('hidden');
      if (sectionSelect && this.studentName) sectionSelect.classList.remove('hidden');
    }
  },

  resumeSession() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    this.studentName    = saved.studentName;
    this.currentSection = saved.currentSection;
    this.currentBank    = saved.currentBank;
    this.currentIndex   = saved.currentIndex;
    this.score          = saved.score;
    this.streak         = saved.streak || 0;
    this.missedQuestions= saved.missedQuestions || [];
    this.responses      = saved.responses || {};
    this.timerSeconds   = saved.timerSeconds || 0;
    this.currentAttemptNum = saved.currentAttemptNum || 1;
    this.sessionBase    = saved.sessionBase || SESSION_ID;
    this.questionLocked = false;
    tabSwitchCount      = saved.tabSwitches || 0;
    this.cardsSeen = saved.cardsSeen || [];
    this.version = saved.version || 1;           // the saved questions are already that version's
    this.events = saved.events || [];
    this.startedAt = saved.startedAt || new Date().toISOString();
    this.finishedAt = '';
    logEvent('resume');
    this._enterQuiz();
    this.startTimer();
    // Saved right after answering the last question → nothing left to ask
    if (this.currentIndex >= this.currentBank.length) { this._finishSession(); return; }
    this.renderQuestion();
  },

  saveProgress() {
    if (reviewMode) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      studentName:     this.studentName,
      currentSection:  this.currentSection,
      currentBank:     this.currentBank,
      currentIndex:    this.questionLocked ? this.currentIndex + 1 : this.currentIndex, // answered → resume at the next one
      score:           this.score,
      streak:          this.streak,
      missedQuestions: this.missedQuestions,
      responses:       this.responses,
      timerSeconds:    this.timerSeconds,
      currentAttemptNum: this.currentAttemptNum,
      sessionBase:     this.sessionBase,
      tabSwitches:     tabSwitchCount,
      cardsSeen: this.cardsSeen || [],
      version: this.version || 1,
      events: this.events,
      startedAt: this.startedAt
    }));
  },

  discardProgress() {
    this.showPinModal(
      '🗑️ Discard Progress',
      'Enter Teacher PIN to clear the current in-progress session. The student will start fresh.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('resume-container').classList.add('hidden');
        applyLocks(this.studentName);
        this.checkResume();
      }
    );
  },

  /* ── OVERALL TIMER ── */
  startTimer() {
    this.stopTimerEngine();
    this.timerOn = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._tickTimer();
      if (this.timerSeconds % 30 === 0) this.saveProgress();
    }, 1000);
  },

  stopTimerEngine() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerOn = false;
  },

  _tickTimer() {
    const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const s = String(this.timerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  /* ── INSTRUCTIONS LOCK (20s) ── */
  startInstructionsTimer() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    const btn   = document.getElementById('ready-btn');
    const fill  = document.getElementById('instruct-fill');
    const count = document.getElementById('instruct-count');
    if (!btn) return;
    if (reviewMode) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.textContent = "✅ I'm Ready — Let's Begin!"; return; }
    btn.disabled = true;
    btn.style.opacity = '0.45';
    btn.style.cursor  = 'not-allowed';
    if (count) count.textContent = INSTRUCT_SECS;
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${INSTRUCT_SECS}s linear`;
        fill.style.width = '0%';
      }));
    }
    let remaining = INSTRUCT_SECS;
    this.instructInterval = setInterval(() => {
      remaining--;
      if (count) count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.instructInterval);
        this.instructInterval = null;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor  = 'pointer';
        btn.textContent   = "✅ I'm Ready — Let's Begin!";
      }
    }, 1000);
  },

  /* ── READING LOCK (12s) ── */
  startReadTimer() {
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const bar   = document.getElementById('reading-timer-bar');
    const fill  = document.getElementById('reading-fill');
    const count = document.getElementById('reading-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
      setTimeout(() => this._autoAnswer(), 300);
      return;
    }

    bar.classList.remove('hidden');
    count.textContent = READ_SECS;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${READ_SECS}s linear`;
      fill.style.width = '0%';
    }));

    document.querySelectorAll('.answer-btn').forEach(b => {
      b.classList.add('locked-choice');
      b.disabled = true;
    });

    let remaining = READ_SECS;
    this.readInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.readInterval);
        this.readInterval = null;
        bar.classList.add('hidden');
        document.querySelectorAll('.answer-btn').forEach(b => {
          b.classList.remove('locked-choice');
          b.disabled = false;
        });
        document.getElementById('confirm-btn').classList.remove('hidden');
      }
    }, 1000);
  },

  /* ── NEXT SOAK (6s) ── */
  startNextTimer(onDone) {
    if (this.nextInterval) { clearInterval(this.nextInterval); this.nextInterval = null; }
    const bar   = document.getElementById('next-timer-bar');
    const fill  = document.getElementById('next-fill');
    const count = document.getElementById('next-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      if (reviewAutoRun) {
        setTimeout(() => this.nextQuestion(), 800);
      } else {
        document.getElementById('next-btn').classList.remove('hidden');
      }
      return;
    }

    this.soakDone = false;
    bar.classList.remove('hidden');
    count.textContent = NEXT_SECS;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${NEXT_SECS}s linear`;
      fill.style.width = '0%';
    }));

    let remaining = NEXT_SECS;
    this.nextInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.nextInterval);
        this.nextInterval = null;
        bar.classList.add('hidden');
        this.soakDone = true;
        this._maybeShowNext();   // after a miss, Next also waits for the Listen
        if (onDone) onDone();
      }
    }, 1000);
  },

  /* ── LESSON CARDS ──
     Every activity opens with its lesson cards (data/rad.js `cards`), one card
     at a time. The card reads itself line by line, each word lighting up, and
     every line also has its own 🔊. Next opens when the voice reaches the end of
     the card — or, on a device with no voice, after a wait long enough to read
     the card. Cards are not scored. cardsSeen remembers the cards were shown,
     so a resume goes straight back to the questions. */
  _needsCards() {
    const act = ACTIVITIES[this.currentSection];
    return !!act && this.currentIndex === 0 && (act.data.cards || []).length > 0 &&
           !(this.cardsSeen || []).includes(0);
  },

  _showCards() {
    this._cards  = ACTIVITIES[this.currentSection].data.cards;
    this._cardAt = 0;
    this.questionLocked = false;   // a save during the cards must not skip the first question
    document.getElementById('quiz-screen').classList.add('card-mode');
    this._applyCompLayout(false);
    this._renderCard();
  },

  _cardBlockHTML(b) {
    const ex = (cls, icon, text, why) => sayBlockHTML(`rp-ex ${cls}`,
      `<span class="rp-ex-icon" aria-hidden="true">${icon}</span><span class="rp-ex-text">“${escapeHtml(text)}”</span><span class="rp-ex-why">${escapeHtml(why)}</span>`);
    if (b.p)      return sayBlockHTML('rp-p', escapeHtml(b.p));
    if (b.ask)    return sayBlockHTML('rp-ask', escapeHtml(b.ask), 'Question:');
    if (b.steps)  return (window.RAD_STEPS || []).map(s => sayBlockHTML(`rp-step rp-step-${s.key}`,
                    `<span class="rp-letter" data-noread>${s.key}</span><strong>${s.name}.</strong> ${escapeHtml(s.tip)}`)).join('');
    if (b.rows)   return b.rows.map(r => {
                    const part = PARTS[r[0]];   // a part letter is shown, not read; a word like "you" is read
                    return sayBlockHTML(`rp-step${part ? ' rp-step-' + r[0] : ''}`,
                      `<span class="rp-letter"${part || !/[A-Za-z0-9]/.test(r[0]) ? ' data-noread' : ''}>${escapeHtml(r[0])}</span>${escapeHtml(r[1])}`);
                  }).join('');
    if (b.clues)  return `<div class="rp-clues">${(window.RAD_CLUES || []).map(c =>
                    sayBlockHTML('rp-clue', `<strong class="rp-clue-word">${c.word}</strong> wants <strong>${c.wants}</strong>.`)).join('')}</div>`;
    if (b.rad)    return sayBlockHTML('rp-model', radAnswerHTML(b.rad), 'R.A.D. answer:');
    if (b.shown)  return sayBlockHTML('rp-model', radAnswerHTML(b.shown, { mark: b.shown.mark }), 'Answer:');
    if (b.given)  return sayBlockHTML('rp-model', radAnswerHTML(b.given, { keys: ['R', 'A'] }), 'Answer:');
    if (b.good)   return ex('rp-good', '✔', b.good, b.why);
    if (b.bad)    return ex('rp-bad', '✘', b.bad, b.why);
    return '';
  },

  _renderCard() {
    stopActiveSpeech();
    clearTimeout(this._cardUnlock);
    clearTimeout(this._cardSpeak);
    clearTimeout(this._cardPause);
    const c   = this._cards[this._cardAt];
    const box = document.getElementById('learn-card');
    const last = this._cardAt + 1 >= this._cards.length;
    document.getElementById('progress-text').textContent = `Lesson card ${this._cardAt + 1} of ${this._cards.length}`;
    document.getElementById('score-text').textContent    = `${getFirstName(this.studentName)} · ${this.score}`;
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('streak-bar').textContent    = '';
    box.innerHTML = `
      <div class="lc-top">
        <button class="speak-btn" id="lc-speak" onclick="app.speakCard()" title="Hear this whole card" aria-label="Hear this whole card">🔊</button>
        <span class="lc-kicker">📘 Listen to the lesson</span>
      </div>
      <h2 class="lc-title rp-say">${escapeHtml(c.title)}</h2>
      <div class="lc-blocks">${c.blocks.map(b => this._cardBlockHTML(b)).join('')}</div>
      <p class="lc-note" id="lc-note" aria-live="polite">Listen to the end of the card. Then the Next button opens.</p>
      <div class="lc-btns">
        ${this._cardAt > 0 ? '<button class="action-btn lc-back" onclick="app.prevCard()">⬅️ Back</button>' : ''}
        <button id="lc-next" class="action-btn" onclick="app.nextCard()" disabled>⏳ Listen first…</button>
      </div>`;
    box.classList.remove('hidden');
    window.scrollTo(0, 0);
    this._cardLast = last;
    this.saveProgress();
    if (reviewMode) { this._openCardNext(); if (reviewAutoRun) setTimeout(() => this.nextCard(), 500); return; }
    // The button opens when the voice finishes the card. A device that never says
    // so (or has no voice) gets it after a wait long enough to read the card.
    const words = Array.from(box.querySelectorAll('.rp-say')).reduce((n, el) => n + el.textContent.split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length, 0);
    this._cardUnlock = setTimeout(() => this._openCardNext(), Math.min(40000, Math.max(10000, words * 450)));
    this._cardSpeak = setTimeout(() => this.speakCard(), 250);
  },

  _openCardNext() {
    clearTimeout(this._cardUnlock);
    const btn = document.getElementById('lc-next');
    if (!btn || !btn.disabled) return;
    btn.disabled = false;
    btn.textContent = this._cardLast ? 'Start practicing ➡️' : 'Next card ➡️';
    const note = document.getElementById('lc-note');
    if (note) note.textContent = '✅ You can go on.';
  },

  /* Reads the whole card, one block at a time, lighting each word */
  speakCard() {
    const btn = document.getElementById('lc-speak');
    const box = document.getElementById('learn-card');
    if (!btn || !box) return;
    if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    const lines = Array.from(box.querySelectorAll('.rp-say')).map(blockSpans).filter(s => s.length);
    if (!lines.length) { this._openCardNext(); return; }
    activeSpeakBtn = btn; btn.textContent = '⏹';
    const sayLine = k => {
      if (activeSpeakBtn !== btn) return;
      if (k >= lines.length) { btn.textContent = '🔊'; activeSpeakBtn = null; this._openCardNext(); return; }
      const spans = lines[k];
      let text = spokenOf(spans);
      if (!/[.!?:,]["”’]?$/.test(text)) text += '.';
      let hlIdx = 0;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.82;
      u.onboundary = e => {
        if (e.name !== 'word') return;
        box.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
        if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
        hlIdx++;
      };
      u.onend = () => {
        box.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
        this._cardPause = setTimeout(() => sayLine(k + 1), 250);
      };
      addHighlightFallback(u, spans);
      window.speechSynthesis.speak(u);
    };
    sayLine(0);
  },

  nextCard() {
    stopActiveSpeech();
    clearTimeout(this._cardUnlock);
    clearTimeout(this._cardPause);
    clearTimeout(this._cardSpeak);
    this._cardAt++;
    if (this._cardAt < this._cards.length) { this._renderCard(); return; }
    this.cardsSeen.push(0);
    this._leaveCards();
    this.saveProgress();
    this.renderQuestion();
  },

  prevCard() {
    if (this._cardAt <= 0) return;
    this._cardAt -= 1;
    this._renderCard();
  },

  _leaveCards() {
    clearTimeout(this._cardUnlock);
    clearTimeout(this._cardPause);
    clearTimeout(this._cardSpeak);
    document.getElementById('quiz-screen').classList.remove('card-mode');
    const box = document.getElementById('learn-card');
    if (box) { box.classList.add('hidden'); box.innerHTML = ''; }
  },

  /* ── RENDER QUESTION ── */
  renderQuestion() {
    if (this._needsCards()) { this._showCards(); return; }
    this._leaveCards();
    const act    = ACTIVITIES[this.currentSection];
    this._applyCompLayout(!!act.data.usesStory);
    const q      = this.currentBank[this.currentIndex];
    const total  = this.currentBank.length;

    document.getElementById('progress-text').textContent =
      q.stepCount ? `Question ${q.group + 1} of ${q.groupCount} · Part ${q.step + 1} of ${q.stepCount}`
                  : `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('score-text').textContent =
      `${getFirstName(this.studentName)} · ${this.score}`;
    document.getElementById('progress-fill').style.width =
      `${(this.currentIndex / total) * 100}%`;

    this._renderStreak();

    document.getElementById('question-text').innerHTML = wrapWords(escapeHtml(q.q));
    this._renderShow(q);
    this._renderStory(q);
    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box';
    fb.style.display = 'none';
    fb.textContent = '';

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('next-timer-bar').classList.add('hidden');

    this.selectedIndices = new Set();
    this.questionLocked  = false;
    this.mustHear = false;
    this.soakDone = false;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';
    wrap.classList.toggle('rp-part-choices', q.choices === PART_CHOICES || q.choices.every(c => PART_RE.test(c)));

    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';

      const part = text.match(PART_RE);
      const btn = document.createElement('button');
      btn.className = 'answer-btn' + (part ? ` rp-part-btn rp-part-${part[1]}` : '');
      btn.innerHTML = part
        ? `<span class="rp-letter" data-noread>${part[1]}</span><span class="choice-text">${part[2]}</span>`
        : `<strong>${['A','B','C','D','E'][i]}.</strong>&nbsp;<span class="choice-text">${choiceHtml(escapeHtml(text))}</span>`;
      btn.onclick = () => this._selectChoice(i, btn, false);

      const speakBtn = document.createElement('button');
      speakBtn.className = 'choice-speak-btn';
      speakBtn.textContent = '🔊';
      speakBtn.title = 'Read this choice aloud';
      speakBtn.setAttribute('aria-label', 'Read this choice aloud');
      speakBtn.onclick = (e) => {
        e.stopPropagation();
        speakEl(speakBtn, btn.querySelector('.choice-text'));
      };

      row.appendChild(speakBtn);
      row.appendChild(btn);
      wrap.appendChild(row);
    });

    if (this.currentIndex > 0 && this.currentIndex % 5 === 0) {
      submitScorePartial();
    }

    this.saveProgress();

    document.getElementById('answers').classList.remove('hidden');
    this.startReadTimer();
  },

  /* What the student looks at before picking: a short story, the question being
     answered, an answer to check, or the R.A.D. answer being built. Every block
     has its own speaker. */
  _renderShow(q) {
    const el = document.getElementById('q-show');
    if (!el) return;
    const blocks = [];
    if (q.story) blocks.push(sayBlockHTML('rp-story', escapeHtml(q.story), 'Story:'));
    if (q.ask)   blocks.push(sayBlockHTML('rp-ask', escapeHtml(q.ask), 'Question:'));
    if (q.shown && typeof q.shown === 'string') blocks.push(sayBlockHTML('rp-shown', `“${escapeHtml(q.shown)}”`, 'Answer:'));
    else if (q.shown) blocks.push(sayBlockHTML('rp-model', radAnswerHTML(q.shown, { mark: q.shown.mark }), 'Answer:'));
    if (q.given) blocks.push(sayBlockHTML('rp-model', radAnswerHTML(q.given, { keys: ['R', 'A'] }), 'Answer:'));
    if (q.built) blocks.push(`<div id="rp-built-wrap">${this._builtHTML(q, q.built, false)}</div>`);
    el.innerHTML = blocks.join('');
  },

  /* The R.A.D. answer being built: the parts picked so far in color, empty slots for the rest */
  _builtHTML(q, built, done) {
    const r = Object.assign({}, built, done ? { para: q.para } : {});
    const label = done ? '📝 The R.A.D. answer you built:' : '📝 Your R.A.D. answer so far:';
    return sayBlockHTML(`rp-model rp-built${done ? ' rp-built-done' : ''}`, radAnswerHTML(r, { keys: q.parts, slots: !done }), label);
  },

  /* Look Back in the Story: the story stays on the left, paragraphs numbered.
     After the "which paragraph" step, that paragraph gets the orange ring. */
  _renderStory(q) {
    const panel = document.getElementById('story-panel');
    if (!panel) return;
    const act = ACTIVITIES[this.currentSection];
    const st = act.data.usesStory ? versionData(this.currentSection, this.version || 1).story : null;
    if (!st) { panel.innerHTML = ''; return; }
    panel.innerHTML = `
      <div class="story-panel-header">📖 ${escapeHtml(st.title)}</div>
      <div class="story-scroll" id="story-scroll">
        ${st.paragraphs.map((p, i) => `
          <div class="sp-para${q.focusPara === i + 1 ? ' sp-focus' : ''}" data-para="${i + 1}">
            <span class="sp-num" aria-label="Paragraph ${i + 1}">${i + 1}</span>
            ${SPEAK_HTML}
            <div class="rp-say">${escapeHtml(p)}</div>
          </div>`).join('')}
      </div>`;
    const focus = panel.querySelector('.sp-focus');
    const scroll = panel.querySelector('#story-scroll');
    if (focus && scroll) scroll.scrollTop = Math.max(0, focus.offsetTop - 8);
  },

  _selectChoice(i, btn, isMulti) {
    if (this.questionLocked) return;
    if (isMulti) {
      if (this.selectedIndices.has(i)) {
        this.selectedIndices.delete(i);
        btn.classList.remove('selected');
      } else {
        this.selectedIndices.add(i);
        btn.classList.add('selected');
      }
    } else {
      document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
      this.selectedIndices = new Set([i]);
      btn.classList.add('selected');
    }
  },

  _renderStreak() {
    const el = document.getElementById('streak-bar');
    if (this.streak >= 3) {
      el.textContent = '🔥'.repeat(Math.min(this.streak, 8)) + ` ${this.streak} in a row!`;
    } else {
      el.textContent = '';
    }
  },

  /* Next appears when the 6 second pause is over and — after a miss — the feedback has been heard */
  _maybeShowNext() {
    if (!this.soakDone || this.mustHear) return;
    const next = document.getElementById('next-btn');
    next.classList.remove('hidden');
    next.scrollIntoView({ block: 'nearest' });
    try { next.focus({ preventScroll: true }); } catch (e) {}
  },

  /* LISTEN, THEN NEXT — the big Listen button under the feedback after a miss (see LISTEN_START_WAIT) */
  _armListen(fb, smallBtn, spans, text, qid, onHeard) {
    smallBtn.style.display = 'none';              // one thing to press
    const row = document.createElement('div');
    row.className = 'listen-row';
    row.innerHTML = `<button type="button" class="listen-btn" id="listen-btn">🔊 Listen</button>` +
      `<span class="listen-note" id="listen-note" aria-live="polite">Listen to the end. Then you can go on.</span>`;
    fb.after(row);                                // right under the words it reads
    const btn = row.querySelector('#listen-btn'), note = row.querySelector('#listen-note');
    const words = text.split(/\s+/).filter(Boolean).length;
    const clearHl = () => spans.forEach(el => el.classList.remove('hl'));
    const idle = () => { btn.classList.remove('playing'); btn.textContent = this.mustHear ? '🔊 Listen' : '🔊 Listen again'; };

    const heard = how => {
      if (!this.mustHear || !btn.isConnected) return;
      this.mustHear = false;
      logEvent('heard', { id: qid, how });      // how: 'voice' or 'read' (no sound on the device)
      if (onHeard) onHeard();
      btn.disabled = false; btn.classList.add('heard'); btn.onclick = play; idle();
      note.textContent = '✅ Done. You can go on.';
      this.saveProgress();
      this._maybeShowNext();
    };

    // This device will not speak: wait long enough to read it, then an "I read it" button
    const noVoice = () => {
      clearHl();
      if (!this.mustHear) { idle(); return; }
      btn.classList.remove('playing'); btn.disabled = true; btn.textContent = '⏳ Read it first…';
      note.textContent = 'No sound here. Read it. Then tap the button.';
      setTimeout(() => {
        if (!this.mustHear || !btn.isConnected) return;
        btn.disabled = false; btn.textContent = '✅ I read it';
        btn.onclick = () => heard('read');
      }, listenDwellMs(words));
    };

    const play = () => {
      if (listenJob && !listenJob.settled && listenJob.btn === btn) return;   // a second tap must not cut the voice off
      stopActiveSpeech();
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { noVoice(); return; }
      const job = listenJob = { btn, settled: false, started: false, startTimer: null, watchdog: null };
      const settle = () => { job.settled = true; clearTimeout(job.startTimer); clearTimeout(job.watchdog); clearHl(); };
      const finish = ok => {
        if (job.settled) return;
        settle();
        if (!btn.isConnected) return;
        if (ok && this.mustHear) { heard('voice'); return; }
        idle();
        if (!ok && this.mustHear) note.textContent = 'It stopped early. Tap Listen. Hear it to the end.';
      };
      job.abort = () => finish(false);
      btn.classList.add('playing'); btn.textContent = '🔊 Listening…';
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.9;
      let hlIdx = 0;
      u.onstart = () => {
        job.started = true;
        // Some voices never report that they finished. Generous on purpose (about 80 words a minute),
        // so it can only fire after a real voice would be done.
        job.watchdog = setTimeout(() => finish(true), words * 750 + 6000);
      };
      u.onboundary = e => {
        if (e.name !== 'word') return;
        clearHl();
        if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
        hlIdx++;
      };
      u.onend = () => finish(true);
      u.onerror = () => { if (job.settled) return; settle(); noVoice(); };
      addHighlightFallback(u, spans);
      job.startTimer = setTimeout(() => {
        if (job.started || job.settled) return;      // no sound started: this device cannot speak
        settle(); window.speechSynthesis.cancel(); noVoice();
      }, LISTEN_START_WAIT);
      window.speechSynthesis.speak(u);
    };
    btn.onclick = play;
  },

  /* ── CONFIRM ANSWER ──
     Every answer teaches: the right answer, why (and, after a miss, why the
     picked choice did not work), then a finished R.A.D. answer in color. In
     Build and Look Back the answer on screen grows by the part just picked. */
  confirmAnswer() {
    if (this.selectedIndices.size === 0) return;
    this.questionLocked = true;

    const q       = this.currentBank[this.currentIndex];
    const pickIdx = [...this.selectedIndices][0];
    const correct = pickIdx === q.answer;
    const picked    = q.choices[pickIdx];
    const rightText = q.choices[q.answer];
    this.responses[q.id] = { stem: q.q, pick: picked, answer: rightText, correct };

    if (correct) {
      this.score++;
      this.streak++;
    } else {
      this.streak = 0;
      this.missedQuestions.push({ id: q.id, q: missText(q), skill: q.skill, yourAnswer: picked, correct: rightText });
    }

    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer)                   btn.classList.add('correct');
      else if (this.selectedIndices.has(i)) btn.classList.add('incorrect');
    });

    const note = correct ? '' : (q.notes && q.notes[pickIdx]) || '';
    const fbText = correct
      ? `✅ <strong>Correct!</strong> ${escapeHtml(q.why || '')}`
      : `❌ <strong>Not quite.</strong> ${note ? escapeHtml(note) + ' ' : ''}The best answer is: <strong>${escapeHtml(choiceSaid(rightText).replace(/[.!?…]+$/, ''))}</strong>. ${escapeHtml(q.why || '')}`;
    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box ' + (correct ? 'correct' : 'incorrect');
    fb.style.display = 'block';
    fb.innerHTML = `<div class="rp-block rp-fb">${SPEAK_HTML}<div class="rp-say fb-text">${fbText}</div></div>`;

    // The finished R.A.D. answer, in color
    if (q.built) {
      const built = Object.assign({}, q.built);
      if (q.part !== 'P') built[q.part] = q.model[q.part];
      const wrap = document.getElementById('rp-built-wrap');
      if (wrap) {
        wrap.innerHTML = this._builtHTML(q, built, q.last);
        const grown = wrap.querySelector(`.rm-${q.part}`);
        if (grown) grown.classList.add('rm-grow');
      }
      if (q.last) logEvent('built', { id: q.id });
    } else if (q.model) {
      const label = q.shown && q.shown.mark ? '🖍️ The color check:' : '📝 Here is a R.A.D. answer:';
      fb.insertAdjacentHTML('beforeend', `<div class="rp-after">${sayBlockHTML('rp-model', radAnswerHTML(q.model), label)}</div>`);
    }
    // Color-Check: the answer above gets its colors back
    if (q.shown && q.shown.mark) {
      const show = document.getElementById('q-show');
      const marked = show && show.querySelector('.rad-marked');
      if (marked) marked.outerHTML = radAnswerHTML({ R: q.shown.R, A: q.shown.A, D: q.shown.D });
    }

    // After a miss the student must HEAR why before Next shows
    const fbSpeak = fb.querySelector('.rp-fb .rp-speak');
    const fbSpans = blockSpans(fb.querySelector('.fb-text'));
    this.mustHear = !correct && !reviewMode;
    if (this.mustHear) this._armListen(fb.querySelector('.rp-fb'), fbSpeak, fbSpans, spokenOf(fbSpans), q.id);

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('score-text').textContent = `${getFirstName(this.studentName)} · ${this.score}`;
    this._renderStreak();
    this.saveProgress();
    this.startNextTimer(null);
  },

  /* ── NEXT QUESTION ── */
  nextQuestion() {
    stopActiveSpeech();
    this.currentIndex++;
    if (this.currentIndex >= this.currentBank.length) {
      this._finishSession();
    } else {
      this.renderQuestion();
    }
  },

  /* ── FINISH SESSION ── */
  _finishSession() {
    this.finishedAt = new Date().toISOString(); logEvent('finish');
    this.stopTimerEngine();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AWOC_SESSION_ID_KEY);

    const total = this.currentBank.length;
    const pct   = Math.round((this.score / total) * 100);
    const date  = new Date();

    const scores   = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const attemptNum = this.currentAttemptNum || 1;
    if (!reviewMode && !SHARE_MODE) {   // a visitor's score is never saved, so no attempt lock ever starts
      scores.push({
        name:    this.studentName,
        section: this.currentSection,
        attempt: attemptNum,
        score:   this.score,
        total,
        pct,
        elapsed: this.timerSeconds,
        date:    date.toLocaleDateString(),
        time:    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done:    true
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    }

    submitScoreFinal();

    let letter = 'F', msg = "Let's study this again! 📚";
    if (pct === 100) { letter = 'A+'; msg = "⭐ PERFECT SCORE! ⭐"; }
    else if (pct >= 90) { letter = 'A'; msg = "Outstanding Work! 🌟"; }
    else if (pct >= 80) { letter = 'B'; msg = "Great Job! 👏"; }
    else if (pct >= 70) { letter = 'C'; msg = "Good Effort! 💪"; }
    else if (pct >= 60) { letter = 'D'; msg = "Keep Practicing! 🔄"; }

    this.show('end-screen');
    this._showAgainButton();

    const reviewNextBtn = document.getElementById('review-next-btn');
    if (reviewNextBtn) reviewNextBtn.classList.toggle('hidden', !reviewMode);

    document.getElementById('final-score-sub').textContent = SHARE_MODE
      ? `${SECTION_LABELS[this.currentSection]} · Guest view — this score was not saved`
      : `${SECTION_LABELS[this.currentSection]} · Attempt ${attemptNum} · ${this.studentName}`;
    document.getElementById('final-msg').textContent = msg;

    const pctEl = document.getElementById('final-percent');
    pctEl.innerHTML =
      `${this.score}/${total}<br><small style="font-size:0.5em;color:${pct>=70?'var(--correct)':'var(--danger)'};">${pct}% · ${letter}</small>`;
    setTimeout(() => pctEl.classList.add('revealed'), 50);

    const missedSec = document.getElementById('missed-section');
    if (this.missedQuestions.length) {
      missedSec.classList.remove('hidden');
      document.getElementById('missed-items').innerHTML =
        this.missedQuestions.map(m =>
          `<div class="missed-item">
            <div class="mi-label">${m.id}</div>
            <div style="margin:3px 0;">${plainText(m.q)}</div>
            ${m.yourAnswer ? `<div>Your answer: <span style="color:var(--danger);">${m.yourAnswer}</span> &nbsp; ✅ Correct: <strong style="color:var(--correct);">${m.correct}</strong></div>` : ''}
          </div>`
        ).join('');
    } else {
      missedSec.classList.add('hidden');
    }

    if (pct >= 80) startConfetti(pct);

    if (!reviewMode && !SHARE_MODE && allSectionsCompletedOnce(this.studentName)) {
      setTimeout(() => this.showScores(true), 3000);
    }
  },

  /* ── SPEAK QUESTION ── */
  speakQuestion() {
    const qBtn = document.getElementById('speak-q-btn');
    if (activeSpeakBtn === qBtn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    activeSpeakBtn = qBtn;
    qBtn.textContent = '⏹';

    const qtEl    = document.getElementById('question-text');
    const qtSpans = Array.from(qtEl.querySelectorAll('.wrd'));
    const qtText  = qtSpans.map(s => s.textContent).join(' ').replace(/_+/g, 'blank');

    let hlIdx = 0;
    const u = new SpeechSynthesisUtterance(qtText);
    u.lang = 'en-US';
    u.rate = 0.9;
    u.onboundary = e => {
      if (e.name !== 'word') return;
      document.querySelectorAll('#question-text .wrd.hl').forEach(el => el.classList.remove('hl'));
      if (qtSpans[hlIdx]) qtSpans[hlIdx].classList.add('hl');
      hlIdx++;
    };
    u.onend = () => {
      document.querySelectorAll('#question-text .wrd.hl').forEach(e => e.classList.remove('hl'));
      const b = document.getElementById('speak-q-btn');
      if (activeSpeakBtn === b) { b.textContent = '🔊'; activeSpeakBtn = null; }
    };
    addHighlightFallback(u, qtSpans);
    window.speechSynthesis.speak(u);
  },

  /* ── SCORES ── */
  showScores(autoShow = false) {
    this.show('scoreboard-screen');
    const teacherBtns = document.getElementById('teacher-score-btns');
    if (teacherBtns) teacherBtns.style.display = this.studentName === 'Mr. O (Teacher)' ? 'flex' : 'none';
    if (!reviewMode) this._startScoreLock(autoShow ? 60 : 0);
    const all    = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const listEl = document.getElementById('score-list');
    const noEl   = document.getElementById('no-scores-msg');

    if (!all.length) {
      listEl.innerHTML = '';
      noEl.style.display = 'block';
      return;
    }
    noEl.style.display = 'none';

    const sections = Object.keys(ACTIVITIES);

    const summaryCards = sections.map(sec => {
      const best = all.filter(s => s.section === sec && s.done)
        .reduce((b, r) => (!b || r.pct > b.pct) ? r : b, null);
      const label = SECTION_LABELS[sec];
      if (!best) {
        return `<div class="sb-summary-card sb-incomplete">
          <div class="sb-summary-label">${label}</div>
          <div class="sb-summary-grade" style="color:#ccc;">—</div>
          <div class="sb-summary-score" style="color:#aaa;">Not yet completed</div>
        </div>`;
      }
      const grade = letterGradeStudent(best.pct);
      const gc    = best.pct>=90?'#27ae60':best.pct>=80?'#2980b9':best.pct>=70?'#f39c12':best.pct>=60?'#e67e22':'#e74c3c';
      return `<div class="sb-summary-card">
        <div class="sb-summary-label">${label}</div>
        <div class="sb-summary-grade" style="color:${gc};">${grade}</div>
        <div class="sb-summary-score">${best.score}/${best.total} · ${best.pct}%</div>
        <div class="sb-summary-attempt">Best of ${all.filter(s=>s.section===sec&&s.done).length} attempt(s)</div>
      </div>`;
    }).join('');

    const details = sections.map(sec => {
      const rows = all.filter(s => s.section === sec && s.done);
      if (!rows.length) return '';
      const att1 = rows.filter(r => (r.attempt||1) === 1);
      const att2 = rows.filter(r => (r.attempt||1) >= 2);

      const buildTable = (attempts, label, headerColor) => {
        if (!attempts.length) return '';
        return `
          <div style="margin-bottom:14px;">
            <div style="display:inline-block;background:${headerColor};color:white;
                        font-size:0.72rem;font-weight:bold;letter-spacing:1px;
                        text-transform:uppercase;border-radius:6px;padding:3px 10px;
                        margin-bottom:6px;">${label}</div>
            <table class="scoreboard-table">
              <thead><tr><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
              <tbody>
                ${attempts.map(r => {
                  const grade = letterGradeStudent(r.pct);
                  const cls   = r.pct>=90?'score-good':r.pct>=70?'score-ok':'score-bad';
                  return `<tr>
                    <td>${r.score}/${r.total}</td>
                    <td class="${cls}">${r.pct}%</td>
                    <td class="${cls}" style="font-weight:800;">${grade}</td>
                    <td>${r.time||'—'}</td>
                    <td>${r.date}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      };

      return `
        <h3 style="color:var(--primary);margin:22px 0 8px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">
          ${SECTION_LABELS[sec]}
        </h3>
        ${buildTable(att1,'Attempt 1','#1a3a6b')}
        ${buildTable(att2,'Attempt 2','#c0392b')}`;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:6px;font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Best Scores</div>
      <div class="sb-summary-row">${summaryCards}</div>
      <div style="margin-top:24px;">${details}</div>`;
  },

  _startScoreLock(secs) {
    const bar     = document.getElementById('sb-lock-bar');
    const fill    = document.getElementById('sb-lock-fill');
    const count   = document.getElementById('sb-lock-count');
    const buttons = document.querySelectorAll('#scoreboard-screen button:not(#sb-lock-bar button)');
    if (!secs || secs <= 0) { if (bar) bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    count.textContent = secs;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`;
      fill.style.width = '0%';
    }));
    buttons.forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    let remaining = secs;
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        bar.classList.add('hidden');
        buttons.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      }
    }, 1000);
  },

  clearScores() {
    const panel = document.getElementById('clear-confirm-panel');
    panel.classList.remove('hidden');
    document.getElementById('clear-pin-input').value = '';
    document.getElementById('clear-pin-error').textContent = '';
    setTimeout(() => document.getElementById('clear-pin-input').focus(), 80);
  },

  confirmClearScores() {
    const pin = document.getElementById('clear-pin-input').value.trim();
    if (pin === '9377') {
      localStorage.removeItem(SCORES_KEY);
      document.getElementById('clear-confirm-panel').classList.add('hidden');
      this.showScores();
    } else {
      document.getElementById('clear-pin-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('clear-pin-input').value = '';
      document.getElementById('clear-pin-input').focus();
    }
  },

  cancelClearScores() {
    document.getElementById('clear-confirm-panel').classList.add('hidden');
  },

  printResults() {
    const all = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (!all.length) { alert('No scores to print yet!'); return; }
    const sections = Object.keys(ACTIVITIES);
    const rows = sections.flatMap(sec =>
      all.filter(s => s.section === sec).map(r => {
        const cc  = r.pct >= 80 ? 'good' : r.pct >= 60 ? 'ok' : 'bad';
        const att = r.attempt || 1;
        const attLabel = att === 1 ? 'Attempt 1' : `Attempt ${att}`;
        const attStyle = att === 1
          ? 'background:#1a3a6b;color:white;padding:2px 7px;border-radius:4px;font-size:0.8em;'
          : 'background:#c0392b;color:white;padding:2px 7px;border-radius:4px;font-size:0.8em;';
        return `<tr>
          <td>${escapeHtml(r.name||'—')}</td>
          <td>${SECTION_LABELS[r.section]}</td>
          <td><span style="${attStyle}">${attLabel}</span></td>
          <td>${r.score}/${r.total}</td>
          <td class="${cc}">${r.pct}%</td>
          <td>${r.time||'—'}</td>
          <td>${r.date}</td>
        </tr>`;
      })
    ).join('');

    const html = `<html><head><title>R.A.D. Practice Scores</title>
      <style>body{font-family:Arial;padding:20px;}h2{color:#1a3a6b;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th,td{border:1px solid #ccc;padding:8px 12px;text-align:center;}
      th{background:#1a3a6b;color:white;}
      .good{color:green;font-weight:bold;}.ok{color:orange;font-weight:bold;}.bad{color:red;font-weight:bold;}</style>
      </head><body>
      <h2>✍️ R.A.D. Practice — Score Report</h2>
      <p>Printed: ${new Date().toLocaleString()}</p>
      <table><tr><th>Name</th><th>Section</th><th>Attempt</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr>${rows}</table>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  },

  /* ── END SCREEN ACTIONS ──
     Marcos 10/14: the buttons say where they go. "Back to My Activities" keeps
     the student signed in; "Do This Activity Again" starts the same one (while a
     try is left); only "Sign Out" goes back to the very beginning. */
  backToMenu() {
    if (!this.studentName) { this.restart(); return; }
    this.tryAgain();
  },

  doAgain() {
    stopConfetti();
    if (!this.studentName || !this.currentSection) { this.restart(); return; }
    this.attemptStart(this.currentSection);
  },

  // "Do This Activity Again" always shows: no try limit on this site.
  // "Do This Activity Again" always shows (no try limit). The note under it says whether the next activity is open.
  _showAgainButton() {
    const btn  = document.getElementById('again-btn');
    const note = document.getElementById('again-note');
    if (!btn || !note) return;
    btn.classList.remove('hidden');
    const sub = document.getElementById('again-sub');
    if (sub) sub.textContent = 'Start this one over.';
    const next = nextActivity(this.currentSection);
    const total = this.currentBank.length;
    const thisTry = total ? this.score / total * 100 >= PASS_PCT : false;
    let text = '';
    if (SHARE_MODE || reviewMode) text = '';
    else if (!next) text = thisTry ? '🏆 You finished all 8 activities! Do any of them again anytime.' : '';
    else if (passed(this.studentName, this.currentSection))
      text = thisTry ? `🔓 You got ${needFor(this.currentSection)} or more right. ${next.short} is open!` : `✅ ${next.short} is already open.`;
    else text = `Get ${needFor(this.currentSection)} of ${total} right to open ${next.short}. Do this activity again to try!`;
    note.classList.toggle('hidden', !text);
    note.textContent = text;
  },

  tryAgain() {
    stopConfetti();
    this.timerSeconds = 0;
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    applyLocks(this.studentName);
    this.checkResume();
  },

  restart() {
    stopConfetti();
    this.stopTimerEngine();
    this.timerSeconds   = 0;
    this.studentName    = '';
    loggedInName        = '';
    unlockedSections    = new Set();
    document.getElementById('name-select').value = '';
    document.getElementById('student-pin').value = '';
    document.getElementById('pin-section').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('login-error').textContent = '';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── GLOBAL PIN MODAL ── */
  showPinModal(title, msg, onSuccess) {
    pinModalCallback = onSuccess;
    document.getElementById('pin-modal-title').textContent = title;
    document.getElementById('pin-modal-msg').textContent   = msg;
    document.getElementById('pin-modal-input').value       = '';
    document.getElementById('pin-modal-error').textContent = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-modal-input').focus(), 80);
  },

  confirmPinModal() {
    const pin = document.getElementById('pin-modal-input').value.trim();
    if (pin === '9377') {
      document.getElementById('pin-modal').classList.add('hidden');
      const cb = pinModalCallback;
      pinModalCallback = null;
      if (cb) cb();
    } else {
      document.getElementById('pin-modal-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('pin-modal-input').value = '';
      document.getElementById('pin-modal-input').focus();
    }
  },

  cancelPinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    pinModalCallback = null;
  }
};

/* ── VISIBILITY / UNLOAD ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!app.timerOn) return;
    tabSwitchCount++;
    logEvent('leave');
    app.stopTimerEngine();
    app.saveProgress();
    if (app.instructInterval) { clearInterval(app.instructInterval); }
    if (app.readInterval)     { clearInterval(app.readInterval); app.readInterval = null; app._readLockPaused = true; }
    app._wasTimerRunning = true;
  } else {
    if (!app._wasTimerRunning) return;
    app._wasTimerRunning = false;
    logEvent('return');
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.remove('hidden');
    app.stopTimerEngine();
    app.timerInterval = setInterval(() => {
      app.timerSeconds++;
      app._tickTimer();
      if (app.timerSeconds % 30 === 0) app.saveProgress();
    }, 1000);
    app.timerOn = true;
    // The read lock stopped while the page was hidden; start it over so the
    // answers unlock again (left alone they stayed locked until a refresh).
    if (app._readLockPaused) { app._readLockPaused = false; app.startReadTimer(); }
  }
});

window.addEventListener('beforeunload', () => {
  if (app.timerOn) logEvent('close');
  if (app.timerOn) app.saveProgress();
});

/* ── CONFETTI ────────────────────────────────────────── */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animId = null;

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function startConfetti(pct) {
  particles = [];
  let count, cols;
  if (pct === 100) {
    count = 300;
    cols = ['#FFD700','#c0392b','#FFFACD','#FFA500','#ffffff','#FFD700'];
  } else if (pct >= 90) {
    count = 220;
    cols = ['#1a3a6b','#c0392b','#2ecc71','#3498db','#9b59b6','#e74c3c','#FFD700'];
  } else if (pct >= 80) {
    count = 160;
    cols = ['#1a3a6b','#c0392b','#2ecc71','#3498db','#e74c3c','#9b59b6'];
  } else {
    count = 80;
    cols = ['#1a3a6b','#c0392b','#7f8c8d','#95a5a6','#bdc3c7'];
  }
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      c: cols[~~(Math.random() * cols.length)],
      s: Math.random() * 5 + 3,
      d: Math.random() * 5 + 2,
      r: Math.random() * Math.PI * 2
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r += 0.05);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
    p.y += p.d; p.x += Math.sin(p.r) * 1.5;
    if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
  });
  animId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

/* ── BOOT ────────────────────────────────────────────── */
app.init();

/* ── CLOSED-TO-STUDENTS LOCK ────────────────────────── */
(function applyReviewLock() {
  if (REVIEW_OPEN || SHARE_MODE) return;
  const btn = document.querySelector('.lgs-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('locked');
  btn.textContent = '🔒 Not Open Yet';
  const note = document.createElement('p');
  note.className = 'locked-note';
  note.textContent = "Mr. O will let you know when R.A.D. Practice is ready!";
  btn.insertAdjacentElement('afterend', note);
})();
