/* ========== COURSE DATA ========== */
const courses = {
  en: [
    { title: "1 – Intro – LLM & Prompting Course", url: "https://www.youtube.com/embed/loR3YipFiE4", summary: "", pdf: "" },
    { title: "2 – The LLM Playground",              url: "https://www.youtube.com/embed/9i4ibykxEj4", summary: "", pdf: "" },
    { title: "3 – How LLMs Work",                   url: "https://www.youtube.com/embed/AJz_GWtN3H8", summary: "", pdf: "" },
    { title: "4 – Basic Rules",                     url: "https://www.youtube.com/embed/wfkdshwAyr0", summary: "", pdf: "" },
    { title: "5 – Thinking Models vs. Assistants",  url: "https://www.youtube.com/embed/jjBR6kI44Rc", summary: "", pdf: "" },
    { title: "6 – A Tool that Uses Tools",          url: "https://www.youtube.com/embed/jI5jNC_KPdg", summary: "", pdf: "" },
    { title: "7 – Talking to ChatGPT",              url: "https://www.youtube.com/embed/uR9mrVGZx7k", summary: "", pdf: "" },
    { title: "8 – The OpenAI App",                  url: "https://www.youtube.com/embed/uuxU_jT2KSM", summary: "", pdf: "" },
    { title: "9 – ChatGPT's Memory",                url: "https://www.youtube.com/embed/9ay1lsZ1ndQ", summary: "", pdf: "" },
    { title: "10 – Explaining CustomGPTs",          url: "https://www.youtube.com/embed/Juu7ZgbxocY", summary: "", pdf: "" },
    { title: "11 – Explaining NotebookLM",          url: "https://www.youtube.com/embed/lfDQkDcEHts", summary: "", pdf: "" },
    { title: "12 – Generating Images with Sora",    url: "https://www.youtube.com/embed/DH5u_J1fEdg", summary: "", pdf: "" },
    { title: "13 – Disclaimer",                     url: "https://www.youtube.com/embed/cU_1h87Tr0w", summary: "", pdf: "" },
    { title: "14 – Prompt Engineering Techniques",  url: "https://www.youtube.com/embed/cHjbuVNtA3I",
      summary: "", pdf: "https://drive.google.com/file/d/1RO86INTjbQxBpBh5Se6vcONWRp2dhemL/view?usp=sharing" }
  ],

  de: [
    { title: "1 – Intro – LLM & Prompting Kurs",    url: "https://www.youtube.com/embed/vy6riqBRpSc", summary: "", pdf: "" },
    { title: "2 – Das LLM-Spielfeld",               url: "https://www.youtube.com/embed/l7O4bXIqcAA", summary: "", pdf: "" },
    { title: "3 – Wie funktioniert ChatGPT",        url: "https://www.youtube.com/embed/w8mUC-OXk88", summary: "", pdf: "" },
    { title: "4 – Basis-Regeln",                    url: "https://www.youtube.com/embed/fcqEBu7YcT8", summary: "", pdf: "" },
    { title: "5 – Denkende vs. assistierende Modelle",url:"https://www.youtube.com/embed/VxZAbQX2xWU",summary:"",pdf:"" },
    { title: "6 – Ein Tool, das Tools verwendet",   url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "7 – Mit ChatGPT sprechen",            url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "8 – Die OpenAI-App",                  url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "9 – ChatGPTs Gedächtnis",             url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "10 – CustomGPTs erklärt",             url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "11 – NotebookLM erklärt",             url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "12 – Bilder generieren mit Sora",     url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "13 – Der KI-Wahn",                    url: "https://www.youtube.com/embed/BvCOZrqGyNU", summary: "", pdf: "" },
    { title: "14 – Prompt-Engineering-Techniken",   url: "https://www.youtube.com/embed/BvCOZrqGyNU",
      summary: "", pdf: "https://drive.google.com/file/d/1D8lGa22Y_ndbxv0ifRIe741PUjk3Ttge/view?usp=sharing" }
  ]
};

/* ========== STATE & DOM ========== */
let currentLang = "en";
let index       = 0;

const frame      = document.getElementById("video-frame");
const titleEl    = document.getElementById("video-title");
const summaryEl  = document.getElementById("video-summary");
const pdfLink    = document.getElementById("pdf-link");
const prevBtn    = document.getElementById("prev-btn");
const nextBtn    = document.getElementById("next-btn");
const finishBtn  = document.getElementById("finish-btn");
const counterEl  = document.getElementById("counter");
const langBtns   = document.querySelectorAll(".lang-toggle button");
const playerWrap = document.getElementById("player");
const doneScreen = document.getElementById("complete-screen");

/* ---------- Progress persistence ---------- */
let progress = { en: new Array(courses.en.length).fill(false),
                 de: new Array(courses.de.length).fill(false) };

try {
  const stored = JSON.parse(localStorage.getItem("wg-course-progress") || "{}");
  ["en","de"].forEach(lang=>{
    if (Array.isArray(stored[lang])) {
      // auto-extend if we added new lessons
      progress[lang] = stored[lang].concat(
        new Array(Math.max(0, courses[lang].length - stored[lang].length)).fill(false)
      );
    }
  });
} catch { /* ignore corrupted storage */ }

function saveProgress(){
  localStorage.setItem("wg-course-progress", JSON.stringify(progress));
}

/* ---------- Helpers ---------- */
const list = () => courses[currentLang];

/* ---------- Core ---------- */
function loadVideo(i){
  const lesson = list()[i];
  const last   = i === list().length - 1;

  // mark as watched
  progress[currentLang][i] = true;
  saveProgress();

  /* Build a clean embed URL */
  const src = `${lesson.url}?rel=0&modestbranding=1&playsinline=1`;
  frame.src = src;

  // content
  titleEl.textContent   = lesson.title;
  summaryEl.textContent = lesson.summary || "";

  // pdf
  if (lesson.pdf){
    pdfLink.href   = lesson.pdf;
    pdfLink.hidden = false;
  } else {
    pdfLink.hidden = true;
  }

  // progress & buttons
  counterEl.textContent = `${i + 1} / ${list().length}`;

  prevBtn.disabled  = i === 0;
  nextBtn.disabled  = last;
  finishBtn.hidden  = !last;

  // screens
  doneScreen.hidden = true;
  playerWrap.hidden = false;
}

/* ---------- Navigation ---------- */
prevBtn.addEventListener("click", () => { if (index > 0) loadVideo(--index); });
nextBtn.addEventListener("click", () => { if (index < list().length - 1) loadVideo(++index); });
finishBtn.addEventListener("click", () => {
  playerWrap.hidden = true;
  doneScreen.hidden = false;
});

/* ---------- Language switch ---------- */
langBtns.forEach(btn => btn.addEventListener("click", ()=>{
  const lang = btn.dataset.lang;
  if (lang !== currentLang){
    currentLang = lang;
    index = 0;
    langBtns.forEach(b => b.classList.toggle("active", b === btn));
    document.documentElement.lang = lang;
    loadVideo(index);
  }
}));

/* ---------- Kick-off ---------- */
loadVideo(index);
