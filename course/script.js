/* ----------  COURSE DATA  ---------- */
const placeholder = "https://www.youtube.com/embed/BvCOZrqGyNU";

const courses = {
  en: [
    { title: "1 - Intro – LLM & Prompting Course",  url: "https://www.youtube.com/embed/loR3YipFiE4", summary: "", pdf: "" },
    { title: "2 - The LLM Playground",            url: "https://www.youtube.com/embed/9i4ibykxEj4", summary: "", pdf: "" },
    { title: "3 - How LLMs Work",                 url: "https://www.youtube.com/embed/AJz_GWtN3H8", summary: "", pdf: "" },
    { title: "4 - Basic Rules",                   url: "https://www.youtube.com/embed/wfkdshwAyr0", summary: "", pdf: "" },
    { title: "5 - Thinking Models vs. Assistants",url: "https://www.youtube.com/embed/jjBR6kI44Rc", summary: "", pdf: "" },
    { title: "6 - A Tool that Uses Tools",        url: "https://www.youtube.com/embed/jI5jNC_KPdg", summary: "", pdf: "" },
    { title: "7 - Talking to ChatGPT",            url: "https://www.youtube.com/embed/uR9mrVGZx7k", summary: "", pdf: "" },
    { title: "8 - The OpenAI App",                url: "https://www.youtube.com/embed/uuxU_jT2KSM", summary: "", pdf: "" },
    { title: "9 - ChatGPT’s Memory",              url: "https://www.youtube.com/embed/9ay1lsZ1ndQ", summary: "", pdf: "" },
    { title: "10 - Explaining CustomGPTs",        url: "https://www.youtube.com/embed/Juu7ZgbxocY", summary: "", pdf: "" },
    { title: "11 - Explaining NotebookLM",        url: "https://www.youtube.com/embed/lfDQkDcEHts", summary: "", pdf: "" },
    { title: "12 - Generating Images with Sora",  url: "https://www.youtube.com/embed/DH5u_J1fEdg", summary: "", pdf: "" },
    { title: "13 - Disclaimer",                   url: "https://www.youtube.com/embed/cU_1h87Tr0w", summary: "", pdf: "" },
    { title: "14 - Prompt Engineering Techniques",url: "https://www.youtube.com/embed/cHjbuVNtA3I", summary: "",
      pdf: "../img/Workglaze Prompt Engineering Guide.pdf" }
  ],

  de: [
    { title: "1 - Intro – LLM & Prompting Kurs",  url: "https://www.youtube.com/embed/vy6riqBRpSc", summary: "", pdf: "" },
    { title: "2 - Das LLM Spielfeld",            url: "https://www.youtube.com/embed/l7O4bXIqcAA", summary: "", pdf: "" },
    { title: "3 - Wie funktioniert ChatGPT",      url: "https://www.youtube.com/embed/w8mUC-OXk88", summary: "", pdf: "" },
    { title: "4 - Basis Regeln",                  url: "https://www.youtube.com/embed/fcqEBu7YcT8", summary: "", pdf: "" },
    { title: "5 - Denkende vs. assistierende Modelle", url: "https://www.youtube.com/embed/VxZAbQX2xWU", summary: "", pdf: "" },
    { title: "6 - Ein Tool, das Tools verwendet", url: placeholder, summary: "", pdf: "" },
    { title: "7 - Mit ChatGPT sprechen",          url: placeholder, summary: "", pdf: "" },
    { title: "8 - Die OpenAI-App",                url: placeholder, summary: "", pdf: "" },
    { title: "9 - ChatGPTs Gedächtnis",           url: placeholder, summary: "", pdf: "" },
    { title: "10 - CustomGPTs erklärt",           url: placeholder, summary: "", pdf: "" },
    { title: "11 - NotebookLM erklärt",           url: placeholder, summary: "", pdf: "" },
    { title: "12 - Bilder generieren mit Sora",   url: placeholder, summary: "", pdf: "" },
    { title: "13 - Der KI-Wahn",                  url: placeholder, summary: "", pdf: "" },
    { title: "14 - Prompt-Engineering-Techniken", url: placeholder, summary: "",
      pdf: "img/Workglaze%20Prompt%20Engineering%20Anleitung.pdf" }
  ]
};

/* ----------  STATE & DOM  ---------- */
let currentLang = "en";
let index       = 0;

const frame    = document.getElementById("video-frame");
const titleEl  = document.getElementById("video-title");
const summEl   = document.getElementById("video-summary");
const pdfLink  = document.getElementById("pdf-link");
const prevBtn  = document.getElementById("prev-btn");
const nextBtn  = document.getElementById("next-btn");
const counter  = document.getElementById("counter");
const langBtns = document.querySelectorAll(".lang-toggle button");

/* ----------  RENDERING  ---------- */
function currentList() { return courses[currentLang]; }

function loadVideo(i) {
  const vid = currentList()[i];

  frame.src          = vid.url + "?rel=0";
  titleEl.textContent = vid.title;
  summEl.textContent  = vid.summary || " ";

  if (vid.pdf) {
    pdfLink.href = vid.pdf;
    pdfLink.style.display = "inline-block";
  } else {
    pdfLink.style.display = "none";
  }

  counter.textContent = `${i + 1} / ${currentList().length}`;
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === currentList().length - 1;
}

/* ----------  NAVIGATION  ---------- */
function next() {
  if (index < currentList().length - 1) {
    index++; loadVideo(index); window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function prev() {
  if (index > 0) {
    index--; loadVideo(index); window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ----------  LANGUAGE SWITCH  ---------- */
langBtns.forEach(btn=>{
  btn.addEventListener("click", ()=> {
    const lang = btn.dataset.lang;
    if (lang !== currentLang) {
      currentLang = lang;
      index = 0;
      langBtns.forEach(b=>b.classList.toggle("active", b===btn));
      loadVideo(index);
      document.documentElement.lang = lang; // <html lang="">
    }
  });
});

/* ----------  INIT  ---------- */
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
loadVideo(index);
