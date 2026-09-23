/* ===================== Vocab Mountain — app.js ===================== */
(function(){
"use strict";

/* ---------- Data prep ---------- */
// WORDS_DATA comes from words_data.js: [{day, word, easy_meaning}, ...]
const WORDS = WORDS_DATA.map((w, i) => ({
  id: i,
  day: w.day,
  word: w.word,
  meaning: w.easy_meaning
}));
const DAYS = [...new Set(WORDS.map(w => w.day))].sort((a,b) => a-b);
const BY_DAY = {};
DAYS.forEach(d => BY_DAY[d] = WORDS.filter(w => w.day === d));
const TOTAL = WORDS.length;

/* ---------- State (persisted) ---------- */
const STORE_KEY = "vocabMountainProgress_v1";
function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { box:{}, lastCamp:1, streak:0, lastActiveDate:null, cardIndex:{}, quizStats:{taken:0, best:0} };
}
let state = loadState();
function save(){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
}

function getBox(id){ return state.box[id] || 0; } // 0 new, 1 learning, 2 mastered
function setBox(id, val){
  val = Math.max(0, Math.min(2, val));
  state.box[id] = val;
}
function markSeen(){
  const today = new Date().toDateString();
  if(state.lastActiveDate !== today){
    const y = new Date(); y.setDate(y.getDate()-1);
    if(state.lastActiveDate === y.toDateString()){
      state.streak = (state.streak||0) + 1;
    } else {
      state.streak = 1;
    }
    state.lastActiveDate = today;
    save();
  }
}

function statusOf(id){
  const b = getBox(id);
  return b === 2 ? "mastered" : (b === 1 ? "learning" : "new");
}
function campStats(day){
  const words = BY_DAY[day];
  let mastered=0, learning=0, fresh=0;
  words.forEach(w => {
    const s = statusOf(w.id);
    if(s==="mastered") mastered++;
    else if(s==="learning") learning++;
    else fresh++;
  });
  return {mastered, learning, fresh, total: words.length};
}
function overallStats(){
  let mastered=0, learning=0;
  WORDS.forEach(w => {
    const s = statusOf(w.id);
    if(s==="mastered") mastered++;
    else if(s==="learning") learning++;
  });
  return {mastered, learning, total: TOTAL};
}
function firstUnfinishedCamp(){
  for(const d of DAYS){
    const cs = campStats(d);
    if(cs.mastered < cs.total) return d;
  }
  return DAYS[DAYS.length-1];
}

/* ---------- Helpers ---------- */
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function pickN(arr, n){ return shuffle(arr).slice(0, n); }
function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------- Tabs / routing ---------- */
const views = ["camp","trail","quiz","all"];
const tabButtons = document.querySelectorAll("#tabs button");
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});
function switchView(name, opts){
  opts = opts || {};
  views.forEach(v => {
    document.getElementById("view-"+v).classList.toggle("active", v===name);
  });
  tabButtons.forEach(b => b.classList.toggle("active", b.dataset.view===name));
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
  if(name==="camp") renderBaseCamp();
  if(name==="trail") renderTrail(opts.day);
  if(name==="quiz") renderQuizHome();
  if(name==="all") renderAllWords();
}

function renderStreak(){
  document.getElementById("streakCount").textContent = state.streak || 0;
}

