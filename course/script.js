/* ── COURSE DATA ─────────────────────────────────────────── */
const courses = {
  en: [
    { title: "1 – Intro – LLM & Prompting Course", url: "https://www.youtube.com/embed/loR3YipFiE4", pdf: "" },
    { title: "2 – The LLM Playground",             url: "https://www.youtube.com/embed/9i4ibykxEj4", pdf: "" },
    { title: "3 – How LLMs Work",                  url: "https://www.youtube.com/embed/AJz_GWtN3H8", pdf: "" },
    { title: "4 – Basic Rules",                    url: "https://www.youtube.com/embed/wfkdshwAyr0", pdf: "" },
    { title: "5 – Thinking Models vs Assistants",  url: "https://www.youtube.com/embed/jjBR6kI44Rc", pdf: "" },
    { title: "6 – A Tool that Uses Tools",         url: "https://www.youtube.com/embed/jI5jNC_KPdg", pdf: "" },
    { title: "7 – Talking to ChatGPT",             url: "https://www.youtube.com/embed/uR9mrVGZx7k", pdf: "" },
    { title: "8 – The OpenAI App",                 url: "https://www.youtube.com/embed/uuxU_jT2KSM", pdf: "" },
    { title: "9 – ChatGPT Memory",                 url: "https://www.youtube.com/embed/9ay1lsZ1ndQ", pdf: "" },
    { title: "10 – Explaining CustomGPTs",         url: "https://www.youtube.com/embed/Juu7ZgbxocY", pdf: "" },
    { title: "11 – Explaining NotebookLM",         url: "https://www.youtube.com/embed/lfDQkDcEHts", pdf: "" },
    { title: "12 – Generating Images with Sora",   url: "https://www.youtube.com/embed/DH5u_J1fEdg", pdf: "" },
    { title: "13 – Disclaimer",                    url: "https://www.youtube.com/embed/cU_1h87Tr0w", pdf: "" },
    { title: "14 – Prompt-Engineering Techniques", url: "https://www.youtube.com/embed/cHjbuVNtA3I",
      pdf: "https://drive.google.com/file/d/1RO86INTjbQxBpBh5Se6vcONWRp2dhemL/view?usp=sharing" }
  ],
  de: [
    { title: "1 – Intro – LLM & Prompting Kurs",           url: "https://www.youtube.com/embed/vy6riqBRpSc", pdf: "" },
    { title: "2 – Das LLM-Spielfeld",                      url: "https://www.youtube.com/embed/l7O4bXIqcAA", pdf: "" },
    { title: "3 – Wie funktioniert ChatGPT",               url: "https://www.youtube.com/embed/w8mUC-OXk88", pdf: "" },
    { title: "4 – Basis-Regeln",                           url: "https://www.youtube.com/embed/fcqEBu7YcT8", pdf: "" },
    { title: "5 – Denkende vs assistierende Modelle",      url: "https://www.youtube.com/embed/VxZAbQX2xWU", pdf: "" },
    { title: "6 – Ein Tool, das Tools verwendet",          url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "7 – Mit ChatGPT sprechen",                   url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "8 – Die OpenAI-App",                         url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "9 – ChatGPTs Gedächtnis",                    url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "10 – CustomGPTs erklärt",                    url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "11 – NotebookLM erklärt",                    url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "12 – Bilder generieren mit Sora",            url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "13 – Der KI-Wahn",                           url: "https://www.youtube.com/embed/BvCOZrqGyNU", pdf: "" },
    { title: "14 – Prompt-Engineering-Techniken",          url: "https://www.youtube.com/embed/BvCOZrqGyNU",
      pdf: "https://drive.google.com/file/d/1D8lGa22Y_ndbxv0ifRIe741PUjk3Ttge/view?usp=sharing" }
  ]
};

/* ── UI TEXT ──────────────────────────────────────────────── */
const ui = {
  en: {
    prev:   "Previous",
    next:   "Next",
    finish: "Finish 🎉",
    pdf:    "Download PDF",
    doneT:  "Well done – you’ve finished the course!",
    doneM:  "You can close this tab or switch language to start again."
  },
  de: {
    prev:   "Zurück",
    next:   "Weiter",
    finish: "Fertig 🎉",
    pdf:    "PDF herunterladen",
    doneT:  "Gut gemacht – du hast den Kurs abgeschlossen!",
    doneM:  "Du kannst diesen Tab schließen oder die Sprache wechseln, um neu zu starten."
  }
};

/* ── STATE & DOM ─────────────────────────────────────────── */
let lang  = "en";
let index = 0;

const frame      = document.getElementById("video-frame");
const titleEl    = document.getElementById("video-title");
const summaryEl  = document.getElementById("video-summary");
const pdfLink    = document.getElementById("pdf-link");
const prevBtn    = document.getElementById("prev-btn");
const nextBtn    = document.getElementById("next-btn");
const finishBtn  = document.getElementById("finish-btn");
const counter    = document.getElementById("counter");
const doneTitle  = document.getElementById("done-title");
const doneMsg    = document.getElementById("done-msg");
const playerWrap = document.getElementById("player");
const doneScreen = document.getElementById("complete-screen");
const langBtns   = document.querySelectorAll(".lang-toggle button");

/* ── HELPERS ─────────────────────────────────────────────── */
const lessons = () => courses[lang];
const text    = () => ui[lang];

function updateButtons() {
  /* slide-specific visibility */
  const first = index === 0;
  const last  = index === lessons().length - 1;

  prevBtn.hidden   = first;
  nextBtn.hidden   = last;
  finishBtn.hidden = !last;
}

function translateStaticUI() {
  prevBtn.textContent   = text().prev;
  nextBtn.textContent   = text().next;
  finishBtn.textContent = text().finish;
  pdfLink.textContent   = text().pdf;
  doneTitle.textContent = text().doneT;
  doneMsg.textContent   = text().doneM;
}

/* ── CORE ────────────────────────────────────────────────── */
function loadLesson(i) {
  const l = lessons()[i];

  /* iframe src – no autoplay to avoid black screen */
  frame.src = `${l.url}?rel=0&modestbranding=1&playsinline=1`;

  titleEl.textContent   = l.title;
  summaryEl.textContent = "";          // (no summaries provided)
  counter.textContent   = `${i + 1} / ${lessons().length}`;

  /* PDF only on slide 14 (last) */
  if (i === lessons().length - 1 && l.pdf) {
    pdfLink.href   = l.pdf;
    pdfLink.hidden = false;
  } else {
    pdfLink.hidden = true;
  }

  updateButtons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── LISTENERS ───────────────────────────────────────────── */
prevBtn.addEventListener("click", () => { if (index > 0)               loadLesson(--index); });
nextBtn.addEventListener("click", () => { if (index < lessons().length-1) loadLesson(++index); });
finishBtn.addEventListener("click", () => {
  playerWrap.hidden = true;
  doneScreen.hidden = false;
});

langBtns.forEach(btn => btn.addEventListener("click", () => {
  const l = btn.dataset.lang;
  if (l !== lang) {
    lang = l;
    index = 0;
    langBtns.forEach(b => b.classList.toggle("active", b === btn));
    document.documentElement.lang = lang;
    translateStaticUI();
    playerWrap.hidden = false;
    doneScreen.hidden = true;
    loadLesson(index);
  }
}));

/* ── INIT ────────────────────────────────────────────────── */
translateStaticUI();
loadLesson(index);
