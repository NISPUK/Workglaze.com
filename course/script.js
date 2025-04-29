/* --------------  COURSE DATA -------------- */
const courseVideos = [
  {
    title: "1 - Intro – LLM & Prompting Course",
    url: "https://www.youtube.com/embed/loR3YipFiE4",
    summary: "A quick orientation to what large-language models are and how this course is structured.",
    pdf: ""
  },
  {
    title: "2 - The LLM Playground",
    url: "https://www.youtube.com/embed/9i4ibykxEj4",
    summary: "",
    pdf: ""
  },
  {
    title: "3 - How LLMs Work",
    url: "https://www.youtube.com/embed/AJz_GWtN3H8",
    summary: "",
    pdf: ""
  },
  {
    title: "4 - Basic Rules",
    url: "https://www.youtube.com/embed/wfkdshwAyr0",
    summary: "",
    pdf: ""
  },
  {
    title: "5 - Thinking Models vs. Assistants",
    url: "https://www.youtube.com/embed/jjBR6kI44Rc",
    summary: "",
    pdf: ""
  },
  {
    title: "6 - A Tool that Uses Tools",
    url: "https://www.youtube.com/embed/jI5jNC_KPdg",
    summary: "",
    pdf: ""
  },
  {
    title: "7 - Talking to ChatGPT",
    url: "https://www.youtube.com/embed/uR9mrVGZx7k",
    summary: "",
    pdf: ""
  },
  {
    title: "8 - The OpenAI App",
    url: "https://www.youtube.com/embed/uuxU_jT2KSM",
    summary: "",
    pdf: ""
  },
  {
    title: "9 - ChatGPT’s Memory",
    url: "https://www.youtube.com/embed/9ay1lsZ1ndQ",
    summary: "",
    pdf: ""
  },
  {
    title: "10 - Explaining CustomGPTs",
    url: "https://www.youtube.com/embed/Juu7ZgbxocY",
    summary: "",
    pdf: ""
  },
  {
    title: "11 - Explaining NotebookLM",
    url: "https://www.youtube.com/embed/lfDQkDcEHts",
    summary: "",
    pdf: ""
  },
  {
    title: "12 - Generating Images with Sora",
    url: "https://www.youtube.com/embed/DH5u_J1fEdg",
    summary: "",
    pdf: ""
  },
  {
    title: "13 - Disclaimer",
    url: "https://www.youtube.com/embed/cU_1h87Tr0w",
    summary: "",
    pdf: ""
  },
  {
    title: "14 - Prompt Engineering Techniques",
    url: "https://www.youtube.com/embed/cHjbuVNtA3I",
    summary: "",
    pdf: ""
  }
];

/* --------------  STATE -------------- */
let index = 0;

/* --------------  DOM -------------- */
const frame   = document.getElementById("video-frame");
const titleEl = document.getElementById("video-title");
const summEl  = document.getElementById("video-summary");
const pdfLink = document.getElementById("pdf-link");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const counter = document.getElementById("counter");

/* --------------  FUNCTIONS -------------- */
function loadVideo(i) {
  const vid = courseVideos[i];
  frame.src      = vid.url + "?rel=0";
  titleEl.textContent = vid.title;
  summEl.textContent  = vid.summary || " "; // keep height even if empty

  if (vid.pdf) {
    pdfLink.href = vid.pdf;
    pdfLink.style.display = "inline-block";
  } else {
    pdfLink.style.display = "none";
  }

  // Counter & button states
  counter.textContent = `${i + 1} / ${courseVideos.length}`;
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === courseVideos.length - 1;
}

function next() {
  if (index < courseVideos.length - 1) {
    index += 1;
    loadVideo(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function prev() {
  if (index > 0) {
    index -= 1;
    loadVideo(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* --------------  INIT -------------- */
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
loadVideo(index);