/* ===================== BASE CAMP ===================== */
function renderBaseCamp(){
  const el = document.getElementById("view-camp");
  const os = overallStats();
  const pct = Math.round((os.mastered/os.total)*100);
  const resumeDay = firstUnfinishedCamp();

  el.innerHTML = `
    <div class="hero">
      <div class="card hero-main">
        <div class="hero-eyebrow">Base Camp</div>
        <h1 class="hero-title">Ready for today's climb?</h1>
        <p class="hero-sub">959 words are waiting across 32 camps up the mountain. Learn a camp's words with flashcards, then lock them in with a quiz.</p>
        <div class="hero-actions">
          <button class="btn btn-amber" id="btnResume">Continue · Camp ${resumeDay}</button>
          <button class="btn btn-ghost" id="btnQuickQuiz">Quick Quiz</button>
        </div>
      </div>
      <div class="card stat-block">
        <div>
          <div class="stat-num-row"><span class="stat-num">${os.mastered}</span><span class="stat-of">/ ${os.total} mastered</span></div>
        </div>
        <div class="elevation-bar"><div class="elevation-fill" style="width:${pct}%"></div></div>
        <div class="stat-legend">
          <span><span class="dot" style="background:var(--pine)"></span>Mastered ${os.mastered}</span>
          <span><span class="dot" style="background:var(--amber)"></span>Learning ${os.learning}</span>
          <span><span class="dot" style="background:var(--line)"></span>Not started ${os.total-os.mastered-os.learning}</span>
        </div>
      </div>
    </div>

    <div class="section-title">The Climb <span class="muted" style="font-size:13px;font-weight:500">32 camps</span></div>
    <div class="camp-grid" id="campGrid"></div>
  `;

  document.getElementById("btnResume").addEventListener("click", () => switchView("trail", {day: resumeDay}));
  document.getElementById("btnQuickQuiz").addEventListener("click", () => { switchView("quiz"); startQuiz("quick"); });

  const grid = document.getElementById("campGrid");
  grid.innerHTML = DAYS.map(d => {
    const cs = campStats(d);
    const pctC = Math.round((cs.mastered/cs.total)*100);
    const done = cs.mastered === cs.total;
    const isCurrent = d === resumeDay;
    return `<button class="camp-tile ${done?"done":""} ${isCurrent?"current":""}" data-day="${d}">
      <div class="ring-wrap">${ring(pctC)}</div>
      <div class="cn">Camp ${d}</div>
      <div class="cl">${cs.mastered}/${cs.total} words</div>
    </button>`;
  }).join("");
  grid.querySelectorAll(".camp-tile").forEach(t => {
    t.addEventListener("click", () => switchView("trail", {day: Number(t.dataset.day)}));
  });
}

function ring(pct){
  const r = 12, c = 2*Math.PI*r;
  const off = c - (pct/100)*c;
  const color = pct===100 ? "var(--pine)" : (pct>0 ? "var(--amber)" : "var(--line)");
  return `<svg width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="${r}" fill="none" stroke="var(--line)" stroke-width="3"/>
    <circle cx="14" cy="14" r="${r}" fill="none" stroke="${color}" stroke-width="3"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"
      transform="rotate(-90 14 14)"/>
  </svg>`;
}

/* ===================== TRAIL (flashcards) ===================== */
let trailDay = null;
let trailIdx = 0;
let trailFlipped = false;

function renderTrail(day){
  const el = document.getElementById("view-trail");
  if(day) { trailDay = day; trailIdx = 0; }
  if(!trailDay) trailDay = firstUnfinishedCamp();
  trailFlipped = false;

  el.innerHTML = `
    <div class="trail-head">
      <select class="camp-select" id="campSelect">
        ${DAYS.map(d => `<option value="${d}" ${d===trailDay?"selected":""}>Camp ${d}</option>`).join("")}
      </select>
      <span class="flash-progress" id="flashProgressLabel"></span>
    </div>
    <div class="progress-strip" id="progressStrip"></div>
    <div id="flashArea"></div>
  `;

  document.getElementById("campSelect").addEventListener("change", (e) => {
    trailDay = Number(e.target.value);
    trailIdx = 0;
    trailFlipped = false;
    renderTrail();
  });

  renderProgressStrip();
  renderFlashcard();
}

function renderProgressStrip(){
  const words = BY_DAY[trailDay];
  const strip = document.getElementById("progressStrip");
  strip.innerHTML = words.map(w => `<div class="progress-seg ${statusOf(w.id)}"></div>`).join("");
}

