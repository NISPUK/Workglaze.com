document.addEventListener("DOMContentLoaded", () => {
  // === DARK MODE TOGGLE ===
  const darkModeToggle = document.querySelector(".dark-mode-toggle");
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Swap icon paths for "sun" vs "moon"
    const svgPath = darkModeToggle.querySelector("svg path");
    if (document.body.classList.contains("dark-mode")) {
      // Sun icon (single-line path)
      svgPath.setAttribute(
        "d",
        "M5.64 4.22l-.7-.7a.75.75 0 011.06-1.06l.7.7a.75.75 0 11-1.06 1.06zm12.72-.7l.7.7a.75.75 0 11-1.06 1.06l-.7-.7a.75.75 0 011.06-1.06zm1.94 8.73h1a.75.75 0 010 1.5h-1a.75.75 0 010-1.5zm-16 0a.75.75 0 010 1.5H3.5a.75.75 0 010-1.5h.8zm12.57 5.36l.7.7a.75.75 0 11-1.06 1.06l-.7-.7a.75.75 0 111.06-1.06zm-10.5.7l-.7.7a.75.75 0 01-1.06-1.06l.7-.7a.75.75 0 011.06 1.06zM12 6.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0-3a.75.75 0 01.75-.75h0c.41 0 .75.34.75.75v1a.75.75 0 01-1.5 0v-1zm0 14a.75.75 0 011.5 0v1a.75.75 0 01-1.5 0v-1z"
      );
    } else {
      // Moon icon (single-line path)
      svgPath.setAttribute(
        "d",
        "M21.75 14.47A9.53 9.53 0 0110.53 3.25a.75.75 0 01-.69-1 10.5 10.5 0 1011.91 12.68.75.75 0 01-1-.69z"
      );
    }
  });

  // === YOUTUBE VIDEO PREVIEW ===
  const videoContainer = document.querySelector(".video-container");
  const preview = document.getElementById("youtubePreview");
  const video = document.getElementById("demoVideo");
  if (videoContainer && preview && video) {
    videoContainer.addEventListener("click", () => {
      video.src = video.getAttribute("data-src");
      preview.style.opacity = "0";
      setTimeout(() => {
        preview.style.display = "none";
      }, 300);
    });
  }

  // === GO TO TOP BUTTON (FIX) ===
  const goTopBtn = document.querySelector(".go-top-button");
  if (goTopBtn) {
    goTopBtn.addEventListener("click", () => {
      document.documentElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
