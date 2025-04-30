/* ----------  COURSE DATA  ---------- */
const courses = {
  en: [
    { title: "1 - Intro – LLM & Prompting Course",  url: "https://www.youtube.com/embed/loR3YipFiE4", summary: "", pdf: "" },
    { title: "2 - The LLM Playground",              url: "https://www.youtube.com/embed/9i4ibykxEj4", summary: "", pdf: "" },
    { title: "3 - How LLMs Work",                   url: "https://www.youtube.com/embed/AJz_GWtN3H8", summary: "", pdf: "" },
    { title: "4 - Basic Rules",                     url: "https://www.youtube.com/embed/wfkdshwAyr0", summary: "", pdf: "" },
    { title: "5 - Thinking Models vs. Assistants",  url: "https://www.youtube.com/embed/jjBR6kI44Rc", summary: "", pdf: "" },
    { title: "6 - A Tool that Uses Tools",          url: "https://www.youtube.com/embed/jI5jNC_KPdg", summary: "", pdf: "" },
    { title: "7 - Talking to ChatGPT",              url: "https://www.youtube.com/embed/uR9mrVGZx7k", summary: "", pdf: "" },
    { title: "8 - The OpenAI App",                  url: "https://www.youtube.com/embed/uuxU_jT2KSM", summary: "", pdf: "" },
    { title: "9 - ChatGPT's Memory",                url: "https://www.youtube.com/embed/9ay1lsZ1ndQ", summary: "", pdf: "" },
    { title: "10 - Explaining CustomGPTs",          url: "https://www.youtube.com/embed/Juu7ZgbxocY", summary: "", pdf: "" },
    { title: "11 - Explaining NotebookLM",          url: "https://www.youtube.com/embed/lfDQkDcEHts", summary: "", pdf: "" },
    { title: "12 - Generating Images with Sora",    url: "https://www.youtube.com/embed/DH5u_J1fEdg", summary: "", pdf: "" },
    { title: "13 - Disclaimer",                     url: "https://www.youtube.com/embed/cU_1h87Tr0w", summary: "", pdf: "" },
    {
      title: "14 - Prompt Engineering Techniques",
      url: "https://www.youtube.com/embed/cHjbuVNtA3I",
      summary: "",
      pdf: "https://drive.google.com/file/d/1RO86INTjbQxBpBh5Se6vcONWRp2dhemL/view?usp=sharing"
    }
  ],

  de: [
    { title: "1 - Intro – LLM & Prompting Kurs",  url: "https://www.youtube.com/embed/vy6riqBRpSc", summary: "", pdf: "" },
    { title: "2 - Das LLM Spielfeld",             url: "https://www.youtube.com/embed/l7O4bXIqcAA", summary: "", pdf: "" },
    { title: "3 - Wie funktioniert ChatGPT",      url: "https://www.youtube.com/embed/w8mUC-OXk88", summary: "", pdf: "" },
    { title: "4 - Basis Regeln",                  url: "https://www.youtube.com/embed/fcqEBu7YcT8", summary: "", pdf: "" },
    { title: "5 - Denkende vs. assistierende Modelle", url: "https://www.youtube.com/embed/VxZAbQX2xWU", summary: "", pdf: "" },
    { title: "6 - Ein Tool, das Tools verwendet", url: "https://www.youtube.com/embed/0ovxDd5UNPg", summary: "", pdf: "" },
    { title: "7 - Mit ChatGPT sprechen",          url: "https://www.youtube.com/embed/gjz7qc4rarM", summary: "", pdf: "" },
    { title: "8 - Die OpenAI-App",                url: "https://www.youtube.com/embed/P3UlRVyyuRQ", summary: "", pdf: "" },
    { title: "9 - ChatGPTs Gedächtnis",           url: "https://www.youtube.com/embed/Tb-umne2in0", summary: "", pdf: "" },
    { title: "10 - CustomGPTs erklärt",           url: "https://www.youtube.com/embed/LLdg_wuMKrs", summary: "", pdf: "" },
    { title: "11 - NotebookLM erklärt",           url: "https://www.youtube.com/embed/Ym9FYNsyfP0", summary: "", pdf: "" },
    { title: "12 - Bilder generieren mit Sora",   url: "https://www.youtube.com/embed/EAYvp7j5kZ0", summary: "", pdf: "" },
    { title: "13 - Der KI-Wahn",                  url: "https://www.youtube.com/embed/CrqClGBEd8k", summary: "", pdf: "" },
    {
      title: "14 - Prompt-Engineering-Techniken",
      url: "https://www.youtube.com/embed/bDqJ_DdjzhI",
      summary: "",
      pdf: "https://drive.google.com/file/d/1D8lGa22Y_ndbxv0ifRIe741PUjk3Ttge/view?usp=sharing"
    }
  ]
};


/* ----------  STATE & DOM  ---------- */
let currentLang = "en";
let index = 0;

const frame = document.getElementById("video-frame");
const titleEl = document.getElementById("video-title");
const summEl = document.getElementById("video-summary");
const pdfLink = document.getElementById("pdf-link");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const finishBtn = document.getElementById("finish-btn");
const counter = document.getElementById("counter");
const langBtns = document.querySelectorAll(".lang-toggle button");
const finalPage = document.getElementById("final-page");

/* ----------  RENDERING  ---------- */
function currentList() {
  return courses[currentLang];
}

function loadVideo(i) {
  const vid = currentList()[i];
  const isFirstSlide = i === 0;
  const isLastSlide = i === currentList().length - 1;

  frame.src = vid.url + "?rel=0";
  titleEl.textContent = vid.title;
  summEl.textContent = vid.summary || " ";

  if (vid.pdf) {
    pdfLink.href = vid.pdf;
    pdfLink.style.display = "inline-block";
  } else {
    pdfLink.style.display = "none";
  }

  counter.textContent = `${i + 1} / ${currentList().length}`;

  prevBtn.disabled = isFirstSlide;
  prevBtn.style.visibility = isFirstSlide ? "hidden" : "visible";
  prevBtn.style.display = "inline-block";

  nextBtn.disabled = isLastSlide;
  nextBtn.style.visibility = isLastSlide ? "hidden" : "visible";
  nextBtn.style.display = "inline-block";

  finishBtn.style.visibility = isLastSlide ? "visible" : "hidden";
  finishBtn.style.display = "inline-block";
}

/* ----------  NAVIGATION  ---------- */
function next() {
  if (index < currentList().length - 1) {
    index++;
    loadVideo(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prev() {
  if (index > 0) {
    index--;
    loadVideo(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function finish() {
  finalPage.classList.remove("hidden");
}

function closeFinalPage() {
  finalPage.classList.add("hidden");
}

/* ----------  LANGUAGE SWITCH  ---------- */
langBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    if (lang !== currentLang) {
      currentLang = lang;
      index = 0;
      langBtns.forEach(b => b.classList.toggle("active", b === btn));
      loadVideo(index);
      document.documentElement.lang = lang;
    }
  });
});

/* ----------  INIT  ---------- */
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
finishBtn.addEventListener("click", finish);

finalPage.addEventListener("click", (e) => {
  if (e.target === finalPage) {
    closeFinalPage();
  }
});

loadVideo(index);