function renderFlashcard(){
  const words = BY_DAY[trailDay];
  const area = document.getElementById("flashArea");
  document.getElementById("flashProgressLabel").textContent = `${Math.min(trailIdx+1, words.length)} / ${words.length}`;

  if(trailIdx >= words.length){
    const cs = campStats(trailDay);
    area.innerHTML = `
      <div class="card camp-complete">
        <div class="big-check">⛺</div>
        <h2>Camp ${trailDay} reviewed</h2>
        <p class="muted" style="margin-top:8px">${cs.mastered}/${cs.total} words mastered so far. Test yourself to lock them in.</p>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:22px; flex-wrap:wrap">
          <button class="btn btn-ghost" id="btnRestartCamp">Review again</button>
          <button class="btn btn-amber" id="btnQuizCamp">Quiz this camp</button>
          ${trailDay < DAYS[DAYS.length-1] ? `<button class="btn btn-primary" id="btnNextCamp">Next camp →</button>` : ``}
        </div>
      </div>`;
    document.getElementById("btnRestartCamp").addEventListener("click", () => { trailIdx=0; trailFlipped=false; renderFlashcard(); });
    document.getElementById("btnQuizCamp").addEventListener("click", () => { switchView("quiz"); startQuiz("camp", trailDay); });
    const nextBtn = document.getElementById("btnNextCamp");
    if(nextBtn) nextBtn.addEventListener("click", () => {
      trailDay = DAYS[DAYS.indexOf(trailDay)+1]; trailIdx=0; trailFlipped=false; renderTrail();
    });
    return;
  }

  const w = words[trailIdx];
  markSeen(); renderStreak();

  area.innerHTML = `
    <div class="flashcard-zone">
      <div class="flashcard" id="flashcard">
        <div class="flashcard-inner">
          <div class="face face-front">
            <div class="face-label">Camp ${w.day} · Word</div>
            <div class="face-word">${esc(w.word)}</div>
            <div class="face-hint">Tap to reveal meaning</div>
          </div>
          <div class="face face-back">
            <div class="face-label">Meaning</div>
            <div class="face-meaning">${esc(w.meaning)}</div>
            <div class="face-hint">Tap to flip back</div>
          </div>
        </div>
      </div>
      <div class="flash-controls">
        <button class="btn btn-ghost" id="btnForgot">Still learning</button>
        <button class="btn btn-pine" id="btnKnew">Got it ✓</button>
      </div>
      <div class="flash-nav">
        <button class="icon-btn" id="btnPrev" ${trailIdx===0?"disabled":""} aria-label="Previous">‹</button>
        <span class="flash-progress">${statusOf(w.id).toUpperCase()}</span>
        <button class="icon-btn" id="btnSkip" aria-label="Skip">›</button>
      </div>
    </div>
  `;

  const cardEl = document.getElementById("flashcard");
  cardEl.classList.toggle("flipped", trailFlipped);
  cardEl.addEventListener("click", () => {
    trailFlipped = !trailFlipped;
    cardEl.classList.toggle("flipped", trailFlipped);
  });

  document.getElementById("btnKnew").addEventListener("click", (e) => {
    e.stopPropagation();
    setBox(w.id, getBox(w.id)+1);
    save();
    advanceCard();
  });
  document.getElementById("btnForgot").addEventListener("click", (e) => {
    e.stopPropagation();
    setBox(w.id, Math.max(0, getBox(w.id)-1));
    save();
    advanceCard();
  });
  document.getElementById("btnPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    if(trailIdx>0){ trailIdx--; trailFlipped=false; renderFlashcard(); renderProgressStrip(); }
  });
  document.getElementById("btnSkip").addEventListener("click", (e) => {
    e.stopPropagation();
    advanceCard();
  });
}
function advanceCard(){
  trailIdx++;
  trailFlipped = false;
  renderFlashcard();
  renderProgressStrip();
}

/* ===================== SUMMIT QUIZ ===================== */
let quiz = null; // {pool, idx, score, missed:[], mode}

function renderQuizHome(){
  const el = document.getElementById("view-quiz");
  const os = overallStats();
  const seenPool = WORDS.filter(w => getBox(w.id) > 0).length;

  el.innerHTML = `
    <h1 style="font-size:22px;margin-bottom:6px">Summit Quiz</h1>
    <p class="muted" style="margin-bottom:20px">Multiple-choice checks that update your mastery as you go.</p>
    <div class="quiz-modes">
      <div class="card mode-card" id="modeQuick">
        <span class="mode-icon">⚡</span>
        <h3>Quick Quiz</h3>
        <p>10 random questions from words you've already seen.</p>
        <span class="mode-count">${Math.min(seenPool,10)} ready</span>
      </div>
      <div class="card mode-card" id="modeCamp">
        <span class="mode-icon">🏕️</span>
        <h3>Camp Quiz</h3>
        <p>Test every word from one specific camp.</p>
        <span class="mode-count">choose a camp</span>
      </div>
      <div class="card mode-card" id="modeMastered">
        <span class="mode-icon">🧗</span>
        <h3>Weak Spots</h3>
        <p>Focus on words still marked "learning".</p>
        <span class="mode-count">${WORDS.filter(w=>statusOf(w.id)==="learning").length} words</span>
      </div>
      <div class="card mode-card" id="modeSummit">
        <span class="mode-icon">🏔️</span>
        <h3>Full Mountain</h3>
        <p>20 questions pulled from all 959 words. The real test.</p>
        <span class="mode-count">959 words</span>
      </div>
    </div>
    <div id="quizArea" style="margin-top:26px"></div>
  `;

  document.getElementById("modeQuick").addEventListener("click", () => startQuiz("quick"));
  document.getElementById("modeMastered").addEventListener("click", () => startQuiz("weak"));
  document.getElementById("modeSummit").addEventListener("click", () => startQuiz("summit"));
  document.getElementById("modeCamp").addEventListener("click", () => {
    const area = document.getElementById("quizArea");
    area.innerHTML = `
      <div class="card" style="padding:20px; max-width:420px; margin:0 auto; display:flex; gap:10px; align-items:center">
        <select class="camp-select" id="quizCampSelect" style="flex:1">
          ${DAYS.map(d => `<option value="${d}">Camp ${d}</option>`).join("")}
        </select>
        <button class="btn btn-amber" id="quizCampGo">Start</button>
      </div>`;
    document.getElementById("quizCampGo").addEventListener("click", () => {
      startQuiz("camp", Number(document.getElementById("quizCampSelect").value));
    });
  });
}

