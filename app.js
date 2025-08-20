// Small helper: normalize strings (lowercase, trim, remove accents, collapse spaces)
function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Speech synthesis (attempt Basque voice if available)
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  // Try to pick a Basque/Spanish voice; otherwise leave default
  const voices = window.speechSynthesis.getVoices();
  const euVoice =
    voices.find(v => /eu|basque/i.test(v.lang)) ||
    voices.find(v => /es-ES|es/i.test(v.lang));
  if (euVoice) utter.voice = euVoice;
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

const state = {
  currentIndex: 0,
  score: 0,
  answered: 0,
  shuffled: [],
};

function saveProgress() {
  const payload = {
    ts: Date.now(),
    score: state.score,
    total: LESSON.questions.length
  };
  localStorage.setItem("euskara_progress_m1l1", JSON.stringify(payload));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem("euskara_progress_m1l1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function updateProgressBar() {
  const bar = $("#progress-bar");
  const wrap = $("#progress");
  const pct = Math.round((state.answered / LESSON.questions.length) * 100);
  bar.style.width = pct + "%";
  wrap.hidden = false;
}

function showView(id) {
  $all(".view").forEach(v => v.hidden = true);
  const view = $("#" + id);
  view.hidden = false;
}

function renderVocab() {
  const ul = $("#vocab-list");
  ul.innerHTML = "";
  LESSON.vocab.forEach(item => {
    const li = document.createElement("li");
    li.className = "vocab-row";
    li.innerHTML = `
      <div class="lhs">${item.eu} ${item.note ? `<small class="rhs">· ${item.note}</small>` : ""}</div>
      <div class="rhs">${item.fr}</div>
      <button class="speak" aria-label="Prononcer ${item.eu}" title="Écouter" data-text="${item.eu}">🔊</button>
    `;
    ul.appendChild(li);
  });
  ul.addEventListener("click", (e) => {
    const btn = e.target.closest("button.speak");
    if (btn) speak(btn.dataset.text);
  });
  const saved = loadProgress();
  if (saved) {
    const done = document.createElement("div");
    done.className = "card";
    const date = new Date(saved.ts);
    done.innerHTML = `<strong>Dernier score :</strong> ${saved.score}/${saved.total} · <small>${date.toLocaleString()}</small>`;
    $("#home").appendChild(done);
  }
}

function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
}

function startQuiz() {
  state.currentIndex = 0;
  state.score = 0;
  state.answered = 0;
  state.shuffled = shuffle(LESSON.questions.slice());
  showView("quiz");
  $("#q-counter").textContent = `Question 1/${state.shuffled.length}`;
  $("#score").textContent = `Score : 0`;
  renderQuestion();
  updateProgressBar();
}

function renderQuestion() {
  const q = state.shuffled[state.currentIndex];
  const area = $("#question-area");
  area.innerHTML = "";
  const title = document.createElement("div");
  title.className = "q-title";
  title.textContent = q.prompt;
  area.appendChild(title);

  if (q.type === "mcq") {
    const opts = document.createElement("div");
    opts.className = "options";
    const shuffled = shuffle(q.options.slice());
    shuffled.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleMCQ(opt, q.answer));
      opts.appendChild(btn);
    });
    area.appendChild(opts);
  } else if (q.type === "type") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = q.placeholder || "Réponse…";
    input.autocapitalize = "none";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", "Réponse");
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") checkTyped();
    });
    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Valider";
    btn.addEventListener("click", checkTyped);
    area.append(input, btn);

    function checkTyped() {
      const val = normalize(input.value);
      const ok = q.acceptable.some(a => normalize(a) === val);
      finalize(ok, ok ? q.acceptable[0] : q.acceptable.join(" / "));
    }
  }

  const fb = document.createElement("div");
  fb.className = "feedback";
  fb.id = "feedback";
  area.appendChild(fb);
}

function handleMCQ(opt, answer) {
  const ok = normalize(opt) === normalize(answer);
  finalize(ok, answer);
}

function finalize(ok, correctText) {
  const fb = $("#feedback");
  const buttons = $all("button.option");
  buttons.forEach(b => b.disabled = true);

  state.answered += 1;
  if (ok) {
    state.score += 1;
    fb.textContent = "✅ Correct !";
    fb.className = "feedback ok";
  } else {
    fb.textContent = "❌ Faux. Réponse : " + correctText;
    fb.className = "feedback no";
  }
  $("#score").textContent = `Score : ${state.score}`;
  updateProgressBar();

  setTimeout(nextQuestion, 700);
}

function nextQuestion() {
  if (state.currentIndex + 1 >= state.shuffled.length) {
    // End
    saveProgress();
    showResult();
  } else {
    state.currentIndex += 1;
    $("#q-counter").textContent = `Question ${state.currentIndex + 1}/${state.shuffled.length}`;
    renderQuestion();
  }
}

function showResult() {
  showView("result");
  const total = LESSON.questions.length;
  const txt = `Tu as ${state.score}/${total}. ${state.score === total ? "Parfait 🎉" : state.score >= Math.ceil(total*0.7) ? "Bien joué 💪" : "On refait un tour ?"}`;
  $("#final-text").textContent = txt;
  saveProgress();
}

// Event wiring
window.addEventListener("DOMContentLoaded", () => {
  renderVocab();
  $("#start-quiz").addEventListener("click", startQuiz);
  $("#retry").addEventListener("click", startQuiz);
  $("#back-home").addEventListener("click", () => showView("home"));
  $("#back-home-2").addEventListener("click", () => showView("home"));
  // Preload voices (some browsers need this kick)
  if (window.speechSynthesis) window.speechSynthesis.getVoices();
});