function buildPool(mode, dayArg){
  if(mode === "camp") return shuffle(BY_DAY[dayArg]);
  if(mode === "weak") return pickN(WORDS.filter(w => statusOf(w.id)==="learning"), 20);
  if(mode === "summit") return pickN(WORDS, 20);
  // quick: prefer seen words, fall back to any
  let seen = WORDS.filter(w => getBox(w.id) > 0);
  if(seen.length < 5) seen = WORDS;
  return pickN(seen, 10);
}

function startQuiz(mode, dayArg){
  const pool = buildPool(mode, dayArg);
  if(pool.length === 0){
    document.getElementById("quizArea").innerHTML = `<p class="muted" style="text-align:center">Learn a few words on the Trail first, then come back to quiz yourself.</p>`;
    return;
  }
  quiz = { pool, idx:0, score:0, missed:[], mode, answered:false };
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const area = document.getElementById("quizArea");
  if(quiz.idx >= quiz.pool.length){
    renderQuizResults();
    return;
  }
  const w = quiz.pool[quiz.idx];
  const wrongPool = WORDS.filter(x => x.id !== w.id);
  const distractors = pickN(wrongPool, 3).map(x => x.meaning);
  const options = shuffle([w.meaning, ...distractors]);
  const letters = ["A","B","C","D"];

  const pct = Math.round((quiz.idx/quiz.pool.length)*100);

  area.innerHTML = `
    <div class="quiz-live">
      <div class="quiz-top">
        <span class="quiz-score mono">Q${quiz.idx+1}/${quiz.pool.length}</span>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        <span class="quiz-score mono">${quiz.score} ✓</span>
      </div>
      <div class="card quiz-question-card">
        <div class="quiz-kicker">Camp ${w.day} · What does this word mean?</div>
        <div class="quiz-prompt">${esc(w.word)}</div>
        <div class="quiz-options" id="quizOptions">
          ${options.map((opt,i) => `<button class="quiz-opt" data-correct="${opt===w.meaning}" data-idx="${i}">
            <span class="opt-letter">${letters[i]}</span><span>${esc(opt)}</span>
          </button>`).join("")}
        </div>
        <div class="quiz-next-row" id="quizNextRow"></div>
      </div>
    </div>
  `;

  document.querySelectorAll(".quiz-opt").forEach(btn => {
    btn.addEventListener("click", () => onAnswer(btn, w));
  });
}

function onAnswer(btn, w){
  if(quiz.answered) return;
  quiz.answered = true;
  const correct = btn.dataset.correct === "true";
  document.querySelectorAll(".quiz-opt").forEach(b => {
    b.disabled = true;
    if(b.dataset.correct === "true") b.classList.add("correct");
    else if(b === btn) b.classList.add("wrong");
  });

  if(correct){
    quiz.score++;
    setBox(w.id, getBox(w.id)+1);
  } else {
    setBox(w.id, Math.max(0, getBox(w.id)-1));
    quiz.missed.push(w);
  }
  save();

  document.getElementById("quizNextRow").innerHTML = `<button class="btn btn-amber" id="btnNextQ">${quiz.idx+1 < quiz.pool.length ? "Next question →" : "See results"}</button>`;
  document.getElementById("btnNextQ").addEventListener("click", () => {
    quiz.idx++;
    quiz.answered = false;
    renderQuizQuestion();
  });
}

function renderQuizResults(){
  const area = document.getElementById("quizArea");
  const total = quiz.pool.length;
  const pct = Math.round((quiz.score/total)*100);
  state.quizStats.taken = (state.quizStats.taken||0) + 1;
  state.quizStats.best = Math.max(state.quizStats.best||0, pct);
  save();

  let msg;
  if(pct === 100) msg = "Flawless ascent. Every word summited.";
  else if(pct >= 80) msg = "Strong climb — just a few words slipped on the way up.";
  else if(pct >= 50) msg = "Solid progress. Review the missed words and try again.";
  else msg = "Tough stretch of trail. Head back to flashcards for these words.";

  area.innerHTML = `
    <div class="quiz-live">
      <div class="card quiz-results">
        <div style="font-size:38px">${pct===100?"🏔️":pct>=80?"⛰️":"🧗"}</div>
        <div class="result-score">${quiz.score}<span style="font-size:28px;color:var(--ink-soft)">/${total}</span></div>
        <div class="result-label">${pct}% correct</div>
        <p class="result-msg">${msg}</p>
        <div class="result-actions">
          <button class="btn btn-ghost" id="btnBackModes">Back to quiz modes</button>
          <button class="btn btn-amber" id="btnRetryQuiz">Try again</button>
        </div>
        ${quiz.missed.length ? `
        <div class="missed-list">
          <div class="muted" style="font-size:12.5px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.05em">Review these</div>
          ${quiz.missed.map(w => `<div class="missed-item"><span class="w">${esc(w.word)}</span><span class="m">${esc(w.meaning)}</span></div>`).join("")}
        </div>` : ``}
      </div>
    </div>
  `;
  document.getElementById("btnBackModes").addEventListener("click", renderQuizHome);
  document.getElementById("btnRetryQuiz").addEventListener("click", () => startQuiz(quiz.mode, quiz.pool[0] ? quiz.pool[0].day : undefined));
}

/* ===================== ALL WORDS ===================== */
function renderAllWords(){
  const el = document.getElementById("view-all");
  el.innerHTML = `
    <div class="all-controls">
      <input class="search-input" id="searchInput" placeholder="Search a word or meaning…" autocomplete="off">
      <select class="filter-select" id="dayFilter">
        <option value="all">All camps</option>
        ${DAYS.map(d => `<option value="${d}">Camp ${d}</option>`).join("")}
      </select>
      <select class="filter-select" id="statusFilter">
        <option value="all">All status</option>
        <option value="mastered">Mastered</option>
        <option value="learning">Learning</option>
        <option value="new">Not started</option>
      </select>
    </div>
    <div class="results-count" id="resultsCount"></div>
    <div class="word-list" id="wordList"></div>
  `;
  const search = document.getElementById("searchInput");
  const dayFilter = document.getElementById("dayFilter");
  const statusFilter = document.getElementById("statusFilter");
  [search, dayFilter, statusFilter].forEach(elm => elm.addEventListener("input", filterWords));
  filterWords();
}

function filterWords(){
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const day = document.getElementById("dayFilter").value;
  const status = document.getElementById("statusFilter").value;

  let results = WORDS;
  if(day !== "all") results = results.filter(w => String(w.day) === day);
  if(status !== "all") results = results.filter(w => statusOf(w.id) === status);
  if(q) results = results.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));

  document.getElementById("resultsCount").textContent = `${results.length} word${results.length!==1?"s":""}`;
  const list = document.getElementById("wordList");
  if(results.length === 0){
    list.innerHTML = `<div class="empty-note">No words match that search.</div>`;
    return;
  }
  const MAX = 400;
  const shown = results.slice(0, MAX);
  list.innerHTML = shown.map(w => `
    <div class="word-row">
      <span class="wc">C${w.day}</span>
      <span class="wm"><div class="ww">${esc(w.word)}</div><div class="wd">${esc(w.meaning)}</div></span>
      <span class="status-badge ${statusOf(w.id)}">${statusOf(w.id)}</span>
    </div>
  `).join("");
  if(results.length > MAX){
    list.innerHTML += `<div class="empty-note">Showing first ${MAX} of ${results.length} — narrow your search to see more.</div>`;
  }
}

/* ---------- Init ---------- */
renderStreak();
renderBaseCamp();
})();
